from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AlertBase(BaseModel):
    alert_type: str
    message: str

class AlertCreate(AlertBase):
    pothole_id: Optional[str] = None
    user_id: Optional[str] = None

class AlertResponse(AlertBase):
    id: str
    pothole_id: Optional[str] = None
    user_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
