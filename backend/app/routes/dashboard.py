
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Product, Sale, Expense

dashboard = Blueprint("dashboard", __name__)


@dashboard.get("/api/dashboard/stats")
@jwt_required()
def get_dashboard_stats():

    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "Invalid user details"
        }), 401

    business_id = user.business_id

    if business_id is None:
        return jsonify({
            "error": "User has no associated business"
        }), 400

    products = Product.query.filter_by(
        business_id=business_id
    ).all()

    sales = Sale.query.filter_by(
        business_id=business_id
    ).all()

    expenses = Expense.query.filter_by(
        business_id=business_id
    ).all()

    total_products = len(products)
    total_stock_units = 0
    low_stock_products = 0
    inventory_cost_value = 0
    inventory_selling_value = 0

    for product in products:
        total_stock_units += product.quantity

        if product.quantity <= product.low_stock_threshold:
            low_stock_products += 1

        inventory_cost_value += product.quantity * product.purchase_price
        inventory_selling_value += product.quantity * product.selling_price

    total_sales = len(sales)
    total_revenue = 0

    for sale in sales:
        total_revenue += sale.total_amount

    total_expenses = 0

    for expense in expenses:
        total_expenses += expense.amount

    return jsonify({
        "dashboard": {
            "total_products": total_products,
            "total_stock_units": total_stock_units,
            "low_stock_products": low_stock_products,
            "total_sales": total_sales,
            "total_revenue": f"{total_revenue:.2f}",
            "total_expenses": f"{total_expenses:.2f}",
            "inventory_cost_value": f"{inventory_cost_value:.2f}",
            "inventory_selling_value": f"{inventory_selling_value:.2f}"
        }
    }), 200
