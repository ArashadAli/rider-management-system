from flask import jsonify
from models.user_model import User

def user_dashboard(user_email):

    print("user email:", user_email)

    return jsonify({
        "message": "token verified",
        "success": True
    }), 200

def user_profile(user_email):


    user = User.query.filter_by(email=user_email).first()

    if not user:
        return jsonify({
            "success": False,
            "message": "User not found"
        }), 404

    return jsonify({
        "success": True,
        "message": "Valid user",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "mobile": user.mobile
        }
    }), 200