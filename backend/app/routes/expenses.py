
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Expense
from app.extensions import db
from decimal import Decimal, InvalidOperation
from datetime import datetime, timezone
from sqlalchemy.exc import SQLAlchemyError

expenses = Blueprint("expenses", __name__)


def get_user_business():

    user_id = get_jwt_identity()

    logged_in_user = User.query.filter_by(
        id=user_id
    ).first()

    if logged_in_user is None:
        return None, None

    return logged_in_user, logged_in_user.business_id


def expense_to_dict(expense):
    return {
        "id": expense.id,
        "expense_name": expense.expense_name,
        "amount": str(expense.amount),
        "category": expense.category,
        "payment_method": expense.payment_method,
        "note": expense.note,
        "created_at": expense.created_at.isoformat(),
        "business_id": expense.business_id
    }


def validate_amount(amount):

    if isinstance(amount, bool) or amount is None:
        return None

    try:
        value = Decimal(str(amount))

        if not value.is_finite() or value <= 0:
            return None

        return value

    except (InvalidOperation, ValueError, TypeError):
        return None


@expenses.post("/api/expenses")
@jwt_required()
def create_expense():

    logged_in_user, business_id = get_user_business()

    if logged_in_user is None:
        return jsonify({"error": "User not found"}), 404

    if business_id is None:
        return jsonify({"error": "User has no associated business"}), 400

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Invalid JSON data"}), 400

    expense_name = data.get("expense_name")
    amount = data.get("amount")
    category = data.get("category")
    payment_method = data.get("payment_method")
    note = data.get("note")

    if (
        not isinstance(expense_name, str)
        or not expense_name.strip()
        or amount is None
        or not isinstance(category, str)
        or not category.strip()
        or not isinstance(payment_method, str)
        or not payment_method.strip()
    ):
        return jsonify({
            "error": "All required fields must be provided"
        }), 400

    unit_expense = validate_amount(amount)

    if unit_expense is None:
        return jsonify({
            "error": "Enter a valid amount greater than zero"
        }), 400

    if note is not None and not isinstance(note, str):
        return jsonify({"error": "Note must be a string"}), 400

    new_expense = Expense(
        expense_name=expense_name.strip(),
        amount=unit_expense,
        category=category.strip(),
        payment_method=payment_method.strip(),
        note=note.strip() if note and note.strip() else None,
        created_at=datetime.now(timezone.utc).replace(tzinfo=None),
        business_id=business_id
    )

    try:
        db.session.add(new_expense)
        db.session.commit()

        return jsonify({
            "message": "Expense created successfully",
            "expense": expense_to_dict(new_expense)
        }), 201

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({
            "error": "Failed to create expense"
        }), 500


@expenses.get("/api/expenses")
@jwt_required()
def get_expenses():

    logged_in_user, business_id = get_user_business()

    if logged_in_user is None:
        return jsonify({"error": "User not found"}), 404

    if business_id is None:
        return jsonify({"error": "User has no associated business"}), 400

    try:
        all_expenses = Expense.query.filter_by(
            business_id=business_id
        ).order_by(Expense.created_at.desc()).all()

        return jsonify({
            "expenses": [
                expense_to_dict(expense)
                for expense in all_expenses
            ]
        }), 200

    except SQLAlchemyError:
        return jsonify({"error": "Failed to retrieve expenses"}), 500


@expenses.get("/api/expenses/<int:expense_id>")
@jwt_required()
def get_expense(expense_id):

    logged_in_user, business_id = get_user_business()

    if logged_in_user is None:
        return jsonify({"error": "User not found"}), 404

    if business_id is None:
        return jsonify({"error": "User has no associated business"}), 400

    expense = Expense.query.filter_by(
        id=expense_id,
        business_id=business_id
    ).first()

    if expense is None:
        return jsonify({"error": "Expense not found"}), 404

    return jsonify({
        "expense": expense_to_dict(expense)
    }), 200


@expenses.put("/api/expenses/<int:expense_id>")
@jwt_required()
def update_expense(expense_id):

    logged_in_user, business_id = get_user_business()

    if logged_in_user is None:
        return jsonify({"error": "User not found"}), 404

    if business_id is None:
        return jsonify({"error": "User has no associated business"}), 400

    expense = Expense.query.filter_by(
        id=expense_id,
        business_id=business_id
    ).first()

    if expense is None:
        return jsonify({"error": "Expense not found"}), 404

    data = request.get_json(silent=True)

    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Invalid or empty JSON data"}), 400

    allowed_fields = {
        "expense_name",
        "amount",
        "category",
        "payment_method",
        "note"
    }

    if not set(data.keys()).issubset(allowed_fields):
        return jsonify({"error": "Invalid fields supplied"}), 400

    if "expense_name" in data:
        value = data["expense_name"]

        if not isinstance(value, str) or not value.strip():
            return jsonify({"error": "Invalid expense name"}), 400

        expense.expense_name = value.strip()

    if "amount" in data:
        unit_expense = validate_amount(data["amount"])

        if unit_expense is None:
            return jsonify({"error": "Invalid expense amount"}), 400

        expense.amount = unit_expense

    if "category" in data:
        value = data["category"]

        if not isinstance(value, str) or not value.strip():
            return jsonify({"error": "Invalid category"}), 400

        expense.category = value.strip()

    if "payment_method" in data:
        value = data["payment_method"]

        if not isinstance(value, str) or not value.strip():
            return jsonify({"error": "Invalid payment method"}), 400

        expense.payment_method = value.strip()

    if "note" in data:
        value = data["note"]

        if value is not None and not isinstance(value, str):
            return jsonify({"error": "Note must be a string"}), 400

        expense.note = value.strip() if value and value.strip() else None

    try:
        db.session.commit()

        return jsonify({
            "message": "Expense updated successfully",
            "expense": expense_to_dict(expense)
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({"error": "Failed to update expense"}), 500


@expenses.delete("/api/expenses/<int:expense_id>")
@jwt_required()
def delete_expense(expense_id):

    logged_in_user, business_id = get_user_business()

    if logged_in_user is None:
        return jsonify({"error": "User not found"}), 404

    if business_id is None:
        return jsonify({"error": "User has no associated business"}), 400

    expense = Expense.query.filter_by(
        id=expense_id,
        business_id=business_id
    ).first()

    if expense is None:
        return jsonify({"error": "Expense not found"}), 404

    try:
        db.session.delete(expense)
        db.session.commit()

        return jsonify({
            "message": "Expense deleted successfully"
        }), 200

    except SQLAlchemyError:
        db.session.rollback()

        return jsonify({"error": "Failed to delete expense"}), 500
