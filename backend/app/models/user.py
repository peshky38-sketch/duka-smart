from app.extensions import db

from sqlalchemy.orm import relationship

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String, unique = True, nullable = False)
    email = db.Column(db.String, unique = True, nullable = False)
    password_hash = db.Column(db.String, nullable=False)
    profile_picture =db.Column(db.Text, nullable=True)
    business_id = db.Column (db.Integer, db.ForeignKey("businesses.id"), unique=True, nullable=False)
    business = relationship("Business", back_populates="user")
    


