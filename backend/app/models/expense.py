from app.extensions import db

class Expense(db.Model):
    __tablename__ = "expenses"
    id = db.Column(db.Integer, primary_key=True)
    expense_name = db.Column(db.String, nullable=False)
    amount = db.Column(db.Numeric, nullable=False)
    category = db.Column(db.String, nullable=False)
    payment_method = db.Column(db.String, nullable = False)
    note = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)