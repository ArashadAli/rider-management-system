from flask import request, jsonify
from config.connectDB import db
from models.order_model import Order, OrderStatusHistory
from models.rider_model import Rider
import uuid
import os
import json
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from sqlalchemy import or_
from schemas.base import get_validated_data, get_validated_query

ORDER_TRANSITIONS = {
    "created": ["assigned", "cancelled"],
    "assigned": ["accepted", "cancelled"],
    "accepted": ["picked_up", "cancelled"],
    "picked_up": ["on_the_way", "cancelled"],
    "on_the_way": ["delivered", "cancelled"],
    "delivered": [],
    "cancelled": []
}

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
            status="created",
            rider_id=None
        )

        db.session.add(new_order)
        db.session.flush()

        initial_history = OrderStatusHistory(
            order_id=new_order.order_id,
            from_status=None,
            to_status="created",
            changed_by=user_email
        )
        db.session.add(initial_history)
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
                "next_statuses": ORDER_TRANSITIONS.get(order.status, []),
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
        start_date = query_params.get("start_date")
        end_date = query_params.get("end_date")
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

        if selected_date and not start_date and not end_date:
            start_date = selected_date
            end_date = selected_date

        try:
            if isinstance(start_date, str):
                start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
            if isinstance(end_date, str):
                end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
        except ValueError:
            return jsonify({
                "success": False,
                "message": "Invalid date format. Use YYYY-MM-DD."
            }), 400

        if start_date and end_date and start_date > end_date:
            return jsonify({
                "success": False,
                "message": "Start date cannot be after end date."
            }), 400

        if start_date:
            start_dt = datetime.combine(start_date, datetime.min.time())
            query = query.filter(Order.created_at >= start_dt)

        if end_date:
            end_dt = datetime.combine(end_date, datetime.min.time()) + timedelta(days=1)
            query = query.filter(Order.created_at < end_dt)

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
                "next_statuses": ORDER_TRANSITIONS.get(order.status, []),
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

        if order.status != "created":
            return jsonify({
                "success": False,
                "message": f"Cannot assign rider to an order in '{order.status}' status. Only created orders can be assigned."
            }), 400

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
                "message": "Order already has an assigned rider"
            }), 400

        previous_status = order.status
        order.rider_id = rider.id
        rider.availability = "busy"
        order.status = "assigned"

        history_entry = OrderStatusHistory(
            order_id=order.order_id,
            from_status=previous_status,
            to_status="assigned",
            changed_by=f"Assigned to {rider.name}"
        )
        db.session.add(history_entry)
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

        current_status = order.status
        allowed_next = ORDER_TRANSITIONS.get(current_status, [])

        if status not in allowed_next:
            return jsonify({
                "success": False,
                "message": f"Invalid status transition from '{current_status}' to '{status}'. Allowed: {allowed_next}"
            }), 400

        if status == "assigned":
            return jsonify({
                "success": False,
                "message": "Please assign a rider using the assign rider action to update status to 'assigned'."
            }), 400

        if status == "cancelled":
            if current_status in ["delivered", "cancelled"]:
                return jsonify({
                    "success": False,
                    "message": f"Orders cannot be cancelled once in '{current_status}' status."
                }), 400

            order.status = "cancelled"
            if order.rider_id is not None:
                rider = Rider.query.filter_by(id=order.rider_id).first()
                if rider and rider.status == "active":
                    other_active_order = Order.query.filter(
                        Order.rider_id == rider.id,
                        Order.order_id != order.order_id,
                        Order.status.notin_(["delivered", "cancelled"])
                    ).first()
                    if not other_active_order:
                        rider.availability = "available"

            history_entry = OrderStatusHistory(
                order_id=order.order_id,
                from_status=current_status,
                to_status="cancelled",
                changed_by="Cancelled by user"
            )
            db.session.add(history_entry)
            db.session.commit()
            return jsonify({
                "success": True,
                "message": "Order cancelled successfully"
            }), 200

        if order.rider_id is None:
            return jsonify({
                "success": False,
                "message": "Rider not assigned"
            }), 400

        order.status = status

        if status.lower() == "delivered":
            rider = Rider.query.filter_by(id=order.rider_id).first()
            if rider and rider.status == "active":
                other_active_order = Order.query.filter(
                    Order.rider_id == rider.id,
                    Order.order_id != order.order_id,
                    Order.status.notin_(["delivered", "cancelled"])
                ).first()
                if not other_active_order:
                    rider.availability = "available"

        history_entry = OrderStatusHistory(
            order_id=order.order_id,
            from_status=current_status,
            to_status=status,
            changed_by="Status update"
        )
        db.session.add(history_entry)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": f"Order status updated to '{status}' successfully"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Server error",
            "error": str(e)
        }), 500


def autocomplete_Address():
    try:
        text = request.args.get("text", "").strip()
        if not text:
            return jsonify({
                "success": True,
                "data": []
            }), 200

        api_key = os.getenv("GEOAPIFY_API_KEY")
        if not api_key:
            return jsonify({
                "success": False,
                "message": "Geoapify API key is not configured"
            }), 500

        encoded_text = urllib.parse.quote(text)
        url = f"https://api.geoapify.com/v1/geocode/autocomplete?text={encoded_text}&apiKey={api_key}"

        req = urllib.request.Request(
            url,
            headers={"User-Agent": "RiderManagementSystem/1.0"}
        )
        with urllib.request.urlopen(req, timeout=5) as response:
            if response.status != 200:
                return jsonify({
                    "success": False,
                    "message": "Failed to fetch suggestions from map provider"
                }), 502

            raw_data = json.loads(response.read().decode("utf-8"))
            features = raw_data.get("features", [])

            suggestions = []
            for feat in features:
                props = feat.get("properties", {})
                formatted = props.get("formatted")
                if formatted:
                    suggestions.append({
                        "formatted": formatted,
                        "address_line1": props.get("address_line1", formatted),
                        "address_line2": props.get("address_line2", ""),
                        "city": props.get("city", ""),
                        "country": props.get("country", ""),
                        "lat": props.get("lat"),
                        "lon": props.get("lon")
                    })

            return jsonify({
                "success": True,
                "data": suggestions
            }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Error fetching address autocomplete",
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

        history_records = OrderStatusHistory.query.filter_by(order_id=order.order_id).order_by(OrderStatusHistory.changed_at.asc()).all()
        history_list = [h.to_dict() for h in history_records]

        if not history_list:
            history_list = [{
                "id": None,
                "order_id": order.order_id,
                "from_status": None,
                "to_status": order.status,
                "changed_at": order.created_at.isoformat() if order.created_at else None,
                "changed_by": "System"
            }]

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
                "next_statuses": ORDER_TRANSITIONS.get(order.status, []),
                "history": history_list,
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
