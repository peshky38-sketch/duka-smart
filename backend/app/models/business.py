from app.extensions import db
from sqlalchemy.orm import relationship

class Business(db.Model):
    __tablename__ = "businesses"
    id = db.Column(db.Integer, primary_key=True)
    business_name = db.Column(db.String, nullable=False)
    business_type = db.Column(db.String, nullable=False)
    currency =db.Column(db.String, nullable=False)
    email = db.Column(db.String, unique=True, nullable = False)
    phone_number = db.Column(db.String, unique=True, nullable = False)
    business_address = db.Column(db.String, nullable=False)
    logo = db.Column(db.String, nullable=False)
    user = relationship("User", uselist=False, back_populates="business")