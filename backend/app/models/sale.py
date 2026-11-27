from app.extensions import db

class Sale(db.Model):
    __tablename__ = "sales"
    id = db.Column(db.Integer, primary_key=True)
    sale_number = db.Column(db.String, nullable=False)
    total_amount = db.Column(db.Numeric, nullable=False)
    payment_method = db.Column(db.String, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)