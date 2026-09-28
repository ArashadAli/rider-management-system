from flask import Flask
from flask_jwt_extended import JWTManager
from routes.user import user_bp
from routes.auth import auth_bp
from config.connectDB import db
from dotenv import load_dotenv
from flask_cors import CORS
import os

load_dotenv()

app = Flask(__name__)


# JWT configuration
app.config["JWT_SECRET_KEY"] = os.getenv("SECRET_KEY")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int( os.getenv("SECRET_KEY_EXPIRY"))
app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
app.config["JWT_COOKIE_SECURE"] = False
app.config["JWT_COOKIE_HTTPONLY"] = True

jwt = JWTManager(app)


# CORS configuration

CORS(
    app,
    origins= ["http://localhost:4200"],
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

app.register_blueprint(user_bp, url_prefix="/api/users")


@app.route("/")
def hello():
    return "Hello, World!"


if __name__ == "__main__":
    app.run(debug=True)