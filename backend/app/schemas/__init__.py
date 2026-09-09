from app.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate, Token
from app.schemas.pothole import PotholeCreate, PotholeResponse, PotholeStatusUpdate, DetectionAnalysisResult, BoundingBox, VideoFrameDetection, VideoDetectionResult
from app.schemas.alert import AlertCreate, AlertResponse

__all__ = [
    "UserCreate", "UserLogin", "UserResponse", "UserUpdate", "Token",
    "PotholeCreate", "PotholeResponse", "PotholeStatusUpdate", "DetectionAnalysisResult", "BoundingBox",
    "VideoFrameDetection", "VideoDetectionResult",
    "AlertCreate", "AlertResponse"
]

