import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from app.core.database import get_db
from app.models.pothole import Pothole
from app.schemas.pothole import PotholeResponse, DetectionAnalysisResult, BoundingBox, PotholeStatusUpdate
from app.services.storage import StorageService
from app.services.notification import NotificationService
from ai.detector import global_detector

router = APIRouter(prefix="/detections", tags=["Detections"])

@router.post("/upload-image", response_model=DetectionAnalysisResult)
async def analyze_image(
    file: UploadFile = File(...),
    latitude: float = Form(37.7749),
    longitude: float = Form(-122.4194),
    location_name: Optional[str] = Form("Road Segment #402"),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Execute AI detection
    detections, annotated_bytes = global_detector.detect_in_image_bytes(contents)

    # Save original and annotated files
    filename_stem = str(uuid.uuid4())
    annotated_filename = f"annotated_{filename_stem}.jpg"
    annotated_url = StorageService.save_bytes(annotated_bytes, annotated_filename, "annotated")

    saved_potholes = []
    max_severity = "Low"
    conf_sum = 0.0

    SEVERITY_WEIGHTS = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}

    for det in detections:
        conf_sum += det["confidence"]
        if SEVERITY_WEIGHTS.get(det["severity"], 1) > SEVERITY_WEIGHTS.get(max_severity, 1):
            max_severity = det["severity"]

        pothole = Pothole(
            id=str(uuid.uuid4()),
            latitude=latitude,
            longitude=longitude,
            location_name=location_name,
            image_url=annotated_url,
            confidence=det["confidence"],
            severity=det["severity"],
            status="Reported",
            surface_area_sq_m=det.get("area_sq_m", 0.5),
            user_id=user_id,
            timestamp=datetime.datetime.utcnow()
        )
        db.add(pothole)
        saved_potholes.append(pothole)

        # Trigger notification alert if severe
        NotificationService.send_pothole_hazard_alert(
            db=db,
            pothole_id=pothole.id,
            severity=pothole.severity,
            location_name=location_name,
            user_id=user_id
        )

    db.commit()
    for p in saved_potholes:
        db.refresh(p)

    bounding_boxes = [
        BoundingBox(
            x1=d["x1"], y1=d["y1"], x2=d["x2"], y2=d["y2"],
            confidence=d["confidence"], severity=d["severity"]
        ) for d in detections
    ]

    return DetectionAnalysisResult(
        total_detected=len(detections),
        max_severity=max_severity if detections else "None",
        confidence_avg=round(conf_sum / len(detections), 2) if detections else 0.0,
        annotated_image_url=annotated_url,
        bounding_boxes=bounding_boxes,
        potholes=[PotholeResponse.model_validate(p) for p in saved_potholes]
    )

@router.post("/live-frame")
async def analyze_live_frame(
    file: UploadFile = File(...)
):
    """
    Fast low-latency endpoint for live webcam stream frames.
    """
    contents = await file.read()
    detections, _ = global_detector.detect_in_image_bytes(contents)
    return {
        "count": len(detections),
        "detections": detections
    }

@router.get("/history", response_model=List[PotholeResponse])
def get_detection_history(
    severity: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(Pothole)
    if severity and severity != "All":
        query = query.filter(Pothole.severity == severity)
    if status and status != "All":
        query = query.filter(Pothole.status == status)
    
    potholes = query.order_by(Pothole.timestamp.desc()).limit(limit).all()
    return [PotholeResponse.model_validate(p) for p in potholes]

@router.get("/map-data")
def get_map_data(db: Session = Depends(get_db)):
    potholes = db.query(Pothole).all()
    features = []
    for p in potholes:
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Point",
                "coordinates": [p.longitude, p.latitude]
            },
            "properties": {
                "id": p.id,
                "location_name": p.location_name,
                "severity": p.severity,
                "confidence": p.confidence,
                "status": p.status,
                "image_url": p.image_url,
                "surface_area_sq_m": p.surface_area_sq_m,
                "timestamp": p.timestamp.isoformat()
            }
        })
    return {
        "type": "FeatureCollection",
        "features": features
    }

@router.patch("/{pothole_id}/status", response_model=PotholeResponse)
def update_pothole_status(
    pothole_id: str,
    status_update: PotholeStatusUpdate,
    db: Session = Depends(get_db)
):
    pothole = db.query(Pothole).filter(Pothole.id == pothole_id).first()
    if not pothole:
        raise HTTPException(status_code=404, detail="Pothole record not found.")
    
    pothole.status = status_update.status
    db.commit()
    db.refresh(pothole)
    return PotholeResponse.model_validate(pothole)
