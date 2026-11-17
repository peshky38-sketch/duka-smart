
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Supplier, User
from sqlalchemy import or_, func


suppliers = Blueprint("suppliers", __name__)


@suppliers.post("/api/suppliers")
@jwt_required()
def create_supplier():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    supplier_name = data.get("supplier_name")
    phone_number = data.get("phone_number")
    email = data.get("email")
    address = data.get("address")

    if not isinstance(supplier_name, str) or not isinstance(phone_number, str):
        return jsonify({
            "error": "Supplier name and phone number must be text"
        }), 400

    supplier_name = supplier_name.strip()
    phone_number = phone_number.strip()

    if supplier_name == "" or phone_number == "":
        return jsonify({
            "error": "Supplier name and phone number are required"
        }), 400

    if email is not None and not isinstance(email, str):
        return jsonify({
            "error": "Email must be text"
        }), 400

    if address is not None and not isinstance(address, str):
        return jsonify({
            "error": "Address must be text"
        }), 400

    if email is not None:
        email = email.strip()

    if address is not None:
        address = address.strip()

        existing_supplier = Supplier.query.filter(
        Supplier.business_id == user.business_id,
        or_(
            func.lower(Supplier.supplier_name) == supplier_name.lower(),
            Supplier.phone_number == phone_number
        )
    ).first()

    if existing_supplier:
        return jsonify({
            "error": "A supplier with this name or phone number already exists"
        }), 409
    
    new_supplier = Supplier(
        supplier_name=supplier_name,
        phone_number=phone_number,
        email=email,
        address=address,
        business_id=user.business_id
    )

    db.session.add(new_supplier)
    db.session.commit()

    return jsonify({
        "message": "Supplier created successfully",
        "supplier": {
            "id": new_supplier.id,
            "supplier_name": new_supplier.supplier_name,
            "phone_number": new_supplier.phone_number,
            "email": new_supplier.email,
            "address": new_supplier.address
        }
    }), 201


@suppliers.get("/api/suppliers")
@jwt_required()
def get_suppliers():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "User not found"
        }), 404

    business_suppliers = Supplier.query.filter_by(
        business_id=user.business_id
    ).all()

    return jsonify({
        "suppliers": [
            {
                "id": supplier.id,
                "supplier_name": supplier.supplier_name,
                "phone_number": supplier.phone_number,
                "email": supplier.email,
                "address": supplier.address
            }
            for supplier in business_suppliers
        ]
    }), 200
