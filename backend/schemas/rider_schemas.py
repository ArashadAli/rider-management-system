from marshmallow import fields, validate, Schema, validates_schema, ValidationError
from schemas.base import BaseBodySchema, BaseQuerySchema
from schemas.auth_schemas import EMAIL_REGEX, MOBILE_REGEX

ALLOWED_RIDER_STATUSES = ["active", "inactive"]
ALLOWED_RIDER_AVAILABILITY = ["available", "unavailable", "busy"]

class RiderCreateSchema(BaseBodySchema):
    name = fields.String(
        required=True,
        error_messages={"required": "Name, email and mobile are required"},
        validate=validate.Length(min=1, error="Name cannot be empty")
    )
    email = fields.String(
        required=True,
        error_messages={"required": "Name, email and mobile are required"},
        validate=validate.Regexp(EMAIL_REGEX, error="Invalid email format")
    )
    mobile = fields.String(
        required=True,
        error_messages={"required": "Name, email and mobile are required"},
        validate=validate.Regexp(MOBILE_REGEX, error="Invalid mobile format")
    )
    vehicle_type = fields.String(
        required=True,
        error_messages={"required": "Vehicle type is required"},
        validate=validate.Length(min=1, error="Vehicle type is required")
    )
    vehicle_number = fields.String(
        required=True,
        error_messages={"required": "Vehicle number is required"},
        validate=validate.Length(min=1, error="Vehicle number is required")
    )
    status = fields.String(
        load_default="active",
        validate=validate.OneOf(ALLOWED_RIDER_STATUSES, error="Invalid status")
    )
    availability = fields.String(
        load_default="available",
        validate=validate.OneOf(["available", "unavailable"], error="Invalid availability")
    )


class RiderUpdateSchema(BaseBodySchema):
    name = fields.String(allow_none=True)
    email = fields.String(
        allow_none=True,
        validate=validate.Regexp(EMAIL_REGEX, error="Invalid email format")
    )
    mobile = fields.String(
        allow_none=True,
        validate=validate.Regexp(MOBILE_REGEX, error="Invalid mobile format")
    )
    vehicle_type = fields.String(allow_none=True)
    vehicle_number = fields.String(allow_none=True)
    status = fields.String(
        allow_none=True,
        validate=validate.OneOf(ALLOWED_RIDER_STATUSES, error="Invalid status")
    )
    availability = fields.String(
        allow_none=True,
        validate=validate.OneOf(ALLOWED_RIDER_AVAILABILITY, error="Invalid availability")
    )


class RiderPaginationQuerySchema(BaseQuerySchema):
    page = fields.Integer(load_default=1, validate=validate.Range(min=1, error="Page must be at least 1"))
    limit = fields.Integer(load_default=5, validate=validate.Range(min=1, max=100, error="Limit must be between 1 and 100"))
    search = fields.String(load_default="")
    status = fields.String(load_default="")
    availability = fields.String(load_default="")
    sort_by = fields.String(
        load_default="created_at",
        validate=validate.OneOf(
            ["name", "email", "mobile", "status", "availability", "created_at"],
            error="Invalid sort_by"
        )
    )
    sort_order = fields.String(
        load_default="desc",
        validate=validate.OneOf(["asc", "desc"], error="Invalid sort_order")
    )


class ActiveRidersQuerySchema(BaseBodySchema):
    status = fields.String(
        required=True,
        error_messages={"required": "Status is required"},
        validate=validate.OneOf(ALLOWED_RIDER_STATUSES, error="Invalid status")
    )


class RiderResponseSchema(Schema):
    id = fields.String()
    name = fields.String()
    email = fields.String()
    mobile = fields.String()
    vehicle_type = fields.String(allow_none=True)
    vehicle_number = fields.String(allow_none=True)
    profile_image_url = fields.String(allow_none=True)
    status = fields.String()
    availability = fields.String()
    created_at = fields.Method("format_created_at")
    updated_at = fields.Method("format_updated_at")

    def format_created_at(self, obj):
        created_at = getattr(obj, "created_at", None)
        if isinstance(created_at, dict):
            created_at = obj.get("created_at")
        if created_at and hasattr(created_at, "isoformat"):
            return created_at.isoformat()
        return created_at

    def format_updated_at(self, obj):
        updated_at = getattr(obj, "updated_at", None)
        if isinstance(updated_at, dict):
            updated_at = obj.get("updated_at")
        if updated_at and hasattr(updated_at, "isoformat"):
            return updated_at.isoformat()
        return updated_at
