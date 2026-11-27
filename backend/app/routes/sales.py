
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime, timezone
from decimal import Decimal
import uuid

from app.models import User, Product, Sale, SaleItem
from app.extensions import db


sales = Blueprint("sales", __name__)


def _get_user():
    identity = get_jwt_identity()

    try:
        user_id = int(identity)
    except (TypeError, ValueError):
        return None

    return User.query.filter_by(id=user_id).first()


@sales.post("/api/sales")
@jwt_required()
def create_sales():
    user = _get_user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    if not user.business_id:
        return jsonify({
            "error": "User has no associated business"
        }), 400

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON data"}), 400

    payment_method = data.get("payment_method")
    items = data.get("items")

    if not isinstance(payment_method, str) or not isinstance(items, list):
        return jsonify({"error": "Invalid payment method or items"}), 400

    payment_method = payment_method.strip().lower()

    if payment_method == "m-pesa":
        return jsonify({
            "error": "M-Pesa payments must be completed through STK Push"
        }), 400

    if payment_method not in ("cash", "card"):
        return jsonify({
            "error": "Payment method must be Cash or Card"
        }), 400

    if not items:
        return jsonify({
            "error": "Sale must contain at least one item"
        }), 400

    sale_items = []
    total_amount = Decimal("0")
    seen_product_ids = set()

    try:
        for item in items:
            if not isinstance(item, dict):
                return jsonify({
                    "error": "Each sale item must be an object"
                }), 400

            product_id = item.get("product_id")
            quantity = item.get("quantity")

            if (
                not isinstance(product_id, int)
                or isinstance(product_id, bool)
                or product_id <= 0
            ):
                return jsonify({
                    "error": "Product ID must be a positive integer"
                }), 400

            if (
                not isinstance(quantity, int)
                or isinstance(quantity, bool)
                or quantity <= 0
            ):
                return jsonify({
                    "error": "Quantity must be a positive integer"
                }), 400

            if product_id in seen_product_ids:
                return jsonify({
                    "error": "A product cannot appear more than once in a sale"
                }), 400

            seen_product_ids.add(product_id)

            product = Product.query.filter_by(
                id=product_id,
                business_id=user.business_id
            ).with_for_update().first()

            if product is None:
                return jsonify({
                    "error": f"Product {product_id} not found"
                }), 404

            if quantity > product.quantity:
                return jsonify({
                    "error": (
                        f"Insufficient stock for {product.product_name}. "
                        f"Available stock: {product.quantity}"
                    )
                }), 400

            unit_price = Decimal(str(product.selling_price))
            subtotal = unit_price * quantity
            total_amount += subtotal

            sale_items.append({
                "product": product,
                "product_id": product.id,
                "quantity": quantity,
                "unit_price": unit_price,
                "subtotal": subtotal
            })

        new_sale = Sale(
            sale_number="SALE-" + uuid.uuid4().hex[:10].upper(),
            total_amount=total_amount,
            payment_method=payment_method.capitalize(),
            created_at=datetime.now(timezone.utc).replace(tzinfo=None),
            business_id=user.business_id
        )

        db.session.add(new_sale)
        db.session.flush()

        for item in sale_items:
            item["product"].quantity -= item["quantity"]

            db.session.add(SaleItem(
                sale_id=new_sale.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                unit_price=item["unit_price"],
                subtotal=item["subtotal"]
            ))

        db.session.commit()

        return jsonify({
            "message": "Sale created successfully",
            "sale_id": new_sale.id,
            "sale_number": new_sale.sale_number,
            "total_amount": str(new_sale.total_amount),
            "payment_method": new_sale.payment_method,
            "items": [
                {
                    "product_id": item["product_id"],
                    "quantity": item["quantity"],
                    "unit_price": str(item["unit_price"]),
                    "subtotal": str(item["subtotal"])
                }
                for item in sale_items
            ]
        }), 201

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "error": "Failed to create sale"
        }), 500


@sales.get("/api/sales")
@jwt_required()
def get_sales():
    user = _get_user()

    if user is None:
        return jsonify({"error": "User not found"}), 404

    if not user.business_id:
        return jsonify({
            "error": "User has no associated business"
        }), 400

    user_sales = (
        Sale.query
        .filter_by(business_id=user.business_id)
        .order_by(Sale.created_at.desc())
        .all()
    )

    sales_list = []

    for sale in user_sales:
        sale_items = SaleItem.query.filter_by(
            sale_id=sale.id
        ).all()

        formatted_items = [
            {
                "product_id": item.product_id,
                "quantity": item.quantity,
                "unit_price": str(item.unit_price),
                "subtotal": str(item.subtotal)
            }
            for item in sale_items
        ]

        sales_list.append({
            "sale_id": sale.id,
            "sale_number": sale.sale_number,
            "total_amount": str(sale.total_amount),
            "payment_method": sale.payment_method,
            "created_at": sale.created_at.isoformat(),
            "items": formatted_items
        })

    return jsonify(sales_list), 200
