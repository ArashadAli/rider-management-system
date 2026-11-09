from flask import Blueprint
from controllers.auth_controllers import loginUser, registerUser, logoutUser, get_csrf_token
from schemas.base import validate_request
from schemas.auth_schemas import RegisterSchema, LoginSchema

auth_bp = Blueprint("api/auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@validate_request(body_schema=RegisterSchema())
def register():
    return registerUser()


@auth_bp.route("/login", methods=["POST"])
@validate_request(body_schema=LoginSchema())
def login():
    return loginUser()


@auth_bp.route("/csrf-token", methods=["GET"])
def get_token():
    return get_csrf_token()


@auth_bp.route("/logout", methods=["GET"])
def logout():
    return logoutUser()
