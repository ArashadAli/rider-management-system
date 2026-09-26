import re


# print("Email and Mobile Validation Module Loaded")

def validate_email(email):
    email_pattern = r"^[\w.-]+@gmail\.com$"
    return re.fullmatch(email_pattern, email) is not None


def validate_mobile(mobile):
    mobile_pattern = r"^[6-9]\d{9}$"
    return re.fullmatch(mobile_pattern, mobile) is not None