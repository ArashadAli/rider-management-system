from flask import Blueprint
from middleware.auth_middleware import token_required
from flask import jsonify

user_bp = Blueprint("api/users", __name__)


@user_bp.route("/dashboard", methods= ["GET"])
@token_required

def dashboard(user_email):
    print("user email : ", user_email)

    return jsonify({
        "message": "token verified",
        "success": True
    }), 200

@user_bp.route("/me", methods= ["GET"])
@token_required

def profile(user_email):

    return jsonify({
        "message":"valid user",
        "success": True,
        "user_email": user_email
    }), 200

