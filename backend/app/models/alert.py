"""
Alert Database Model.
Defines the SQLAlchemy ORM mapping for notifications and alerts.
"""
import uuid
import datetime
from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship

from app.core.database import Base


class Alert(Base):
    """
    Alert ORM model representing hazard warnings, proximity alerts,
    read status, and relationships to potholes and users.
    """
    # pylint: disable=too-few-public-methods
    __tablename__ = "alerts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    pothole_id = Column(String(36), ForeignKey("potholes.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    alert_type = Column(String(30), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    pothole = relationship("Pothole", back_populates="alerts")
    user = relationship("User", back_populates="alerts")
