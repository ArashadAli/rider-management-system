from functools import wraps
import inspect
from flask import request, jsonify, g
from marshmallow import Schema, ValidationError, pre_load

def extract_first_error_message(errors):
    if isinstance(errors, list) and errors:
        return extract_first_error_message(errors[0])
    if isinstance(errors, dict) and errors:
        return extract_first_error_message(next(iter(errors.values())))
    return str(errors)

def format_validation_error(err: ValidationError):
    first_message = extract_first_error_message(err.messages)
    return {
        "success": False,
        "message": first_message,
        "errors": err.messages
    }

class BaseBodySchema(Schema):
    """Base schema for request bodies (JSON or FormData) that strips strings."""
    @pre_load
    def strip_strings(self, data, **kwargs):
        if not isinstance(data, dict):
            return data
        cleaned = {}
        for k, v in data.items():
            if isinstance(v, str):
                cleaned[k] = v.strip()
            else:
                cleaned[k] = v
        return cleaned

class BaseQuerySchema(Schema):
    """Base schema for URL query parameters that omits empty strings so defaults apply."""
    @pre_load
    def clean_query_params(self, data, **kwargs):
        if hasattr(data, "to_dict"):
            data = data.to_dict()
        if not isinstance(data, dict):
            return data
        cleaned = {}
        for k, v in data.items():
            if isinstance(v, str):
                v_stripped = v.strip()
                if v_stripped == "":
                    continue  # omit empty query param so field load_default kicks in
                cleaned[k] = v_stripped
            else:
                cleaned[k] = v
        return cleaned

def get_validated_data(default=None):
    return getattr(g, "validated_data", default)

def get_validated_query(default=None):
    return getattr(g, "validated_query", default)

def validate_request(body_schema=None, query_schema=None):
    """
    Decorator to validate request query parameters and/or body.
    Supports JSON, URL parameters, and multipart/form-data.
    Returns HTTP 400 with a consistent error structure matching frontend toast expectations.
    """
    def decorator(f):
        sig = inspect.signature(f)
        accepts_kwargs = any(p.kind == inspect.Parameter.VAR_KEYWORD for p in sig.parameters.values())
        param_names = set(sig.parameters.keys())

        @wraps(f)
        def wrapper(*args, **kwargs):
            # 1. Validate Query Parameters if query_schema is specified
            if query_schema:
                try:
                    loaded_query = query_schema.load(request.args)
                    g.validated_query = loaded_query
                    if "validated_query" in param_names or accepts_kwargs:
                        kwargs["validated_query"] = loaded_query
                except ValidationError as err:
                    return jsonify(format_validation_error(err)), 400

            # 2. Validate Body if body_schema is specified
            if body_schema:
                # Handle FormData vs JSON
                if request.form or request.files:
                    raw_data = request.form.to_dict()
                else:
                    raw_data = request.get_json(silent=True)

                if raw_data is None:
                    # If body was expected but nothing was provided
                    return jsonify({
                        "success": False,
                        "message": "Request body is required"
                    }), 400

                try:
                    loaded_data = body_schema.load(raw_data)
                    g.validated_data = loaded_data
                    if "validated_data" in param_names or accepts_kwargs:
                        kwargs["validated_data"] = loaded_data
                except ValidationError as err:
                    return jsonify(format_validation_error(err)), 400

            return f(*args, **kwargs)
        return wrapper
    return decorator
