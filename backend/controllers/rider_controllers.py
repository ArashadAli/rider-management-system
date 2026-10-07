from flask import request, jsonify
from models.rider_model import Rider
from config.connectDB import db
# from sqlalchemy import or_

from utils.email_mobile_validate import validate_email, validate_mobile


def create_Rider(user_email):

    try:

        data = request.get_json()

        if not data:
            return jsonify({
                "success": False,
                "message": "Request body is required"
            }), 400

        name = data.get("name")
        email = data.get("email")
        mobile = data.get("mobile")
        vehicle_type = data.get("vehicle_type")
        vehicle_number = data.get("vehicle_number")
        profile_image_url = data.get("profile_image_url")

        if not name or not email or not mobile:

            return jsonify({
                "success": False,
                "message": "Name, email and mobile are required"
            }), 400

        if not validate_email(email):

            return jsonify({
                "success": False,
                "message": "Invalid email format"
            }), 400

        if not validate_mobile(mobile):

            return jsonify({
                "success": False,
                "message": "Invalid mobile format"
            }), 400

        existing_email = Rider.query.filter_by(
            email=email
        ).first()

        if existing_email:

            return jsonify({
                "success": False,
                "message": "Rider with this email already exists"
            }), 409

        existing_mobile = Rider.query.filter_by(
            mobile=mobile
        ).first()

        if existing_mobile:

            return jsonify({
                "success": False,
                "message": "Rider with this mobile number already exists"
            }), 409

        rider = Rider(

            name=name,
            email=email,
            mobile=mobile,
            vehicle_type=vehicle_type,
            vehicle_number=vehicle_number,
            profile_image_url=profile_image_url
        )

        db.session.add(rider)

        db.session.commit()

        return jsonify({

            "success": True,
            "message": "Rider created successfully",
            "data": {

                "rider": {
                    "id": str(rider.id),
                    "name": rider.name,
                    "email": rider.email,
                    "mobile": rider.mobile,
                    "vehicle_type": rider.vehicle_type,
                    "vehicle_number": rider.vehicle_number,
                    "status": rider.status,
                    "availability": rider.availability,
                    "profile_image_url": rider.profile_image_url,
                    "created_at": rider.created_at.isoformat(),
                    "updated_at": rider.updated_at.isoformat()
                }

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
        return jsonify({
            "success": False,
            "message": "Failed to retrieve riders"
        }), 500


def paginate_Riders(user_email):
    try:

        page = request.args.get("page", 1, type=int)
        limit = request.args.get("limit", 5, type=int)

        if page < 1:
            page = 1

        if limit < 1:
            limit = 5

        if limit > 100:
            limit = 100

        search = request.args.get(
            "search",
            "",
            type=str
        ).strip()

        status = request.args.get(
            "status",
            "",
            type=str
        ).strip()

        availability = request.args.get(
            "availability",
            "",
            type=str
        ).strip()

        sort_by = request.args.get(
            "sort_by",
            "created_at",
            type=str
        ).strip()

        sort_order = request.args.get(
            "sort_order",
            "desc",
            type=str
        ).strip().lower()

        query = Rider.query

        if search:
            search_value = f"%{search}%"
            query = query.filter(
                db.or_(
                    Rider.name.ilike(search_value),
                    Rider.email.ilike(search_value),
                    Rider.mobile.ilike(search_value)
                )
            )

        if status:
            query = query.filter(
                Rider.status == status
            )

        if availability:
            query = query.filter(
                Rider.availability == availability
            )

        sort_columns = {
            "name": Rider.name,
            "email": Rider.email,
            "mobile": Rider.mobile,
            "status": Rider.status,
            "availability": Rider.availability,
            "created_at": Rider.created_at
        }

        sort_column = sort_columns.get(
            sort_by,
            Rider.created_at
        )

        if sort_order == "asc":
            query = query.order_by(sort_column.asc())
        else:
            query = query.order_by(sort_column.desc())

        pagination = query.paginate(
            page=page,
            per_page=limit,
            error_out=False
        )

        rider_list = []

        for rider in pagination.items:
            rider_list.append({
                "id": str(rider.id),
                "name": rider.name,
                "email": rider.email,
                "mobile": rider.mobile,
                "status": rider.status,
                "availability": rider.availability
            })

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


def update_Rider_Status(user_email, rider_id):
    try:
        rider = Rider.query.get(rider_id)

        if not rider:
            return jsonify({
                "success": False,
                "message": "Rider not found"
            }), 404

        # print("current_rider", rider)

        # Toggle status
        if rider.status == "active":
             rider.status = "inactive"
             rider.availability = "unavailable"

        else:
             rider.status ="active"
             rider.availability = "available"
             

        db.session.commit()

        # print("updated_rider", rider)

        return jsonify({
            "success": True,
            "message": "Rider status updated",
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({
            "success": False,
            "message": "Failed to update rider status",
            "error": str(e)
        }), 500


# get Active riders based on status 

def get_Active_Riders(user_email):
    try:

        data = request.get_json()
        status = data.get("status")
        active_riders = Rider.query.filter_by(status=status).all()

        rider_list = []

        for rider in active_riders:
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
            "message": "Active riders retrieved successfully",
            "data": {
                "riders": rider_list
            }
        }), 200

    except Exception as e:
        return jsonify({
            "success": False,
            "message": "Failed to retrieve active riders",
            "error": str(e)
        }), 500