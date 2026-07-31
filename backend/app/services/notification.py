import logging
from typing import Optional
from sqlalchemy.orm import Session
from app.models.alert import Alert

logger = logging.getLogger("notification_service")

class NotificationService:
    @staticmethod
    def send_pothole_hazard_alert(db: Session, pothole_id: str, severity: str, location_name: str, user_id: Optional[str] = None):
        """
        Creates a system alert in database.
        NOTE: Does NOT commit — the caller is responsible for committing the
        transaction so that the alert and its parent pothole are saved atomically.
        """
        message = f"🚨 ALERT: {severity} Pothole detected at {location_name or 'unnamed road'}! Proceed with caution."
        
        alert = Alert(
            pothole_id=pothole_id,
            user_id=user_id,
            alert_type="Hazard Warning" if severity in ["High", "Critical"] else "Proximity",
            message=message,
            is_read=False
        )
        db.add(alert)
        
        logger.info(f"Notification queued for pothole {pothole_id}: {message}")
        
        # Placeholder for Firebase Cloud Messaging (FCM) Integration
        # If firebase credentials exist in environment, trigger FCM push:
        # messaging.send(messaging.Message(...))
        return alert
