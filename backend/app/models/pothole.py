"""
Pothole Database Model.
Defines the SQLAlchemy ORM mapping for recorded road pothole detections.
"""
import uuid
import datetime
from sqlalchemy import Column, String, Float, ForeignKey, DateTime
from sqlalchemy.orm import relationship

from app.core.database import Base


class Pothole(Base):
    """
    Pothole ORM model representing detected potholes, location data, severity,
    confidence rating, surface area, and relationships to user and alerts.
    """
    # pylint: disable=too-few-public-methods
    __tablename__ = "potholes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    location_name = Column(String(255), nullable=True, default="Unknown Location")
    image_url = Column(String(500), nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(20), nullable=False)
    status = Column(String(20), default="Reported")
    surface_area_sq_m = Column(Float, default=0.0)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="potholes")
    alerts = relationship("Alert", back_populates="pothole", cascade="all, delete-orphan")
