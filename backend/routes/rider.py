from flask import Blueprint
from middleware.auth_middleware import token_required
from controllers.rider_controllers import create_Rider, allRiders

rider_bp = Blueprint("api/riders", __name__)

# print("rider route called")

@rider_bp.route("/create", methods=["POST"])
@token_required

def create_rider(user_email):
    return create_Rider(user_email)


@rider_bp.route("/allRiders", methods=["GET"])
@token_required

def get_all_riders(user_email):
    return allRiders(user_email)
