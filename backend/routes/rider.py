from flask import Blueprint
from middleware.auth_middleware import token_required
from controllers.rider_controllers import create_Rider, allRiders, paginate_Riders, update_Rider_Status, get_Active_Riders, get_Rider, update_Rider

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


@rider_bp.route("/paginate", methods=["GET"])
@token_required

def paginate_riders(user_email):
    return paginate_Riders(user_email)


@rider_bp.route("/rider-action/<rider_id>", methods=["PATCH"])
@token_required
def update_rider_status(user_email, rider_id):
    return update_Rider_Status(user_email, rider_id)

@rider_bp.route("/active-riders", methods=["POST"])
@token_required
def get_active_riders(user_email):
    return get_Active_Riders(user_email)


@rider_bp.route("/rider/<rider_id>", methods=["GET"])
@token_required
def get_rider(user_email, rider_id):
    return get_Rider(user_email, rider_id)

@rider_bp.route("/rider-update/<rider_id>", methods=["PUT"])
@token_required
def update_rider(user_email, rider_id):
    return update_Rider(user_email, rider_id)