from flask import request, jsonify
from config.connectDB import db
from models.order_model import Order
from models.rider_model import Rider
import uuid
import re
from datetime import datetime, timedelta
from sqlalchemy import or_


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
        orders = Order.query.order_by(Order.created_at.desc()).all()

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
            for order in orders
        ]

        return jsonify({
            "success": True,
            "message": "Orders retrieved successfully",
            "data": orders_list
        }), 200

    except Exception as e:

        # print("Get all orders error:", repr(e))

        return jsonify({
            "success": False,
            "message": "Failed to retrieve orders"
        }), 500


def getOrderForPagination(user_email):
    try:
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 10, type=int)

        search = request.args.get("search", "").strip()
        status = request.args.get("status", "").strip()
        rider_id = request.args.get("rider", "").strip()
        date_filter = request.args.get("date", "").strip()
        sort = request.args.get("sort", "newest").strip()

        page = max(page, 1)

        if limit not in [5, 10, 25, 50]:
            limit = 10


        query = Order.query.outerjoin(Rider, Order.rider_id == Rider.id)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Order.order_id.ilike(search_term),
                    Order.order_item.ilike(search_term),
                    Order.customer_name.ilike(search_term),
                    Order.customer_mobile.ilike(search_term),
                    Order.pickup_address.ilike(search_term),
                    Order.delivery_address.ilike(search_term),
                    Rider.name.ilike(search_term)
                )
            )


        if status:
            query = query.filter(Order.status == status)


        if rider_id:
            query = query.filter(Order.rider_id == rider_id)

        if date_filter:
            try:
                selected_date = datetime.strptime(date_filter, "%Y-%m-%d").date()
                start_date = datetime.combine(selected_date, datetime.min.time())
                end_date = start_date + timedelta(days = 1)

                query = query.filter(Order.created_at >= start_date, Order.created_at < end_date)

            except ValueError:
                return jsonify({
                    "success": False,
                    "message": "Invalid date format. Use YYYY-MM-DD."
                }), 400

        if sort == "oldest":
            query = query.order_by(Order.created_at.asc())
        elif sort == "amount_low":
            query = query.order_by(Order.amount.asc())
        elif sort == "amount_high":
            query = query.order_by(Order.amount.desc())
        else:
            query = query.order_by(Order.created_at.desc())


        pagination = query.paginate(page = page, per_page=limit, error_out=False)

        orders_list = []

        for order in pagination.items:
            rider_name = None

            if order.rider_id is not None:
                rider = Rider.query.filter_by(
                    id=order.rider_id
                ).first()

                if rider:
                    rider_name = rider.name

            orders_list.append({
                "order_id": order.order_id,
                "order_item": order.order_item,
                "customer_name": order.customer_name,
                "customer_mobile": order.customer_mobile,
                "pickup_address": order.pickup_address,
                "delivery_address": order.delivery_address,
                "amount": float(order.amount),
                "status": order.status,
                "created_at": (
                    order.created_at.isoformat()
                    if order.created_at else None
                ),
                "rider_id": order.rider_id,
                "rider_name": rider_name
            })

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



def assign_Rider(order_id):
    try:
        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        rider_id = data.get("rider_id")
        if not rider_id:
            return jsonify({
                "success": False,
                "message": "Rider ID is required"
            }), 400

        order = Order.query.filter_by(order_id = order_id).first()

        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        rider = Rider.query.filter_by(id = rider_id).first()

        if not rider:
            return jsonify({
                "success": False,
                "message": "Rider not found"
            }), 404

        if rider.status != "active":
            return jsonify({
                "success": False,
                "message": "Rider is not available"
            }), 400

        if order.rider_id is not None:
            return jsonify({
                "success": False,
                "message": "Order is already has an assigned rider"
            }), 400

        order.rider_id = rider.id

        rider.availability = "busy"

        order.status = "assigned"

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Rider assigned successfully",
            "data":{
                "id": rider.id,
                "name": rider.name,
                "email": rider.email,
                "mobile": rider.mobile,
                "status": rider.status,
                "availability": rider.availability
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to assign rider",
            "error": str(e)
        }), 500


def update_Order_Status(order_id):
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        order = Order.query.filter_by(order_id = order_id).first()

        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        if order.rider_id is None:
            return jsonify({
                "success": False,
                "message": "Rider not assigned"
            }), 400

        status = data.get("status")

        if not status:
            return jsonify({
                "success": False,
                "message": "Status is required"
            }), 400

        order.status = status

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Order updated successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Server error",
            "error": str(e)
        }), 500
