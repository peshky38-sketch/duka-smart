
import base64
import json
import os
import re
import urllib.error
import urllib.request
import uuid

from datetime import datetime, timezone, timedelta
from decimal import Decimal, InvalidOperation

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError

from app.extensions import db
from app.models import User, Product, Sale, SaleItem, MpesaPayment


mpesa = Blueprint("mpesa", __name__)


def _env(name, default=""):
    return os.getenv(name, default).strip()


def _base_url():
    environment = _env("MPESA_ENV", "sandbox").lower()

    if environment == "production":
        return "https://api.safaricom.co.ke"

    return "https://sandbox.safaricom.co.ke"


def _configured():
    required = [
        "MPESA_CONSUMER_KEY",
        "MPESA_CONSUMER_SECRET",
        "MPESA_SHORTCODE",
        "MPESA_PASSKEY",
        "MPESA_CALLBACK_URL"
    ]

    if not all(_env(key) for key in required):
        return False

    if _env("MPESA_ENV", "sandbox").lower() not in (
        "sandbox", "production"
    ):
        return False

    if _env(
        "MPESA_TRANSACTION_TYPE",
        "CustomerPayBillOnline"
    ) != "CustomerPayBillOnline":
        return False

    return _env("MPESA_CALLBACK_URL").startswith("https://")


def clean_phone(raw):
    digits = re.sub(r"[\s\-\+]", "", str(raw or ""))

    if re.fullmatch(r"0[17]\d{8}", digits):
        digits = "254" + digits[1:]

    if re.fullmatch(r"254[17]\d{8}", digits):
        return digits

    return None


def _call(method, url, body=None, headers=None):
    data = json.dumps(body).encode() if body is not None else None

    req = urllib.request.Request(
        url,
        data=data,
        method=method,
        headers=headers or {}
    )

    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            raw = response.read()
            result = json.loads(raw) if raw else {}
            return response.status, result

    except urllib.error.HTTPError as error:
        try:
            result = json.loads(error.read() or b"{}")
        except (ValueError, TypeError):
            result = {}

        return error.code, result

    except (urllib.error.URLError, TimeoutError, ValueError):
        return 0, {}


def _token():
    credentials = (
        _env("MPESA_CONSUMER_KEY")
        + ":"
        + _env("MPESA_CONSUMER_SECRET")
    )

    auth = "Basic " + base64.b64encode(
        credentials.encode()
    ).decode()

    status, data = _call(
        "GET",
        _base_url() + "/oauth/v1/generate?grant_type=client_credentials",
        headers={"Authorization": auth}
    )

    if status == 200:
        return data.get("access_token")

    return None


def _password():
    east_africa = timezone(timedelta(hours=3))
    stamp = datetime.now(east_africa).strftime("%Y%m%d%H%M%S")

    raw = (
        _env("MPESA_SHORTCODE")
        + _env("MPESA_PASSKEY")
        + stamp
    )

    password = base64.b64encode(raw.encode()).decode()

    return password, stamp


def _user():
    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None

    return User.query.filter_by(id=user_id).first()


def _prepare_items(items, business_id):
    if not isinstance(items, list) or not items:
        raise ValueError("A sale must contain at least one item")

    prepared = []
    seen = set()
    total = Decimal("0")

    for item in items:
        if not isinstance(item, dict):
            raise ValueError("Each item must be an object")

        product_id = item.get("product_id")
        quantity = item.get("quantity")

        if (
            not isinstance(product_id, int)
            or isinstance(product_id, bool)
            or product_id <= 0
        ):
            raise ValueError("Invalid product ID")

        if (
            not isinstance(quantity, int)
            or isinstance(quantity, bool)
            or quantity <= 0
        ):
            raise ValueError("Quantity must be a positive integer")

        if product_id in seen:
            raise ValueError("Duplicate products are not allowed")

        seen.add(product_id)

        product = Product.query.filter_by(
            id=product_id,
            business_id=business_id
        ).first()

        if product is None:
            raise ValueError(f"Product {product_id} not found")

        if quantity > product.quantity:
            raise ValueError(
                f"Insufficient stock for {product.product_name}"
            )

        price = Decimal(str(product.selling_price))
        subtotal = price * quantity
        total += subtotal

        prepared.append({
            "product_id": product.id,
            "quantity": quantity,
            "unit_price": str(price),
            "subtotal": str(subtotal)
        })

    if total != total.to_integral_value():
        raise ValueError(
            "M-Pesa payments must have a whole-number KES total"
        )

    return prepared, total


def _create_sale(payment):
    if payment.sale_id is not None:
        return payment.sale_id

    total = Decimal(str(payment.amount))
    locked_products = {}

    for item in sorted(
        payment.items,
        key=lambda x: x["product_id"]
    ):
        product = Product.query.filter_by(
            id=item["product_id"],
            business_id=payment.business_id
        ).with_for_update().first()

        if product is None:
            raise ValueError("A purchased product no longer exists")

        if item["quantity"] > product.quantity:
            raise ValueError(
                "Payment received, but stock is insufficient. "
                "Manual review is required."
            )

        locked_products[product.id] = product

    sale = Sale(
        sale_number="SALE-" + uuid.uuid4().hex[:10].upper(),
        total_amount=total,
        payment_method="M-Pesa",
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        business_id=payment.business_id
    )

    db.session.add(sale)
    db.session.flush()

    for item in payment.items:
        product = locked_products[item["product_id"]]

        product.quantity -= item["quantity"]

        sale_item = SaleItem(
            sale_id=sale.id,
            product_id=product.id,
            quantity=item["quantity"],
            unit_price=Decimal(item["unit_price"]),
            subtotal=Decimal(item["subtotal"])
        )

        db.session.add(sale_item)

    payment.sale_id = sale.id

    return sale.id


def _query_stk(checkout_id):
    token = _token()

    if not token:
        return 0, {}

    password, stamp = _password()

    body = {
        "BusinessShortCode": _env("MPESA_SHORTCODE"),
        "Password": password,
        "Timestamp": stamp,
        "CheckoutRequestID": checkout_id
    }

    return _call(
        "POST",
        _base_url() + "/mpesa/stkpushquery/v1/query",
        body,
        {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    )


def _extract_metadata(callback_data):
    items = (
        callback_data.get("CallbackMetadata", {}).get("Item", [])
    )

    metadata = {}

    for item in items:
        if isinstance(item, dict) and "Name" in item:
            metadata[item["Name"]] = item.get("Value")

    return metadata


def _save_callback(payment_id, callback_data):
    if not isinstance(callback_data, dict):
        return False

    payment = MpesaPayment.query.filter_by(
        id=payment_id
    ).with_for_update().first()

    if payment is None:
        return False

    callback_checkout_id = callback_data.get("CheckoutRequestID")
    callback_merchant_id = callback_data.get("MerchantRequestID")

    if (
        not payment.checkout_request_id
        or callback_checkout_id != payment.checkout_request_id
        or not payment.merchant_request_id
        or callback_merchant_id != payment.merchant_request_id
    ):
        return False

    result_code = callback_data.get("ResultCode")

    if result_code is None:
        return False

    try:
        int(result_code)
    except (TypeError, ValueError):
        return False

    if str(result_code) == "0":
        metadata = _extract_metadata(callback_data)

        required_fields = [
            "Amount",
            "PhoneNumber",
            "MpesaReceiptNumber"
        ]

        if not all(
            metadata.get(field) is not None
            for field in required_fields
        ):
            return False

        payment.callback_metadata = metadata

    db.session.commit()

    return True


def _process_payment(payment_id, result_code, description):
    payment = MpesaPayment.query.filter_by(
        id=payment_id
    ).with_for_update().first()

    if payment is None or payment.sale_id is not None:
        return

    code = str(result_code)

    payment.result_code = code
    payment.result_description = description

    # 4999 means the transaction is still being processed.
    # It must never be treated as a final failure.
    if code == "4999":
        payment.status = "pending"
        payment.result_description = (
            "Transaction is still processing. "
            "Awaiting Safaricom confirmation."
        )
        db.session.commit()
        return

    # Other non-zero result codes indicate an unsuccessful transaction.
    if code != "0":
        payment.status = "failed"
        db.session.commit()
        return

    metadata = payment.callback_metadata or {}

    amount = metadata.get("Amount")
    phone = metadata.get("PhoneNumber")
    receipt = metadata.get("MpesaReceiptNumber")

    if amount is None or phone is None or not receipt:
        payment.status = "pending"
        payment.result_description = (
            "Payment confirmation received. "
            "Waiting for complete callback details."
        )
        db.session.commit()
        return

    try:
        callback_amount = Decimal(str(amount))
        expected_amount = Decimal(str(payment.amount))
    except (InvalidOperation, ValueError):
        payment.status = "paid_review"
        payment.result_description = (
            "Invalid payment amount in callback"
        )
        db.session.commit()
        return

    if callback_amount != expected_amount:
        payment.status = "paid_review"
        payment.result_description = "Payment amount mismatch"
        db.session.commit()
        return

    if clean_phone(phone) != payment.phone_number:
        payment.status = "paid_review"
        payment.result_description = "Payment phone number mismatch"
        db.session.commit()
        return

    receipt = str(receipt).strip()

    if not receipt:
        payment.status = "paid_review"
        payment.result_description = "Missing M-Pesa receipt number"
        db.session.commit()
        return

    existing_receipt = MpesaPayment.query.filter(
        MpesaPayment.mpesa_receipt_number == receipt,
        MpesaPayment.id != payment.id
    ).first()

    if existing_receipt:
        payment.status = "paid_review"
        payment.result_description = "M-Pesa receipt already used"
        db.session.commit()
        return

    payment.mpesa_receipt_number = receipt

    try:
        _create_sale(payment)

        payment.status = "paid"
        payment.result_description = description

        db.session.commit()

    except ValueError as error:
        db.session.rollback()

        payment = db.session.get(MpesaPayment, payment_id)

        if payment is not None:
            payment.status = "paid_review"
            payment.result_description = str(error)
            db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()
        raise


@mpesa.post("/api/mpesa/stk-push")
@jwt_required()
def stk_push():
    user = _user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    if not user.business_id:
        return jsonify({"error": "Business not found"}), 400

    if not _configured():
        return jsonify({
            "error": "M-Pesa is not configured correctly"
        }), 503

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON data"}), 400

    phone = clean_phone(data.get("phone"))

    if not phone:
        return jsonify({
            "error": "Enter a valid Kenyan phone number"
        }), 400

    try:
        items, total = _prepare_items(
            data.get("items"),
            user.business_id
        )

    except (ValueError, InvalidOperation) as error:
        return jsonify({"error": str(error)}), 400

    payment = MpesaPayment(
        business_id=user.business_id,
        phone_number=phone,
        amount=total,
        items=items,
        status="pending"
    )

    try:
        db.session.add(payment)
        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({
            "error": "Could not save payment"
        }), 500

    token = _token()

    if not token:
        payment.status = "failed"
        payment.result_description = (
            "Could not obtain Daraja access token"
        )
        db.session.commit()

        return jsonify({
            "error": "Could not connect to M-Pesa"
        }), 502

    password, stamp = _password()

    body = {
        "BusinessShortCode": _env("MPESA_SHORTCODE"),
        "Password": password,
        "Timestamp": stamp,
        "TransactionType": _env(
            "MPESA_TRANSACTION_TYPE",
            "CustomerPayBillOnline"
        ),
        "Amount": int(total),
        "PartyA": phone,
        "PartyB": _env("MPESA_SHORTCODE"),
        "PhoneNumber": phone,
        "CallBackURL": _env("MPESA_CALLBACK_URL"),
        "AccountReference": "DukaSmart",
        "TransactionDesc": "Shop payment"
    }

    status, reply = _call(
        "POST",
        _base_url() + "/mpesa/stkpush/v1/processrequest",
        body,
        {
            "Authorization": "Bearer " + token,
            "Content-Type": "application/json"
        }
    )

    if status == 0:
        payment.result_description = (
            "Request outcome unknown. "
            "Check payment status before retrying."
        )
        db.session.commit()

        return jsonify({
            "message": payment.result_description
        }), 502

    if status == 200 and str(reply.get("ResponseCode")) == "0":
        payment.checkout_request_id = reply.get(
            "CheckoutRequestID"
        )
        payment.merchant_request_id = reply.get(
            "MerchantRequestID"
        )

        try:
            db.session.commit()

        except SQLAlchemyError:
            db.session.rollback()

            return jsonify({
                "error": (
                    "Safaricom accepted the request, but its "
                    "references could not be saved. "
                    "Manual review is required."
                )
            }), 500

        return jsonify({
            "message": reply.get(
                "CustomerMessage",
                "Payment prompt sent"
            ),
            "checkout_request_id": payment.checkout_request_id,
            "amount": str(total)
        }), 200

    payment.status = "failed"
    payment.result_description = (
        reply.get("errorMessage")
        or reply.get("ResponseDescription")
        or "Safaricom rejected the request"
    )

    db.session.commit()

    return jsonify({
        "error": payment.result_description
    }), 502


@mpesa.get("/api/mpesa/status/<checkout_id>")
@jwt_required()
def stk_status(checkout_id):
    user = _user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    payment = MpesaPayment.query.filter_by(
        checkout_request_id=checkout_id,
        business_id=user.business_id
    ).first()

    if payment is None:
        return jsonify({"error": "Payment not found"}), 404

    if payment.sale_id is not None:
        return jsonify({
            "state": "paid",
            "sale_id": payment.sale_id,
            "message": "Payment received"
        }), 200

    if payment.status == "paid_review":
        return jsonify({
            "state": "paid_review",
            "message": payment.result_description
        }), 200

    # Do not stop checking an old record whose 4999 result
    # was incorrectly marked as failed by the previous code.
    if (
        payment.status == "failed"
        and str(payment.result_code) != "4999"
    ):
        return jsonify({
            "state": "failed",
            "message": payment.result_description
        }), 200

    status, reply = _query_stk(checkout_id)

    if status != 200 or "ResultCode" not in reply:
        return jsonify({
            "state": "pending",
            "message": (
                "Waiting for Safaricom payment confirmation"
            )
        }), 200

    try:
        _process_payment(
            payment.id,
            reply["ResultCode"],
            reply.get("ResultDesc", "")
        )

    except SQLAlchemyError:
        return jsonify({
            "error": "Could not process payment"
        }), 500

    payment = db.session.get(MpesaPayment, payment.id)

    if payment.sale_id is not None:
        return jsonify({
            "state": "paid",
            "sale_id": payment.sale_id,
            "message": "Payment received"
        }), 200

    return jsonify({
        "state": payment.status,
        "message": payment.result_description
    }), 200


@mpesa.post("/api/mpesa/callback")
def callback():
    data = request.get_json(silent=True) or {}

    callback_data = (
        data.get("Body", {}).get("stkCallback", {})
    )

    checkout_id = callback_data.get("CheckoutRequestID")

    if not checkout_id:
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }), 200

    payment = MpesaPayment.query.filter_by(
        checkout_request_id=checkout_id
    ).first()

    if payment is None:
        return jsonify({
            "ResultCode": 0,
            "ResultDesc": "Accepted"
        }), 200

    try:
        saved = _save_callback(
            payment.id,
            callback_data
        )

        if not saved:
            return jsonify({
                "ResultCode": 0,
                "ResultDesc": "Accepted"
            }), 200

        # Process the actual callback result from Safaricom.
        # Do not replace it with an immediate STK query result.
        _process_payment(
            payment.id,
            callback_data["ResultCode"],
            callback_data.get("ResultDesc", "")
        )

    except SQLAlchemyError:
        db.session.rollback()

    return jsonify({
        "ResultCode": 0,
        "ResultDesc": "Accepted"
    }), 200
