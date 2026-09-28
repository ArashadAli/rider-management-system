from flask import Blueprint
from controllers.auth_controllers import loginUser, registerUser, logoutUser

auth_bp = Blueprint("api/auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    return registerUser()


@auth_bp.route("/login", methods=["POST"])
def login():
    return loginUser()

@auth_bp.route("/logout", methods=["GET"])
def logout():
    return logoutUser()

