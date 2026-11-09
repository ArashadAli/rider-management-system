from flask import Blueprint
from middleware.auth_middleware import token_required
from controllers.order_controllers import (
    create_Order,
    allOrders,
    getOrderForPagination,
    assign_Rider,
    update_Order_Status,
    get_Single_Order,
    delete_Order
)
from schemas.base import validate_request
from schemas.order_schemas import (
    OrderCreateSchema,
    OrderPaginationQuerySchema,
    OrderAssignRiderSchema,
    OrderStatusUpdateSchema
)

order_bp = Blueprint("api/orders", __name__)


@order_bp.route("/create", methods=["POST"])
@token_required
@validate_request(body_schema=OrderCreateSchema())
def create_order(user_email):
    return create_Order(user_email)


@order_bp.route("/pagination", methods=["GET"])
@token_required
@validate_request(query_schema=OrderPaginationQuerySchema())
def get_paginated_orders(user_email):
    return getOrderForPagination(user_email)


@order_bp.route("/allOrders", methods=["GET"])
@token_required
def get_all_orders(user_email):
    return allOrders(user_email)


@order_bp.route("/assign-rider/<string:order_id>", methods=["POST"])
@token_required
@validate_request(body_schema=OrderAssignRiderSchema())
def assign_rider(user_email, order_id):
    return assign_Rider(order_id)


@order_bp.route("/update-order-status/<string:order_id>", methods=["POST"])
@token_required
@validate_request(body_schema=OrderStatusUpdateSchema())
def update_order_status(user_email, order_id):
    return update_Order_Status(order_id)


@order_bp.route("/single-order/<string:order_id>", methods=["GET"])
@token_required
def get_single_order(user_email, order_id):
    return get_Single_Order(order_id)


@order_bp.route("/delete-order/<string:order_id>", methods=["DELETE"])
@token_required
def delete_order(user_email, order_id):
    return delete_Order(order_id)
