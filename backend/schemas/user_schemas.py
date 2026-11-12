from marshmallow import fields, validate, validates_schema, ValidationError, Schema
from schemas.base import BaseBodySchema
from schemas.auth_schemas import MOBILE_REGEX

class UserProfileUpdateSchema(BaseBodySchema):
    name = fields.String(allow_none=True)
    mobile = fields.String(
        allow_none=True,
        validate=validate.Regexp(MOBILE_REGEX, error="Invalid mobile number format")
    )


class ChangePasswordSchema(BaseBodySchema):
    currentPassword = fields.String(
        required=True,
        error_messages={"required": "current password and new password both fields are required"},
        validate=validate.Length(min=1, error="current password and new password both fields are required")
    )
    newPassword = fields.String(
        required=True,
        error_messages={"required": "current password and new password both fields are required"},
        validate=validate.Length(min=8, error="Length should be min of 8 characters")
    )


class UserResponseSchema(Schema):
    id = fields.Integer()
    name = fields.String()
    mobile = fields.String()
    profile_image = fields.String(allow_none=True)
