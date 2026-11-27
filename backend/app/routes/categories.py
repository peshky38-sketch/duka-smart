from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models import User, Category
from flask_jwt_extended import jwt_required, get_jwt_identity

categories = Blueprint("categories", __name__)

@categories.route("/api/categories", methods=["POST"])
@jwt_required()
def create_category():

    current_user_id = get_jwt_identity()

    user = User.query.get(int(current_user_id))

    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    data = request.get_json()

    if not data:
        return jsonify({
            "error": "Request body is required"
        }), 400

    category_name = data.get("category_name")

    if not isinstance(category_name, str):
        return jsonify({
            "error": "Category name must be text"
        }), 400

    category_name = category_name.strip()

    if category_name == "":
        return jsonify({
            "error": "Category name cannot be empty"
        }), 400

    new_category = Category(
        category_name=category_name,
        business_id=user.business_id
    )

    try:
        db.session.add(new_category)
        db.session.commit()

        return jsonify({
            "message": "Category created successfully",
            "category": {
                "id": new_category.id,
                "category_name": new_category.category_name
            }
        }), 201

    except Exception:
        db.session.rollback()

        return jsonify({
            "error": "Could not create category"
        }), 500

@categories.route("/api/categories", methods=["GET"])
@jwt_required()
def get_categories():

    current_user_id = get_jwt_identity()

    user = User.query.get(int(current_user_id))

    if user is None:
        return jsonify({
            "error": "User not found"
        }), 404

    categories_list = Category.query.filter_by(
        business_id=user.business_id
    ).all()

    categories_data = []

    for category in categories_list:
        categories_data.append({
            "id": category.id,
            "category_name": category.category_name
        })

    return jsonify({
        "categories": categories_data
    }), 200