from datetime import datetime, timezone

from config.connectDB import db


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    order_id = db.Column(
        db.String(50),
        nullable=False,
        unique=True
    )

    order_item = db.Column(
        db.String(100),
        nullable=False
    )

    customer_name = db.Column(
        db.String(100),
        nullable=False
    )

    customer_mobile = db.Column(
        db.String(15),
        nullable=False
    )

    pickup_address = db.Column(
        db.Text,
        nullable=False
    )

    delivery_address = db.Column(
        db.Text,
        nullable=False
    )

    amount = db.Column(
        db.Numeric(10, 2),
        nullable=False
    )

    status = db.Column(
        db.String(30),
        nullable=False,
        default="pending"
    )

    rider_id = db.Column(
    db.String(36),
    db.ForeignKey("riders.id"),
    nullable=True

    )

    created_at = db.Column(
    db.DateTime(timezone=True),
    nullable=False,
    default=lambda: datetime.now(timezone.utc)
)