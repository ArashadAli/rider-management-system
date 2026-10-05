from flask import Blueprint
from middleware.auth_middleware import token_required
from controllers.order_controllers import create_Order, allOrders, getOrderForPagination

order_bp = Blueprint("api/orders", __name__)

# print("order route called")

@order_bp.route("/create", methods=["POST"])
@token_required

def create_order(user_email):
    return create_Order(user_email)


@order_bp.route("/pagination", methods=["GET"])
@token_required

def get_paginated_orders(user_email):
    return getOrderForPagination(user_email)


@order_bp.route("/allOrders", methods=["GET"])
@token_required
def get_all_orders(user_email):
    return allOrders(user_email)
