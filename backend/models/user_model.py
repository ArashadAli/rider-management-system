from config.connectDB import db


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    profile_image = db.Column(
        db.Text,
        nullable=True,
        default=None
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

    password = db.Column(
        db.String(255),
        nullable=False
    )