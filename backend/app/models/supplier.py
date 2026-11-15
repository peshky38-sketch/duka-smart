from app.extensions import db

class Supplier(db.Model):
    __tablename__ = "suppliers"
    id = db.Column(db.Integer, primary_key=True)
    supplier_name = db.Column(db.String, nullable=False)
    email = db.Column(db.String)
    phone_number = db.Column(db.String, nullable=False)
    address = db.Column(db.String)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)