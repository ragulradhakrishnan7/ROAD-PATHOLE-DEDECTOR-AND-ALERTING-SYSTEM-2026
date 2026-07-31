import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Pothole(Base):
    __tablename__ = "potholes"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    location_name = Column(String(255), nullable=True)
    image_url = Column(String(500), nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(20), nullable=False, index=True) # Low, Medium, High, Critical
    status = Column(String(20), default="Reported", index=True) # Reported, In Progress, Repaired
    surface_area_sq_m = Column(Float, default=0.0)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    reporter = relationship("User", back_populates="potholes")
    alerts = relationship("Alert", back_populates="pothole", cascade="all, delete-orphan")
