from flask import Flask
from flask_jwt_extended import JWTManager
from routes.user import user_bp
from routes.auth import auth_bp
from routes.order import order_bp
from routes.rider import rider_bp
from config.connectDB import db
from dotenv import load_dotenv
from flask_cors import CORS
from models.order_model import Order
from models.rider_model import Rider
import os

load_dotenv()

app = Flask(__name__)


# JWT configuration
app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int( os.getenv("SECRET_KEY_EXPIRY"))
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
app.config["JWT_COOKIE_SECURE"] = os.getenv("JWT_COOKIE_SECURE", "False").lower() == "true"
app.config["JWT_COOKIE_HTTPONLY"] = True
app.config["JWT_COOKIE_SAMESITE"] = os.getenv("JWT_COOKIE_SAMESITE","Lax")
app.config["JWT_COOKIE_CSRF_PROTECT"] = True
app.config["JWT_ACCESS_CSRF_HEADER_NAME"] = "X-CSRF-TOKEN"

jwt = JWTManager(app)


# CORS configuration

CORS(
    app,
    origins= ["http://localhost:4200", "http://localhost:8080", "https://rider-management-system-lyart.vercel.app"],
    supports_credentials= True
)


# Database configuration
app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("POSTGRE_CONNECTION_STRING")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)

with app.app_context():
    db.create_all()


# Auth Route
app.register_blueprint(auth_bp, url_prefix="/api/auth")

# User Route
app.register_blueprint(user_bp, url_prefix="/api/users")

# Order Route
app.register_blueprint(order_bp, url_prefix="/api/orders")

# Rider Route
app.register_blueprint(rider_bp, url_prefix="/api/riders")

if __name__ == "__main__":
    app.run(debug=True)