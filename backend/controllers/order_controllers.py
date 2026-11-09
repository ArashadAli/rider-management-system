from flask import request, jsonify
from config.connectDB import db
from models.order_model import Order
from models.rider_model import Rider
import uuid
from datetime import datetime, timedelta
from sqlalchemy import or_
from schemas.base import get_validated_data, get_validated_query

def create_Order(user_email, validated_data=None):
    try:
        data = validated_data or get_validated_data()
        if not data:
            data = request.get_json(silent=True) or {}

        order_id = f"ORD-{uuid.uuid4().hex[:12].upper()}"

        new_order = Order(
            order_id=order_id,
            order_item=data["order_item"].strip(),
            customer_name=data["customer_name"].strip(),
            customer_mobile=data["customer_mobile"].strip(),
            pickup_address=data["pickup_address"].strip(),
            delivery_address=data["delivery_address"].strip(),
            amount=float(data["amount"]),
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
        return jsonify({
            "success": False,
            "message": "Failed to create order",
            "error": str(e)
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
        return jsonify({
            "success": False,
            "message": "Failed to retrieve orders",
            "error": str(e)
        }), 500


def getOrderForPagination(user_email, validated_query=None):
    try:
        query_params = validated_query or get_validated_query() or {}

        page = query_params.get("page", 1)
        limit = query_params.get("limit", 10)
        search = query_params.get("search", "")
        status = query_params.get("status", "")
        rider_id = query_params.get("rider", "")
        selected_date = query_params.get("date")
        sort = query_params.get("sort", "newest")

        # Fallback safeguard
        page = max(int(page), 1)
        if limit not in [5, 10, 25, 50]:
            limit = 10

        # Query optimization: fetch Order entity and Rider.name together in a single LEFT OUTER JOIN
        query = db.session.query(Order, Rider.name.label("rider_name")).outerjoin(
            Rider, Order.rider_id == Rider.id
        )

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Order.order_id.ilike(search_term),
                    Order.customer_name.ilike(search_term),
                    Order.customer_mobile.ilike(search_term)
                )
            )

        if status:
            query = query.filter(Order.status == status)

        if rider_id:
            query = query.filter(Order.rider_id == rider_id)

        if selected_date:
            if isinstance(selected_date, str):
                try:
                    selected_date = datetime.strptime(selected_date, "%Y-%m-%d").date()
                except ValueError:
                    return jsonify({
                        "success": False,
                        "message": "Invalid date format. Use YYYY-MM-DD."
                    }), 400
            start_date = datetime.combine(selected_date, datetime.min.time())
            end_date = start_date + timedelta(days=1)
            query = query.filter(Order.created_at >= start_date, Order.created_at < end_date)

        if sort == "oldest":
            query = query.order_by(Order.created_at.asc())
        elif sort == "amount_low":
            query = query.order_by(Order.amount.asc())
        elif sort == "amount_high":
            query = query.order_by(Order.amount.desc())
        else:
            query = query.order_by(Order.created_at.desc())

        pagination = query.paginate(page=page, per_page=limit, error_out=False)

        # Build response directly without secondary Rider.query lookups (resolves N+1 query issue)
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
                "rider_id": order.rider_id,
                "rider_name": rider_name
            }
            for order, rider_name in pagination.items
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
        return jsonify({
            "success": False,
            "message": "Failed to retrieve orders",
            "error": str(e)
        }), 500


def assign_Rider(order_id, validated_data=None):
    try:
        data = validated_data or get_validated_data()
        if not data:
            data = request.get_json(silent=True) or {}

        rider_id = data.get("rider_id")
        if not rider_id:
            return jsonify({
                "success": False,
                "message": "Rider ID is required"
            }), 400

        order = Order.query.filter_by(order_id=order_id).first()
        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        rider = Rider.query.filter_by(id=rider_id).first()
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
            "data": {
                "id": str(rider.id),
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


def update_Order_Status(order_id, validated_data=None):
    try:
        data = validated_data or get_validated_data()
        if not data:
            data = request.get_json(silent=True) or {}

        status = data.get("status")
        if not status:
            return jsonify({
                "success": False,
                "message": "Status is required"
            }), 400

        order = Order.query.filter_by(order_id=order_id).first()
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

        order.status = status

        if status.lower() in ["delivered", "cancelled"]:
            rider = Rider.query.filter_by(id=order.rider_id).first()
            if rider:
                rider.availability = "available"

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


def get_Single_Order(order_id):
    try:
        # Optimized query: fetch Order and Rider name in a single LEFT OUTER JOIN
        result = db.session.query(Order, Rider.name.label("rider_name")).outerjoin(
            Rider, Order.rider_id == Rider.id
        ).filter(Order.order_id == order_id).first()

        if not result:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        order, rider_name = result

        return jsonify({
            "success": True,
            "message": "Successfully fetched",
            "data": {
                "order_item": order.order_item,
                "order_id": order.order_id,
                "amount": float(order.amount) if order.amount is not None else None,
                "created_at": order.created_at.isoformat() if order.created_at else None,
                "customer_mobile": order.customer_mobile,
                "customer_name": order.customer_name,
                "delivery_address": order.delivery_address,
                "pickup_address": order.pickup_address,
                "status": order.status,
                "rider_id": order.rider_id,
                "rider_name": rider_name
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Order not fetched",
            "error": str(e)
        }), 500


def delete_Order(order_id):
    try:
        order = Order.query.filter_by(order_id=order_id).first()
        if not order:
            return jsonify({
                "success": False,
                "message": "Order not found"
            }), 404

        if order.rider_id:
            rider = Rider.query.filter_by(id=order.rider_id).first()
            if rider:
                rider.availability = "available"

        db.session.delete(order)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Order deleted successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Server error",
            "error": str(e)
        }), 500
