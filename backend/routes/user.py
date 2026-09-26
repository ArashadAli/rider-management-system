from flask import Blueprint
from controllers.user_controllers import loginUser, registerUser

user_bp = Blueprint("users", __name__)


@user_bp.route("/register", methods=["POST"])
def register():
    return registerUser()


@user_bp.route("/login", methods=["POST"])
def login():
    return loginUser()