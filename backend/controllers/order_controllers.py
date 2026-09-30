from flask import request, jsonify
from config.connectDB import db
# from models.order_model import Order

def create_Order(user_email):
    data = request.get_data()

    print("order creation data :" , data)

    return jsonify({
        "order create":"successfully",
        "order_id":"101",
        "email": user_email
    }), 200