from datetime import datetime, timezone
import uuid
from config.connectDB import db

class Rider(db.Model):
    __tablename__ = "riders"
    __table_args__ = (
        db.Index("idx_riders_status_availability", "status", "availability"),
    )

    id = db.Column(
        db.String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4())
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    email = db.Column(
        db.String(120),
        nullable=False,
        unique=True
    )

    mobile = db.Column(
        db.String(15),
        nullable=False,
        unique=True
    )

    vehicle_type = db.Column(
        db.String(50),
        nullable=True,
        default=None
    )

    vehicle_number = db.Column(
        db.String(50),
        nullable=True,
        default=None
    )

    profile_image_url = db.Column(
        db.Text,
        nullable=True,
        default=None
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    updated_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc)
    )

    status = db.Column(
        db.String(15),
        nullable=False,
        default="active",
        index=True
    )

    availability = db.Column(
        db.String(15),
        nullable=False,
        default="available"
    )
