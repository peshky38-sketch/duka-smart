from flask import Blueprint, request, jsonify
from app.models import User, Business
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

auth = Blueprint("auth", __name__)

@auth.post("/api/register")
def register():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON data"
        }), 400

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({
            "error": "All fields are required"
            }), 400

    existing_username = User.query.filter_by(username=username).first()
    existing_email = User.query.filter_by(email=email).first()

    if existing_username or existing_email:
        return jsonify({
            "error": "User already exists"
            }), 409

    hashed_password = generate_password_hash(password)

    business_name = data.get("business_name")
    business_type = data.get("business_type")
    currency = data.get("currency")
    business_email = data.get("business_email")
    phone_number = data.get("phone_number")
    business_address = data.get("business_address")
    business_logo = data.get("business_logo")

    if not business_name or not business_type or not business_email or not phone_number or not business_logo or not business_address or not currency:
        return jsonify({
            "error": "All fields required"
            }), 400

    existing_business_email = Business.query.filter_by(email = business_email).first()
    existing_phone_number = Business.query.filter_by(phone_number = phone_number).first()

    if existing_business_email or existing_phone_number:
        return jsonify({
            "error": "Business already exists"
            }), 409

    new_business = Business(
        business_name = business_name,
        business_type = business_type,
        currency = currency,
        email = business_email,
        phone_number = phone_number,
        business_address =business_address,
        logo = business_logo

    )
    try:
        db.session.add(new_business)
        db.session.flush()

        new_user = User(
            username = username,
            email = email,
            password_hash = hashed_password,
            business_id = new_business.id
        )
        db.session.add(new_user)
        db.session.commit()
        return jsonify({
            "message": "registration was successful",
            "user_id": new_user.id,
            "username": username
            }), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({
            "error": "User or business details already exist"
            }), 409

@auth.post("/api/login")
def login():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON data"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({
            "error": "All fields are required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if user is None:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    password_is_valid = check_password_hash(user.password_hash, password)

    if not password_is_valid:
        return jsonify({
            "error": "Invalid email or password"
        }), 401

    access_token = create_access_token(identity=str(user.id))

    return jsonify({
        "message": "log in was successful",
        "access_token": access_token,
        "user_id": user.id,
        "username": user.username
    }), 200

@auth.get("/api/profile")
@jwt_required()
def protected_endpoint():
    user_id = get_jwt_identity()
    return jsonify({
        "user_id": user_id
    }),200