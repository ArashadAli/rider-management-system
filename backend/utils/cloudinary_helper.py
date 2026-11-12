import re
import cloudinary.uploader

# Matches ".../upload/[transformations/][v123/]<public_id>.<ext>"
_CLOUDINARY_URL_PATTERN = re.compile(r"/upload/(?:[^/]+/)*?(?:v\d+/)?(?P<public_id>.+)\.[A-Za-z0-9]+$")


def extract_public_id(image_url):
    """Derive the Cloudinary public_id from a stored secure_url."""
    if not image_url or "res.cloudinary.com" not in image_url:
        return None
    match = _CLOUDINARY_URL_PATTERN.search(image_url.split("?")[0])
    return match.group("public_id") if match else None


def delete_cloudinary_image(image_url):
    """Best-effort deletion of an image by URL. Never raises."""
    public_id = extract_public_id(image_url)
    if not public_id:
        return False
    try:
        result = cloudinary.uploader.destroy(public_id, resource_type="image", invalidate=True)
        return result.get("result") == "ok"
    except Exception as e:
        print("Cloudinary delete failed:", e)
        return False
