from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from utils.email_mobile_validate import validate_email, validate_mobile
from flask_jwt_extended import create_access_token
from models.user_model import User
from config.connectDB import db

from flask_jwt_extended import set_access_cookies

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

    if not validate_email(email):
        return jsonify({
            "success": False,
            "message": "Invalid email format"
        }), 400
    
    if not validate_mobile(mobile):
        return jsonify({
            "success": False,
            "message": "Invalid mobile number format"
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

    existing_user = User.query.filter((User.email == email) | (User.mobile == mobile)).first()

    if existing_user:
        return jsonify({
            "success":False,
            "message":"User with this email or mobile number already exists"
        }), 409

    hashed_password = generate_password_hash(password)

    new_user = User(
        name=name,
        email=email,
        mobile=mobile,
        password=hashed_password
    )
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "success": True,
        "message": "User registered successfully"
    }), 201


def loginUser():
    data = request.get_json()

    if not data:
        return jsonify({
            "success": False,
            "message": "Request body is required"
        }), 400

    email = data.get("email")
    password = data.get("password")

    if not email:
        return jsonify({
            "success": False,
            "message": "Email is required"
        }), 400

    if not password:
        return jsonify({
            "success": False,
            "message": "Password is required"
        }), 400

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    access_token = create_access_token(identity=(user.email))


    response = jsonify({
        "success": True,
        "message": "Login successful",
        "access-token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile
        }
    })

    set_access_cookies(response, access_token)

    return response, 200