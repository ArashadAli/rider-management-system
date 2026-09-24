from flask import Blueprint, request, jsonify
import re

user_bp = Blueprint("users", __name__)


@user_bp.route("/register", methods=["POST"])
def registerUser():

    user = request.get_json()

    if not user:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    name = user.get("name")
    email = user.get("email")
    mobile = user.get("mobile")
    password = user.get("password")
    confirm_password = user.get("confirm_password")

    if not name:
        return jsonify({
            "success": False,
            "message": "Name is required"
        }), 400

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required"
        }), 400

    if not mobile:
        return jsonify({
            "success": False,
            "message": "Mobile number is required"
        }), 400

    if not password:
        return jsonify({
            "success": False,
            "message": "Password is required"
        }), 400

    if not confirm_password:
        return jsonify({
            "success": False,
            "message": "Confirm password is required"
        }), 400

    email_pattern = r"^[\w\.-]+@[\w\.-]+\.\w+$"

    if not re.match(email_pattern, email):
        return jsonify({
            "success": False,
            "message": "Invalid email format"
        }), 400

    mobile_pattern = r"^[6-9]\d{9}$"

    if not re.match(mobile_pattern, mobile):
        return jsonify({
            "success": False,
            "message": "Invalid mobile number"
        }), 400

    if len(password) < 8:
        return jsonify({
            "success": False,
            "message": "Password must be at least 8 characters"
        }), 400

    if password != confirm_password:
        return jsonify({
            "success": False,
            "message": "Password and confirm password do not match"
        }), 400

    # print("User data received:", user)

    return jsonify({
        "success": True,
        "message": "User registration successful",
        "user": {
            "name": name,
            "email": email,
            "mobile": mobile
        }
    }), 201