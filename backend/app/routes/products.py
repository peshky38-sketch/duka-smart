
from flask import Blueprint, request, jsonify

from app.extensions import db
from app.models import User, Product, Category, Supplier

from flask_jwt_extended import jwt_required, get_jwt_identity

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import func

import math


products = Blueprint("products", __name__)


# Create a new product
@products.post("/api/products")
@jwt_required()
def create_product():

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON data"
        }), 400

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "Invalid user details"
        }), 401

    business_id = user.business_id

    # Get product details using frontend field names
    product_name = data.get("name")
    sku = data.get("sku")
    purchase_price = data.get("buying")
    selling_price = data.get("selling")
    quantity = data.get("quantity")
    low_stock_threshold = data.get("threshold")
    category_id = data.get("category")
    supplier_id = data.get("supplier")
    description = data.get("description")

    # Check required fields
    if (
        product_name is None
        or sku is None
        or purchase_price is None
        or selling_price is None
        or quantity is None
        or low_stock_threshold is None
        or category_id is None
        or supplier_id is None
    ):
        return jsonify({
            "error": "All fields are required"
        }), 400

    # Check product name and SKU
    if not isinstance(product_name, str) or not isinstance(sku, str):
        return jsonify({
            "error": "Product name and SKU must be text"
        }), 400

    entered_product_name = product_name.strip()
    entered_sku = sku.strip()

    if entered_product_name == "" or entered_sku == "":
        return jsonify({
            "error": "Product name and SKU are required"
        }), 400

    # Check description
    if description is not None:
        if not isinstance(description, str):
            return jsonify({
                "error": "Description must be text"
            }), 400

        description = description.strip()

    # Check prices
    if (
        not isinstance(purchase_price, (int, float))
        or isinstance(purchase_price, bool)
        or not math.isfinite(purchase_price)
        or purchase_price < 0
        or not isinstance(selling_price, (int, float))
        or isinstance(selling_price, bool)
        or not math.isfinite(selling_price)
        or selling_price < 0
    ):
        return jsonify({
            "error": "Invalid buying price or selling price"
        }), 400

    # Check quantity and threshold
    if (
        not isinstance(quantity, int)
        or isinstance(quantity, bool)
        or quantity < 0
        or not isinstance(low_stock_threshold, int)
        or isinstance(low_stock_threshold, bool)
        or low_stock_threshold < 0
    ):
        return jsonify({
            "error": "Quantity and threshold must be non-negative integers"
        }), 400

    # Check category and supplier IDs
    if (
        not isinstance(category_id, int)
        or isinstance(category_id, bool)
        or category_id < 1
        or not isinstance(supplier_id, int)
        or isinstance(supplier_id, bool)
        or supplier_id < 1
    ):
        return jsonify({
            "error": "Invalid category or supplier ID"
        }), 400

    # Check if SKU already exists (case-insensitive)
    existing_product = Product.query.filter(
        func.lower(Product.sku) == entered_sku.lower(),
        Product.business_id == business_id
    ).first()

    if existing_product:
        return jsonify({
            "error": "A product with this SKU already exists"
        }), 409

    # Check if category belongs to this business
    category = Category.query.filter_by(
        id=category_id,
        business_id=business_id
    ).first()

    if category is None:
        return jsonify({
            "error": "Invalid category for this business"
        }), 400

    # Check if supplier belongs to this business
    supplier = Supplier.query.filter_by(
        id=supplier_id,
        business_id=business_id
    ).first()

    if supplier is None:
        return jsonify({
            "error": "Invalid supplier for this business"
        }), 400

    # Create new product
    new_product = Product(
        product_name=entered_product_name,
        description=description,
        sku=entered_sku,
        purchase_price=purchase_price,
        selling_price=selling_price,
        quantity=quantity,
        low_stock_threshold=low_stock_threshold,
        category_id=category_id,
        supplier_id=supplier_id,
        business_id=business_id
    )

    try:
        db.session.add(new_product)
        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "error": "Unable to create product. Please try again"
        }), 500

    return jsonify({
        "message": "Product creation was successful",
        "id": new_product.id,
        "name": new_product.product_name,
        "sku": new_product.sku,
        "buying": float(new_product.purchase_price),
        "selling": float(new_product.selling_price),
        "quantity": new_product.quantity,
        "threshold": new_product.low_stock_threshold,
        "category": new_product.category_id,
        "supplier": new_product.supplier_id
    }), 201


# Get all products
@products.get("/api/products")
@jwt_required()
def get_products():

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "Invalid user details"
        }), 401

    products_list = Product.query.filter_by(
        business_id=user.business_id
    ).all()

    all_products = []

    for product in products_list:
        all_products.append({
            "id": product.id,
            "name": product.product_name,
            "description": product.description,
            "sku": product.sku,
            "buying": float(product.purchase_price),
            "selling": float(product.selling_price),
            "quantity": product.quantity,
            "threshold": product.low_stock_threshold,
            "category": product.category_id,
            "supplier": product.supplier_id
        })

    return jsonify({
        "products": all_products
    }), 200


# Get one product
@products.get("/api/products/<int:product_id>")
@jwt_required()
def get_product(product_id):

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "Invalid user details"
        }), 401

    product = Product.query.filter_by(
        id=product_id,
        business_id=user.business_id
    ).first()

    if product is None:
        return jsonify({
            "error": "Product not found"
        }), 404

    return jsonify({
        "id": product.id,
        "name": product.product_name,
        "description": product.description,
        "sku": product.sku,
        "buying": float(product.purchase_price),
        "selling": float(product.selling_price),
        "quantity": product.quantity,
        "threshold": product.low_stock_threshold,
        "category": product.category_id,
        "supplier": product.supplier_id
    }), 200


# Update a product
@products.put("/api/products/<int:product_id>")
@jwt_required()
def update_product(product_id):

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "Invalid user details"
        }), 401

    product = Product.query.filter_by(
        id=product_id,
        business_id=user.business_id
    ).first()

    if product is None:
        return jsonify({
            "error": "Product not found"
        }), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "error": "Invalid JSON data"
        }), 400

    # Update product name
    if "name" in data:

        product_name = data.get("name")

        if not isinstance(product_name, str) or product_name.strip() == "":
            return jsonify({
                "error": "Product name must be text"
            }), 400

        product.product_name = product_name.strip()

    # Update SKU
    if "sku" in data:

        sku = data.get("sku")

        if not isinstance(sku, str) or sku.strip() == "":
            return jsonify({
                "error": "SKU must be text"
            }), 400

        entered_sku = sku.strip()

        # Check if SKU already exists (case-insensitive)
        existing_product = Product.query.filter(
            func.lower(Product.sku) == entered_sku.lower(),
            Product.business_id == user.business_id
        ).first()

        if existing_product and existing_product.id != product.id:
            return jsonify({
                "error": "A product with this SKU already exists"
            }), 409

        product.sku = entered_sku

    # Update description
    if "description" in data:

        description = data.get("description")

        if description is not None and not isinstance(description, str):
            return jsonify({
                "error": "Description must be text"
            }), 400

        if isinstance(description, str):
            description = description.strip()

        product.description = description

    # Update buying price
    if "buying" in data:

        purchase_price = data.get("buying")

        if (
            not isinstance(purchase_price, (int, float))
            or isinstance(purchase_price, bool)
            or not math.isfinite(purchase_price)
            or purchase_price < 0
        ):
            return jsonify({
                "error": "Invalid buying price"
            }), 400

        product.purchase_price = purchase_price

    # Update selling price
    if "selling" in data:

        selling_price = data.get("selling")

        if (
            not isinstance(selling_price, (int, float))
            or isinstance(selling_price, bool)
            or not math.isfinite(selling_price)
            or selling_price < 0
        ):
            return jsonify({
                "error": "Invalid selling price"
            }), 400

        product.selling_price = selling_price

    # Update quantity
    if "quantity" in data:

        quantity = data.get("quantity")

        if (
            not isinstance(quantity, int)
            or isinstance(quantity, bool)
            or quantity < 0
        ):
            return jsonify({
                "error": "Quantity must be a non-negative integer"
            }), 400

        product.quantity = quantity

    # Update low-stock threshold
    if "threshold" in data:

        low_stock_threshold = data.get("threshold")

        if (
            not isinstance(low_stock_threshold, int)
            or isinstance(low_stock_threshold, bool)
            or low_stock_threshold < 0
        ):
            return jsonify({
                "error": "Threshold must be a non-negative integer"
            }), 400

        product.low_stock_threshold = low_stock_threshold

    # Update category
    if "category" in data:

        category_id = data.get("category")

        if (
            not isinstance(category_id, int)
            or isinstance(category_id, bool)
            or category_id < 1
        ):
            return jsonify({
                "error": "Invalid category ID"
            }), 400

        category = Category.query.filter_by(
            id=category_id,
            business_id=user.business_id
        ).first()

        if category is None:
            return jsonify({
                "error": "Invalid category for this business"
            }), 400

        product.category_id = category_id

    # Update supplier
    if "supplier" in data:

        supplier_id = data.get("supplier")

        if (
            not isinstance(supplier_id, int)
            or isinstance(supplier_id, bool)
            or supplier_id < 1
        ):
            return jsonify({
                "error": "Invalid supplier ID"
            }), 400

        supplier = Supplier.query.filter_by(
            id=supplier_id,
            business_id=user.business_id
        ).first()

        if supplier is None:
            return jsonify({
                "error": "Invalid supplier for this business"
            }), 400

        product.supplier_id = supplier_id

    try:
        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "error": "Unable to update product"
        }), 500

    return jsonify({
        "message": "Product updated successfully",
        "product_id": product.id
    }), 200


# Delete a product
@products.delete("/api/products/<int:product_id>")
@jwt_required()
def delete_product(product_id):

    user_id = get_jwt_identity()

    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "Invalid user details"
        }), 401

    product = Product.query.filter_by(
        id=product_id,
        business_id=user.business_id
    ).first()

    if product is None:
        return jsonify({
            "error": "Product not found"
        }), 404

    try:
        db.session.delete(product)
        db.session.commit()

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "error": "Unable to delete product. It may be linked to existing sales or stock records"
        }), 409

    return jsonify({
        "message": "Product deleted successfully"
    }), 200
