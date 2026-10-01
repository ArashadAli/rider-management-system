import uuid

from config.connectDB import db


class Rider(db.Model):
    __tablename__ = "riders"

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

    status = db.Column(
        db.String(15),
        nullable= False,
        default="active"
    )

    availability = db.Column(
        db.String(15),
        nullable= False,
        default= "available"
    )