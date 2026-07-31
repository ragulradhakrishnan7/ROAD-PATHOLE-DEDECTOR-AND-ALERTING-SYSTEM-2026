from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any

from app.core.database import get_db
from app.models.user import User
from app.models.pothole import Pothole
from app.models.alert import Alert
from app.schemas.user import UserResponse
from app.schemas.pothole import PotholeResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
def get_admin_dashboard_stats(db: Session = Depends(get_db)):
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_potholes = db.query(func.count(Pothole.id)).scalar() or 0
    total_alerts = db.query(func.count(Alert.id)).scalar() or 0

    repaired_count = db.query(func.count(Pothole.id)).filter(Pothole.status == "Repaired").scalar() or 0
    in_progress_count = db.query(func.count(Pothole.id)).filter(Pothole.status == "In Progress").scalar() or 0
    reported_count = db.query(func.count(Pothole.id)).filter(Pothole.status == "Reported").scalar() or 0

    severity_counts = {
        "Critical": db.query(func.count(Pothole.id)).filter(Pothole.severity == "Critical").scalar() or 0,
        "High": db.query(func.count(Pothole.id)).filter(Pothole.severity == "High").scalar() or 0,
        "Medium": db.query(func.count(Pothole.id)).filter(Pothole.severity == "Medium").scalar() or 0,
        "Low": db.query(func.count(Pothole.id)).filter(Pothole.severity == "Low").scalar() or 0,
    }

    repair_rate = round((repaired_count / max(1, total_potholes)) * 100, 1)

    return {
        "total_users": total_users,
        "total_potholes": total_potholes,
        "total_alerts": total_alerts,
        "repaired_count": repaired_count,
        "in_progress_count": in_progress_count,
        "reported_count": reported_count,
        "repair_rate_percent": repair_rate,
        "severity_breakdown": severity_counts
    }

@router.get("/users", response_model=List[UserResponse])
def get_all_users(db: Session = Depends(get_db)):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [UserResponse.model_validate(u) for u in users]

@router.delete("/potholes/{pothole_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pothole_record(pothole_id: str, db: Session = Depends(get_db)):
    pothole = db.query(Pothole).filter(Pothole.id == pothole_id).first()
    if not pothole:
        raise HTTPException(status_code=404, detail="Pothole record not found.")
    db.delete(pothole)
    db.commit()
    return None
