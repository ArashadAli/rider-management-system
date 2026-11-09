from marshmallow import fields, validate
from schemas.base import BaseQuerySchema

class CommonPaginationSchema(BaseQuerySchema):
    page = fields.Integer(load_default=1, validate=validate.Range(min=1, error="Page must be at least 1"))
    limit = fields.Integer(load_default=10, validate=validate.Range(min=1, max=100, error="Limit must be between 1 and 100"))
    search = fields.String(load_default="")
