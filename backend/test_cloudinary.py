import cloudinary
import cloudinary.uploader

from config.cloudinary import cloudinary


result = cloudinary.uploader.upload(
    "test-image.jpg",
    folder="riders"
)

print(result["secure_url"])