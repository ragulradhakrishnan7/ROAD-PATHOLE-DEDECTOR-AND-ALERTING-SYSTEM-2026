from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class BoundingBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int
    confidence: float
    severity: str

class PotholeBase(BaseModel):
    latitude: float
    longitude: float
    location_name: Optional[str] = "Unknown Road"

class PotholeCreate(PotholeBase):
    image_url: str
    confidence: float
    severity: str
    surface_area_sq_m: Optional[float] = 0.0

class PotholeStatusUpdate(BaseModel):
    status: str # Reported, In Progress, Repaired

class PotholeResponse(PotholeBase):
    id: str
    image_url: str
    confidence: float
    severity: str
    status: str
    surface_area_sq_m: float
    user_id: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

class DetectionAnalysisResult(BaseModel):
    total_detected: int
    max_severity: str
    confidence_avg: float
    annotated_image_url: str
    bounding_boxes: List[BoundingBox]
    potholes: List[PotholeResponse]

class VideoFrameDetection(BaseModel):
    frame_number: int
    timestamp_sec: float
    detection_count: int
    bounding_boxes: List[BoundingBox]
    annotated_frame_url: Optional[str] = None

class VideoDetectionResult(BaseModel):
    total_frames_analyzed: int
    total_potholes_detected: int
    max_severity: str
    confidence_avg: float
    severity_breakdown: dict
    frame_detections: List[VideoFrameDetection]
    potholes: List[PotholeResponse]
