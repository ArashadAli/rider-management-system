from flask import request, jsonify
from config.connectDB import db
from models.order_model import Order
import uuid
import re


def create_Order(user_email):

    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        required_fields = [
            "order_item",
            "customer_name",
            "customer_mobile",
            "pickup_address",
            "delivery_address",
            "amount"
        ]

        missing_fields = [
            field for field in required_fields
            if field not in data
        ]

        if missing_fields:
            return jsonify({
                "success": False,
                "message": "Required fields are missing",
                "missing_fields": missing_fields
            }), 400

        order_item = data.get("order_item")
        customer_name = data.get("customer_name")
        customer_mobile = data.get("customer_mobile")
        pickup_address = data.get("pickup_address")
        delivery_address = data.get("delivery_address")
        amount = data.get("amount")

        string_fields = {
            "order_item": order_item,
            "customer_name": customer_name,
            "customer_mobile": customer_mobile,
            "pickup_address": pickup_address,
            "delivery_address": delivery_address
        }

        for field, value in string_fields.items():

            if not isinstance(value, str):
                return jsonify({
                    "success": False,
                    "message": f"{field} must be a string"
                }), 400

            if not value.strip():
                return jsonify({
                    "success": False,
                    "message": f"{field} cannot be empty"
                }), 400

        if not re.fullmatch(r"\d{10}", customer_mobile):
            return jsonify({
                "success": False,
                "message": "Customer mobile must contain exactly 10 digits"
            }), 400

        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return jsonify({
                "success": False,
                "message": "Amount must be a valid number"
            }), 400

        if amount <= 0:
            return jsonify({
                "success": False,
                "message": "Amount must be greater than 0"
            }), 400

        order_id = f"ORD-{uuid.uuid4().hex[:12].upper()}"

        new_order = Order(
            order_id=order_id,
            order_item=order_item.strip(),
            customer_name=customer_name.strip(),
            customer_mobile=customer_mobile,
            pickup_address=pickup_address.strip(),
            delivery_address=delivery_address.strip(),
            amount=amount,
            status="pending",
            rider_id=None
        )

        db.session.add(new_order)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Order created successfully",
            "data": {
                "order_id": new_order.order_id,
                "order_item": new_order.order_item,
                "customer_name": new_order.customer_name,
                "customer_mobile": new_order.customer_mobile,
                "pickup_address": new_order.pickup_address,
                "delivery_address": new_order.delivery_address,
                "amount": float(new_order.amount),
                "status": new_order.status,
                "created_by": user_email,
                "created_at": new_order.created_at.isoformat() if new_order.created_at else None,
                "rider_id": new_order.rider_id
            }
        }), 201

    except Exception as e:

        db.session.rollback()

        # print("Order creation error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Failed to create order"
        }), 500


def allOrders(user_email):

    try:
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 10, type=int)

        if page < 1:
            page = 1

        if limit not in [10, 25, 50]:
            limit = 10

        pagination = (
            Order.query
            .order_by(Order.created_at.desc())
            .paginate(
                page=page,
                per_page=limit,
                error_out=False
            )
        )

        orders_list = [
            {
                "order_id": order.order_id,
                "order_item": order.order_item,
                "customer_name": order.customer_name,
                "customer_mobile": order.customer_mobile,
                "pickup_address": order.pickup_address,
                "delivery_address": order.delivery_address,
                "amount": float(order.amount),
                "status": order.status,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "rider_id": order.rider_id
            }
            for order in pagination.items
        ]

        return jsonify({
            "success": True,
            "message": "Orders retrieved successfully",
            "data": {
                "orders": orders_list,
                "current_page": pagination.page,
                "page_size": pagination.per_page,
                "total_orders": pagination.total,
                "total_pages": pagination.pages,
                "has_next": pagination.has_next,
                "has_previous": pagination.has_prev
            }
        }), 200

    except Exception as e:

        print("Get orders error:", e)

        return jsonify({
            "success": False,
            "message": "Failed to retrieve orders"
        }), 500