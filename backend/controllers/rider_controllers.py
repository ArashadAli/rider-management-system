from flask import request, jsonify
from models.rider_model import Rider
from config.connectDB import db

from utils.email_mobile_validate import validate_email, validate_mobile


def create_Rider(user_email):

    try:
        data = request.get_json()

        name = data.get("name")
        email = data.get("email")
        mobile = data.get("mobile")

        # Validation
        if not name or not email or not mobile:
            return jsonify({
                "success": False,
                "message": "Name, email and mobile are required"
            }), 400

        # Validate email format
        if not validate_email(email):
            return jsonify({
                "success": False,
                "message": "Invalid email format"
            }), 400

        # Validate mobile format
        if not validate_mobile(mobile):
            return jsonify({
                "success": False,
                "message": "Invalid mobile format"
            }), 400

        # Check duplicate email
        existing_email = Rider.query.filter_by(email=email).first()

        if existing_email:
            return jsonify({
                "success": False,
                "message": "Rider with this email already exists"
            }), 409

        # Check duplicate mobile
        existing_mobile = Rider.query.filter_by(mobile=mobile).first()

        if existing_mobile:
            return jsonify({
                "success": False,
                "message": "Rider with this mobile number already exists"
            }), 409

        # Create rider
        rider = Rider(
            name=name,
            email=email,
            mobile=mobile
        )

        db.session.add(rider)
        db.session.commit()

        return jsonify({
            "success": True,
            "message": "Rider created successfully",
            "data": {
                "id": rider.id,
                "name": rider.name,
                "email": rider.email,
                "mobile": rider.mobile,
                "status": rider.status,
                "availability": rider.availability
            }
        }), 201

    except Exception as e:

        db.session.rollback()

        return jsonify({
            "success": False,
            "message": "Failed to create rider",
            "error": str(e)
        }), 500


def allRiders(user_email):
    try:
        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 10, type=int)

        if page < 1:
            page = 1

        if limit < 1:
            limit = 10

        pagination = Rider.query.paginate(
            page=page,
            per_page=limit,
            error_out=False
        )

        rider_list = []

        for rider in pagination.items:
            rider_data = {
                "id": str(rider.id),
                "name": rider.name,
                "email": rider.email,
                "mobile": rider.mobile,
                "status": rider.status,
                "availability": rider.availability
            }

            rider_list.append(rider_data)

        return jsonify({
            "success": True,
            "message": "Riders retrieved successfully",
            "data": {
                "riders": rider_list
            },
            "pagination": {
                "page": pagination.page,
                "limit": pagination.per_page,
                "total": pagination.total,
                "pages": pagination.pages
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to retrieve riders",
            "error": str(e)
        }), 500
    try:
        riders = Rider.query.all()

        rider_list = []
        for rider in riders:
            rider_data = {
                "id": rider.id,
                "name": rider.name,
                "email": rider.email,
                "mobile": rider.mobile,
                "status": rider.status,
                "availability": rider.availability
            }
            rider_list.append(rider_data)

        return jsonify({
            "success": True,
            "message": "Riders retrieved successfully",
            "data": rider_list
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to retrieve riders",
            "error": str(e)
        }), 500