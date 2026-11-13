from marshmallow import fields, validate, validates_schema, ValidationError
from schemas.base import BaseBodySchema

EMAIL_REGEX = r"^[\w.-]+@[\w.-]+\.[a-zA-Z]{2,}$"
MOBILE_REGEX = r"^[6-9]\d{9}$"

class RegisterSchema(BaseBodySchema):
    name = fields.String(
        required=True,
        error_messages={"required": "Name is required"},
        validate=validate.Length(min=1, error="Name is required")
    )
    email = fields.String(
        required=True,
        error_messages={"required": "Email is required"},
        validate=validate.Regexp(EMAIL_REGEX, error="Invalid email format")
    )
    mobile = fields.String(
        required=True,
        error_messages={"required": "Mobile number is required"},
        validate=validate.Regexp(MOBILE_REGEX, error="Invalid mobile number format")
    )
    password = fields.String(
        required=True,
        error_messages={"required": "Password is required"},
        validate=validate.Length(min=8, error="Password must be at least 8 characters")
    )
    confirm_password = fields.String(
        required=True,
        error_messages={"required": "Confirm password is required"}
    )

    @validates_schema
    def validate_password_match(self, data, **kwargs):
        if data.get("password") != data.get("confirm_password"):
            raise ValidationError("Password and confirm password do not match", "confirm_password")


class LoginSchema(BaseBodySchema):
    email = fields.String(
        required=True,
        error_messages={"required": "Email is required"}
    )
    password = fields.String(
        required=True,
        error_messages={"required": "Password is required"}
    )