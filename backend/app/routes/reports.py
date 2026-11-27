
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.extensions import db
from app.models import User, Sale, SaleItem, Product, Expense
from decimal import Decimal

reports = Blueprint("reports", __name__)


@reports.get("/api/reports/sales")
@jwt_required()
def sales_report():

    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "Invalid user details"
        }), 401

    business_id = user.business_id

    sales = Sale.query.filter_by(
        business_id=business_id
    ).all()

    total_revenue = Decimal("0")
    sales_list = []

    for sale in sales:
        total_revenue += Decimal(str(sale.total_amount))

        sales_list.append({
            "sale_id": sale.id,
            "sale_number": sale.sale_number,
            "total_amount": f"{Decimal(str(sale.total_amount)):.2f}",
            "payment_method": sale.payment_method,
            "created_at": sale.created_at.isoformat()
        })

    return jsonify({
        "total_sales": len(sales),
        "total_revenue": f"{total_revenue:.2f}",
        "sales": sales_list
    }), 200


@reports.get("/api/reports/profit")
@jwt_required()
def profit_report():

    user_id = get_jwt_identity()
    user = db.session.get(User, user_id)

    if not user:
        return jsonify({
            "error": "Invalid user details"
        }), 401

    business_id = user.business_id

    sales = Sale.query.filter_by(
        business_id=business_id
    ).all()

    expenses = Expense.query.filter_by(
        business_id=business_id
    ).all()

    total_revenue = Decimal("0")
    total_cost = Decimal("0")
    total_expenses = Decimal("0")

    for sale in sales:
        total_revenue += Decimal(str(sale.total_amount))

        sale_items = SaleItem.query.filter_by(
            sale_id=sale.id
        ).all()

        for item in sale_items:
            product = Product.query.filter_by(
                id=item.product_id,
                business_id=business_id
            ).first()

            if product:
                total_cost += (
                    Decimal(str(product.purchase_price)) * item.quantity
                )

    for expense in expenses:
        total_expenses += Decimal(str(expense.amount))

    gross_profit = total_revenue - total_cost
    net_profit = gross_profit - total_expenses

    return jsonify({
        "total_revenue": f"{total_revenue:.2f}",
        "estimated_cost_of_goods_sold": f"{total_cost:.2f}",
        "estimated_gross_profit": f"{gross_profit:.2f}",
        "total_expenses": f"{total_expenses:.2f}",
        "estimated_net_profit": f"{net_profit:.2f}"
    }), 200
