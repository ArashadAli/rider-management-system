from flask import jsonify, request
from sqlalchemy import func, case
from werkzeug.security import generate_password_hash, check_password_hash
from config.connectDB import db
from models.user_model import User
from models.order_model import Order
from models.rider_model import Rider
from schemas.base import get_validated_data

def user_dashboard(user_email):
    try:
        # Consolidated query 1: Order counts and sum in a single database roundtrip
        order_metrics = db.session.query(
            func.count(Order.id).label("total_orders"),
            func.count(case((Order.status == "pending", Order.id))).label("pending_orders"),
            func.count(case((Order.status == "delivered", Order.id))).label("delivered_orders"),
            func.count(case((Order.status == "assigned", Order.id))).label("assigned_orders"),
            func.count(case((Order.status == "cancelled", Order.id))).label("cancelled_orders"),
            func.coalesce(func.sum(Order.amount), 0).label("total_order_value")
        ).one()

        total_orders = order_metrics.total_orders or 0
        pending_orders = order_metrics.pending_orders or 0
        delivered_orders = order_metrics.delivered_orders or 0
        assigned_orders = order_metrics.assigned_orders or 0
        cancelled_orders = order_metrics.cancelled_orders or 0
        total_order_value = float(order_metrics.total_order_value or 0)

        # Consolidated query 2: Rider status and availability in a single database roundtrip
        rider_metrics = db.session.query(
            func.count(Rider.id).label("total_riders"),
            func.count(case((Rider.status == "active", Rider.id))).label("active_riders"),
            func.count(case((Rider.status == "inactive", Rider.id))).label("inactive_riders"),
            func.count(case((Rider.availability == "available", Rider.id))).label("available_riders"),
            func.count(case((Rider.availability != "available", Rider.id))).label("unavailable_riders")
        ).one()

        total_riders = rider_metrics.total_riders or 0
        active_riders = rider_metrics.active_riders or 0
        inactive_riders = rider_metrics.inactive_riders or 0
        available_riders = rider_metrics.available_riders or 0
        unavailable_riders = rider_metrics.unavailable_riders or 0

        # Percentages
        success_rate = (delivered_orders / total_orders * 100) if total_orders > 0 else 0
        pending_percentage = (pending_orders / total_orders * 100) if total_orders > 0 else 0
        delivered_percentage = (delivered_orders / total_orders * 100) if total_orders > 0 else 0
        assigned_percentage = (assigned_orders / total_orders * 100) if total_orders > 0 else 0
        cancelled_percentage = (cancelled_orders / total_orders * 100) if total_orders > 0 else 0

        # Recent records
        recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
        recent_riders = Rider.query.order_by(
            func.greatest(Rider.created_at, Rider.updated_at).desc()
        ).limit(5).all()

        recent_orders_data = [
            {
                "id": order.id,
                "order_id": order.order_id,
                "order_item": order.order_item,
                "customer_name": order.customer_name,
                "customer_mobile": order.customer_mobile,
                "pickup_address": order.pickup_address,
                "delivery_address": order.delivery_address,
                "amount": float(order.amount),
                "status": order.status,
                "rider_id": order.rider_id,
                "created_at": order.created_at.isoformat() if order.created_at else None
            }
            for order in recent_orders
        ]

        recent_riders_data = [
            {
                "id": str(rider.id),
                "name": rider.name,
                "email": rider.email,
                "mobile": rider.mobile,
                "vehicle_type": rider.vehicle_type,
                "vehicle_number": rider.vehicle_number,
                "profile_image_url": rider.profile_image_url,
                "status": rider.status,
                "availability": rider.availability,
                "created_at": rider.created_at.isoformat() if rider.created_at else None,
                "updated_at": rider.updated_at.isoformat() if rider.updated_at else None
            }
            for rider in recent_riders
        ]

        return jsonify({
            "success": True,
            "data": {
                "metrics": {
                    "total_orders": total_orders,
                    "active_riders": active_riders,
                    "pending_orders": pending_orders,
                    "delivered_orders": delivered_orders,
                    "total_order_value": total_order_value,
                    "success_rate": round(success_rate, 2)
                },
                "order_overview": {
                    "pending": {
                        "count": pending_orders,
                        "percentage": round(pending_percentage, 2)
                    },
                    "delivered": {
                        "count": delivered_orders,
                        "percentage": round(delivered_percentage, 2)
                    },
                    "assigned": {
                        "count": assigned_orders,
                        "percentage": round(assigned_percentage, 2)
                    },
                    "cancelled": {
                        "count": cancelled_orders,
                        "percentage": round(cancelled_percentage, 2)
                    }
                },
                "rider_overview": {
                    "total": total_riders,
                    "active": active_riders,
                    "inactive": inactive_riders,
                    "available": available_riders,
                    "unavailable": unavailable_riders
                },
                "recent_orders": recent_orders_data,
                "recent_riders": recent_riders_data
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to load dashboard metrics",
            "error": str(e)
        }), 500


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


def update_user_profile(user_email, validated_data=None):
    try:
        data = validated_data or get_validated_data()
        if not data:
            data = request.get_json(silent=True) or {}

        user = User.query.filter_by(email=user_email).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        user_name = data.get("name")
        user_mobile = data.get("mobile")

        if user_mobile:
            existing_mobile = User.query.filter(User.mobile == user_mobile, User.email != user_email).first()
            if existing_mobile:
                return jsonify({
                    "success": False,
                    "message": "Mobile number already in use by another account"
                }), 409
            user.mobile = user_mobile

        if user_name:
            user.name = user_name

        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Profile updated successfully",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "mobile": user.mobile
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Server error",
            "error": str(e)
        }), 500


def change_user_password(user_email, validated_data=None):
    try:
        data = validated_data or get_validated_data()
        if not data:
            data = request.get_json(silent=True) or {}

        user = User.query.filter_by(email=user_email).first()
        if not user:
            return jsonify({
                "success": False,
                "message": "User not found"
            }), 404

        current_password = data.get("currentPassword")
        new_password = data.get("newPassword")

        if not current_password or not new_password:
            return jsonify({
                "success": False,
                "message": "current password and new password both fields are required"
            }), 400

        if not check_password_hash(user.password, current_password):
            return jsonify({
                "success": False,
                "message": "Current password and login password mismatch"
            }), 400

        user.password = generate_password_hash(new_password)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Password updated"
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Server error",
            "error": str(e)
        }), 500
