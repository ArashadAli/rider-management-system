from flask import request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, unset_access_cookies, set_access_cookies
from models.user_model import User
from config.connectDB import db
from schemas.base import get_validated_data

def registerUser(validated_data=None):
    data = validated_data or get_validated_data()
    if not data:
        data = request.get_json(silent=True) or {}

    name = data.get("name")
    email = data.get("email")
    mobile = data.get("mobile")
    password = data.get("password")

    existing_user = User.query.filter((User.email == email) | (User.mobile == mobile)).first()
    if existing_user:
        msg = "User with this email already exists" if existing_user.email == email else "User with this mobile number already exists"
        return jsonify({
            "success": False,
            "message": msg
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


def loginUser(validated_data=None):
    data = validated_data or get_validated_data()
    if not data:
        data = request.get_json(silent=True) or {}

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if not user or not check_password_hash(user.password, password):
        return jsonify({
            "success": False,
            "message": "Invalid email or password"
        }), 401

    access_token = create_access_token(identity=user.email)

    response = jsonify({
        "success": True,
        "message": "Login successful",
        "access_token": access_token,
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile
        }
    })

    set_access_cookies(response, access_token)
    return response, 200


def logoutUser():
    response = jsonify({
        "success": True,
        "message": "logout successfully"
    })
    unset_access_cookies(response)
    return response, 200


def get_csrf_token():
    csrf_token = request.cookies.get("csrf_access_token")
    if not csrf_token:
        return jsonify({
            "success": False,
            "message": "CSRF token not found"
        }), 401

    return jsonify({
        "success": True,
        "csrf_token": csrf_token
    }), 200
