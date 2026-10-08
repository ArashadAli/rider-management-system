from flask import jsonify
from sqlalchemy import func
from models.user_model import User

from config.connectDB import db
from models.order_model import Order
from models.rider_model import Rider

def user_dashboard(user_email):
    total_orders = db.session.query(func.count(Order.id)).scalar() or 0

    pending_orders = db.session.query(
        func.count(Order.id)
    ).filter(
        Order.status == "pending"
    ).scalar() or 0

    delivered_orders = db.session.query(
        func.count(Order.id)
    ).filter(
        Order.status == "delivered"
    ).scalar() or 0

    assigned_orders = db.session.query(
        func.count(Order.id)
    ).filter(
        Order.status == "assigned"
    ).scalar() or 0

    cancelled_orders = db.session.query(
        func.count(Order.id)
    ).filter(
        Order.status == "cancelled"
    ).scalar() or 0

    total_order_value = db.session.query(
        func.coalesce(func.sum(Order.amount), 0)
    ).scalar()

    success_rate = (
        (delivered_orders / total_orders) * 100
        if total_orders > 0
        else 0
    )

    pending_percentage = (
        (pending_orders / total_orders) * 100
        if total_orders > 0
        else 0
    )

    delivered_percentage = (
        (delivered_orders / total_orders) * 100
        if total_orders > 0
        else 0
    )

    assigned_percentage = (
        (assigned_orders / total_orders) * 100
        if total_orders > 0
        else 0
    )

    cancelled_percentage = (
        (cancelled_orders / total_orders) * 100
        if total_orders > 0
        else 0
    )

    total_riders = db.session.query(
        func.count(Rider.id)
    ).scalar() or 0

    active_riders = db.session.query(
        func.count(Rider.id)
    ).filter(
        Rider.status == "active"
    ).scalar() or 0

    inactive_riders = db.session.query(
        func.count(Rider.id)
    ).filter(
        Rider.status == "inactive"
    ).scalar() or 0

    available_riders = db.session.query(
        func.count(Rider.id)
    ).filter(
        Rider.availability == "available"
    ).scalar() or 0

    unavailable_riders = db.session.query(
        func.count(Rider.id)
    ).filter(
        Rider.availability != "available"
    ).scalar() or 0

    recent_orders = Order.query.order_by(
        Order.created_at.desc()
    ).limit(5).all()

    recent_riders = Rider.query.order_by(
        func.greatest(
            Rider.created_at,
            Rider.updated_at
        ).desc()
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
            "created_at": order.created_at.isoformat()
        }
        for order in recent_orders
    ]

    recent_riders_data = [
        {
            "id": rider.id,
            "name": rider.name,
            "email": rider.email,
            "mobile": rider.mobile,
            "vehicle_type": rider.vehicle_type,
            "vehicle_number": rider.vehicle_number,
            "profile_image_url": rider.profile_image_url,
            "status": rider.status,
            "availability": rider.availability,
            "created_at": rider.created_at.isoformat(),
            "updated_at": rider.updated_at.isoformat()
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
                "total_order_value": float(total_order_value),
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