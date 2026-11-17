import os

from flask import Flask, jsonify
from flask_cors import CORS

from app.extensions import db, migrate, jwt


def create_app():
    app = Flask(__name__)

    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["JWT_SECRET_KEY"] = os.getenv("JWT_SECRET_KEY")

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv(
        "DATABASE_URL",
        "sqlite:///dukas_mart.db"
    )

    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    from app import models
    migrate.init_app(app, db)
    jwt.init_app(app)

    from app.routes.auth import auth
    app.register_blueprint(auth)
    from app.routes.products import products
    app.register_blueprint(products)
    from app.routes.categories import categories
    app.register_blueprint(categories)
    from app.routes.suppliers import suppliers
    app.register_blueprint(suppliers)

    CORS(
        app,
        resources={
            r"/api/*": {
                "origins": [
                    "http://localhost:5173",
                    "http://localhost:5174"
                ]
            }
        }
    )

    @app.route("/api/health")
    def health():
        return jsonify({
            "status": "success",
            "message": "DukaSmart API is running"
        }), 200

    return app