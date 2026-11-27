from app.extensions import db

class StockMovement(db.Model):
    __tablename__ = "stock_movements"
    id = db.Column(db.Integer, primary_key=True)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    movement_type = db.Column(db.String, nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    note = db.Column(db.String, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False)
    business_id = db.Column(db.Integer, db.ForeignKey("businesses.id"), nullable=False)
