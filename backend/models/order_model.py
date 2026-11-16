from datetime import datetime, timezone
from config.connectDB import db

class Order(db.Model):
    __tablename__ = "orders"
    __table_args__ = (
        db.Index("idx_orders_status_created_at", "status", "created_at"),
    )

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
        default="pending",
        index=True
    )

    rider_id = db.Column(
        db.String(36),
        db.ForeignKey("riders.id"),
        nullable=True,
        index=True
    )

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    rider = db.relationship("Rider", backref=db.backref("orders", lazy="dynamic"), foreign_keys=[rider_id])
    history = db.relationship(
        "OrderStatusHistory",
        backref="order",
        lazy="select",
        cascade="all, delete-orphan",
        order_by="OrderStatusHistory.changed_at.asc()"
    )

class OrderStatusHistory(db.Model):
    __tablename__ = "order_status_history"
    __table_args__ = (
        db.Index("idx_order_history_order_id_changed_at", "order_id", "changed_at"),
    )

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    order_id = db.Column(
        db.String(50),
        db.ForeignKey("orders.order_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    from_status = db.Column(
        db.String(30),
        nullable=True
    )

    to_status = db.Column(
        db.String(30),
        nullable=False
    )

    changed_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        index=True
    )

    changed_by = db.Column(
        db.String(100),
        nullable=True
    )

    def to_dict(self):
        return {
            "id": self.id,
            "order_id": self.order_id,
            "from_status": self.from_status,
            "to_status": self.to_status,
            "changed_at": self.changed_at.isoformat() if self.changed_at else None,
            "changed_by": self.changed_by
        }

