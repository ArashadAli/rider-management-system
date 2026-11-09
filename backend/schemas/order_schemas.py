from marshmallow import fields, validate, Schema
from schemas.base import BaseBodySchema, BaseQuerySchema

ALLOWED_ORDER_STATUSES = [
    "pending",
    "assigned",
    "picked_up",
    "on_the_way",
    "delivered",
    "cancelled"
]

class OrderCreateSchema(BaseBodySchema):
    order_item = fields.String(
        required=True,
        error_messages={"required": "order_item is required"},
        validate=validate.Length(min=1, error="order_item cannot be empty")
    )
    customer_name = fields.String(
        required=True,
        error_messages={"required": "customer_name is required"},
        validate=validate.Length(min=1, error="customer_name cannot be empty")
    )
    customer_mobile = fields.String(
        required=True,
        error_messages={"required": "customer_mobile is required"},
        validate=validate.Regexp(r"^\d{10}$", error="Customer mobile must contain exactly 10 digits")
    )
    pickup_address = fields.String(
        required=True,
        error_messages={"required": "pickup_address is required"},
        validate=validate.Length(min=1, error="pickup_address cannot be empty")
    )
    delivery_address = fields.String(
        required=True,
        error_messages={"required": "delivery_address is required"},
        validate=validate.Length(min=1, error="delivery_address cannot be empty")
    )
    amount = fields.Float(
        required=True,
        error_messages={
            "required": "amount is required",
            "invalid": "Amount must be a valid number"
        },
        validate=validate.Range(min=0.01, min_inclusive=True, error="Amount must be greater than 0")
    )


class OrderStatusUpdateSchema(BaseBodySchema):
    status = fields.String(
        required=True,
        error_messages={"required": "Status is required"},
        validate=validate.OneOf(ALLOWED_ORDER_STATUSES, error="Invalid status")
    )


class OrderAssignRiderSchema(BaseBodySchema):
    rider_id = fields.String(
        required=True,
        error_messages={"required": "Rider ID is required"},
        validate=validate.Length(min=1, error="Rider ID is required")
    )


class OrderPaginationQuerySchema(BaseQuerySchema):
    page = fields.Integer(load_default=1, validate=validate.Range(min=1, error="Page must be at least 1"))
    limit = fields.Integer(load_default=10)
    search = fields.String(load_default="")
    status = fields.String(load_default="")
    rider = fields.String(load_default="")
    date = fields.Date(
        load_default=None,
        error_messages={"invalid": "Invalid date format. Use YYYY-MM-DD."}
    )
    sort = fields.String(
        load_default="newest",
        validate=validate.OneOf(
            ["newest", "oldest", "amount_low", "amount_high"],
            error="Invalid sort option"
        )
    )


class OrderResponseSchema(Schema):
    order_id = fields.String()
    order_item = fields.String()
    customer_name = fields.String()
    customer_mobile = fields.String()
    pickup_address = fields.String()
    delivery_address = fields.String()
    amount = fields.Float()
    status = fields.String()
    rider_id = fields.String(allow_none=True)
    rider_name = fields.String(allow_none=True)
    created_at = fields.Method("format_created_at")

    def format_created_at(self, obj):
        created_at = getattr(obj, "created_at", None)
        if isinstance(created_at, dict):
            created_at = obj.get("created_at")
        if created_at and hasattr(created_at, "isoformat"):
            return created_at.isoformat()
        return created_at
