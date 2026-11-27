from app.extensions import db
from datetime import datetime, timezone


class MpesaPayment(db.Model):
    __tablename__ = "mpesa_payments"

    id = db.Column(db.Integer, primary_key=True)
    checkout_request_id = db.Column(db.String(100), unique=True, nullable=True)
    merchant_request_id = db.Column(db.String(100), nullable=True)

    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
    sale_id = db.Column(db.Integer, db.ForeignKey("sales.id"), nullable=True)

    phone_number = db.Column(db.String(15), nullable=False)
    amount = db.Column(db.Numeric(12, 2), nullable=False)
    items = db.Column(db.JSON, nullable=False)
    callback_metadata = db.Column(db.JSON, nullable=True)

    status = db.Column(db.String(20), nullable=False, default="pending")
    mpesa_receipt_number = db.Column(db.String(50), unique=True, nullable=True)
    result_code = db.Column(db.String(20), nullable=True)
    result_description = db.Column(db.Text, nullable=True)

    created_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc).replace(tzinfo=None),
        onupdate=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )