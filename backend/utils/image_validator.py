
from PIL import Image, UnidentifiedImageError

MAX_IMAGE_SIZE = 2 * 1024 * 1024  # 2 MB
ALLOWED_EXTENSIONS = {"jpg", "jpeg", "png"}
ALLOWED_FORMATS = {"JPEG", "PNG"}


def validate_profile_image(file):
    if not file or not file.filename:
        return False, "No image file provided"

    extension = file.filename.rsplit(".", 1)[-1].lower()

    if "." not in file.filename or extension not in ALLOWED_EXTENSIONS:
        return False, "Only JPG, JPEG and PNG images are allowed"

    # Check actual uploaded file size
    file.seek(0, 2)
    file_size = file.tell()
    file.seek(0)

    if file_size == 0:
        return False, "Image file cannot be empty"

    if file_size > MAX_IMAGE_SIZE:
        return False, "Image size must not exceed 2 MB"

    try:
        image = Image.open(file)
        image.verify()

        if image.format not in ALLOWED_FORMATS:
            return False, "Invalid image content. Only JPG and PNG are allowed"

    except (UnidentifiedImageError, OSError, ValueError):
        return False, "Uploaded file is not a valid image"

    finally:
        file.seek(0)

    return True, None
