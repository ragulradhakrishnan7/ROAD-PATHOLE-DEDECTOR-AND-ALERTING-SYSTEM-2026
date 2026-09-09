import uuid
import os
import tempfile
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime

from app.core.database import get_db
from app.models.pothole import Pothole
from app.schemas.pothole import (
    PotholeResponse, DetectionAnalysisResult, BoundingBox, PotholeStatusUpdate,
    VideoFrameDetection, VideoDetectionResult
)
from app.services.storage import StorageService
from app.services.notification import NotificationService
from ai.detector import global_detector
import cv2
import numpy as np

router = APIRouter(prefix="/detections", tags=["Detections"])

@router.post("/upload-image", response_model=DetectionAnalysisResult)
async def analyze_image(
    file: UploadFile = File(...),
    latitude: float = Form(0.0),
    longitude: float = Form(0.0),
    location_name: Optional[str] = Form("Unknown Location"),
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

ALLOWED_VIDEO_EXTENSIONS = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
MAX_VIDEO_SIZE_MB = 500

@router.post("/upload-video", response_model=VideoDetectionResult)
async def analyze_video(
    file: UploadFile = File(...),
    latitude: float = Form(0.0),
    longitude: float = Form(0.0),
    location_name: Optional[str] = Form("Unknown Location"),
    user_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    """
    Accepts a video file, extracts frames at ~1 FPS, runs pothole detection
    on each frame, and returns aggregated results with annotated keyframes.
    """
    # Validate file extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_VIDEO_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported video format '{ext}'. Allowed: {', '.join(ALLOWED_VIDEO_EXTENSIONS)}"
        )

    # Read file contents
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # Check file size
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_VIDEO_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Video file too large ({size_mb:.1f} MB). Maximum allowed is {MAX_VIDEO_SIZE_MB} MB."
        )

    # Write to temp file for OpenCV VideoCapture (needs file path)
    tmp_fd, tmp_path = tempfile.mkstemp(suffix=ext)
    try:
        with os.fdopen(tmp_fd, "wb") as tmp_file:
            tmp_file.write(contents)

        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not open video file. It may be corrupted.")

        fps = cap.get(cv2.CAP_PROP_FPS) or 30.0
        total_video_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        # Sample at ~1 frame per second
        sample_interval = max(1, int(fps))

        frame_detections: List[VideoFrameDetection] = []
        saved_potholes = []
        all_confidences = []
        severity_counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        max_severity = "Low"
        SEVERITY_WEIGHTS = {"Low": 1, "Medium": 2, "High": 3, "Critical": 4}

        frame_idx = 0
        analyzed_count = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            # Only process frames at the sample interval
            if frame_idx % sample_interval == 0:
                analyzed_count += 1
                timestamp_sec = round(frame_idx / fps, 2)

                detections, annotated_frame = global_detector.detect_in_frame(frame)

                frame_bboxes = []
                annotated_frame_url = None

                if detections:
                    # Save annotated keyframe
                    keyframe_filename = f"video_frame_{uuid.uuid4().hex[:8]}_{frame_idx}.jpg"
                    _, encoded = cv2.imencode(".jpg", annotated_frame)
                    annotated_frame_url = StorageService.save_bytes(
                        encoded.tobytes(), keyframe_filename, "video_frames"
                    )

                    for det in detections:
                        conf = det["confidence"]
                        sev = det["severity"]
                        all_confidences.append(conf)
                        severity_counts[sev] = severity_counts.get(sev, 0) + 1

                        if SEVERITY_WEIGHTS.get(sev, 1) > SEVERITY_WEIGHTS.get(max_severity, 1):
                            max_severity = sev

                        frame_bboxes.append(BoundingBox(
                            x1=det["x1"], y1=det["y1"],
                            x2=det["x2"], y2=det["y2"],
                            confidence=conf, severity=sev
                        ))

                        # Create a Pothole DB record for each unique detection
                        pothole = Pothole(
                            id=str(uuid.uuid4()),
                            latitude=latitude,
                            longitude=longitude,
                            location_name=location_name,
                            image_url=annotated_frame_url,
                            confidence=conf,
                            severity=sev,
                            status="Reported",
                            surface_area_sq_m=det.get("area_sq_m", 0.5),
                            user_id=user_id,
                            timestamp=datetime.datetime.utcnow()
                        )
                        db.add(pothole)
                        saved_potholes.append(pothole)

                        NotificationService.send_pothole_hazard_alert(
                            db=db,
                            pothole_id=pothole.id,
                            severity=sev,
                            location_name=location_name,
                            user_id=user_id
                        )

                frame_detections.append(VideoFrameDetection(
                    frame_number=frame_idx,
                    timestamp_sec=timestamp_sec,
                    detection_count=len(detections),
                    bounding_boxes=frame_bboxes,
                    annotated_frame_url=annotated_frame_url
                ))

            frame_idx += 1

        cap.release()
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.unlink(tmp_path)

    db.commit()
    for p in saved_potholes:
        db.refresh(p)

    total_potholes = sum(severity_counts.values())
    avg_conf = round(sum(all_confidences) / len(all_confidences), 2) if all_confidences else 0.0

    return VideoDetectionResult(
        total_frames_analyzed=analyzed_count,
        total_potholes_detected=total_potholes,
        max_severity=max_severity if total_potholes > 0 else "None",
        confidence_avg=avg_conf,
        severity_breakdown=severity_counts,
        frame_detections=frame_detections,
        potholes=[PotholeResponse.model_validate(p) for p in saved_potholes]
    )

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
