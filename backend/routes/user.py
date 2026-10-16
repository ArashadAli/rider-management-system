from flask import Blueprint
from middleware.auth_middleware import token_required
from controllers.user_controllers import user_dashboard, user_profile, update_user_profile, change_user_password

user_bp = Blueprint("api/users", __name__)


@user_bp.route("/dashboard", methods= ["GET"])
@token_required

def dashboard(user_email):
    return user_dashboard(user_email)

@user_bp.route("/me", methods= ["GET"])
@token_required

def profile(user_email):
    return user_profile(user_email)


@user_bp.route("/update-profile", methods=["PUT"])
@token_required
def update_profile(user_email):
    return update_user_profile(user_email)


@user_bp.route("/change-password", methods=["PUT"])
@token_required
def change_password(user_email):
    return change_user_password(user_email)

