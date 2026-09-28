from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from functools import wraps

def token_required(func):

    @wraps(func)
    def wrapper(*args, **kwargs):

        try:
            verify_jwt_in_request()
            user_email= get_jwt_identity()


            return func(user_email, *args, **kwargs)

        except Exception:

            return jsonify({
                "success": False,
                "message": "Unauthorized"
            }), 401

    return wrapper

