from flask import Blueprint
from middleware.auth_middleware import token_required
from flask import jsonify
from controllers.order_controllers import create_Order

order_bp = Blueprint("api/orders", __name__)

# print("order route called")

@order_bp.route("/create", methods=["POST"])
@token_required

def create_order(user_email):
    return create_Order(user_email)