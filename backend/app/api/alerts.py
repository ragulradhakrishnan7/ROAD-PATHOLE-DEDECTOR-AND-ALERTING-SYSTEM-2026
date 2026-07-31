from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.alert import Alert
from app.schemas.alert import AlertResponse

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/", response_model=List[AlertResponse])
def get_alerts(user_id: Optional[str] = None, unread_only: bool = False, db: Session = Depends(get_db)):
    query = db.query(Alert)
    if user_id:
        query = query.filter((Alert.user_id == user_id) | (Alert.user_id.is_(None)))
    if unread_only:
        query = query.filter(Alert.is_read == False)
    
    alerts = query.order_by(Alert.created_at.desc()).limit(50).all()
    return [AlertResponse.model_validate(a) for a in alerts]

@router.post("/{alert_id}/read", response_model=AlertResponse)
def mark_alert_as_read(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found.")
    alert.is_read = True
    db.commit()
    db.refresh(alert)
    return AlertResponse.model_validate(alert)
