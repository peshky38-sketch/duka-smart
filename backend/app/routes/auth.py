from flask import Blueprint, request, jsonify
from app.models import User, Business
from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError

auth = Blueprint("auth", __name__)

def unique_username(name, ignore_user_id=None):
    candidate = name
    number = 1
    while True:
        found = User.query.filter_by(username=candidate).first()
        if found is None or found.id == ignore_user_id:
            return candidate
        number += 1
        candidate = f"{name} {number}"


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

    if User.query.filter_by(email=email).first():
        return jsonify({
            "error": "An account with this email already exists"
            }), 409

    # two owners can have the same full name: the second becomes "Name 2", and so on
    username = unique_username(username)

    hashed_password = generate_password_hash(password)

    business_name = data.get("business_name")
    business_type = data.get("business_type")
    currency = data.get("currency")
    business_email = data.get("business_email")
    phone_number = data.get("phone_number")
    business_address = data.get("business_address")
    business_logo = data.get("business_logo") or ""

    if not business_name or not business_type or not business_email or not phone_number or not business_address or not currency:
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
        "username": user.username,
        "business_name": user.business.business_name,
        "currency": user.business.currency
    }), 200

def profile_json(user):
    business = user.business
    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "business_name": business.business_name,
        "business_type": business.business_type,
        "currency": business.currency,
        "business_email": business.email,
        "phone_number": business.phone_number,
        "business_address": business.business_address,
        "picture": user.profile_picture or ""
    }


@auth.get("/api/profile")
@jwt_required()
def get_profile():
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(profile_json(user)), 200


@auth.put("/api/profile")
@jwt_required()
def update_profile():
    user = db.session.get(User, int(get_jwt_identity()))
    if user is None:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON data"}), 400

    # only these fields can be changed; anything not sent stays as it is
    text_fields = {
        "username": None,
        "business_name": "business_name",
        "business_type": "business_type",
        "business_address": "business_address",
        "phone_number": "phone_number",
    }
    # profile picture: a small image sent as a data URL ("data:image/jpeg;base64,...")
    if "picture" in data:
        picture = data["picture"]
        if picture not in ("", None):
            if (not isinstance(picture, str)
                    or not picture.startswith("data:image/")
                    or len(picture) > 400_000):
                return jsonify({"error": "Picture must be an image under about 300 KB"}), 400
        user.profile_picture = picture or None

    for key in text_fields:
        if key in data and (not isinstance(data[key], str) or data[key].strip() == ""):
            return jsonify({"error": key.replace("_", " ").capitalize() + " cannot be empty"}), 400

    if "username" in data:
        user.username = unique_username(data["username"].strip(), ignore_user_id=user.id)

    for key, column in text_fields.items():
        if column and key in data:
            if key == "phone_number":
                taken = Business.query.filter(
                    Business.phone_number == data[key].strip(),
                    Business.id != user.business_id
                ).first()
                if taken:
                    return jsonify({"error": "That phone number is already used by another business"}), 409
            setattr(user.business, column, data[key].strip())

    try:
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Could not save these details"}), 409

    return jsonify({"message": "Profile updated", **profile_json(user)}), 200
