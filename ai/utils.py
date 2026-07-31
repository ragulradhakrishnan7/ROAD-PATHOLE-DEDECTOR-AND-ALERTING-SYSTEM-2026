import cv2
import numpy as np
from typing import Tuple, List, Dict, Any

def draw_bounding_boxes(image: np.ndarray, detections: List[Dict[str, Any]]) -> np.ndarray:
    """
    Draws professional bounding boxes and severity badges on OpenCV image.
    """
    annotated = image.copy()
    
    # Severity Color Palette (BGR)
    COLOR_MAP = {
        "Low": (0, 204, 102),       # Emerald Green
        "Medium": (0, 191, 255),    # Deep Sky Blue / Amber
        "High": (0, 102, 255),      # Bright Red-Orange
        "Critical": (50, 0, 230)    # Deep Red/Crimson
    }

    for det in detections:
        x1, y1, x2, y2 = det["x1"], det["y1"], det["x2"], det["y2"]
        confidence = det["confidence"]
        severity = det["severity"]
        color = COLOR_MAP.get(severity, (0, 0, 255))

        # Main bounding box
        cv2.rectangle(annotated, (x1, y1), (x2, y2), color, 3)

        # Draw box corners for sleek modern HUD style
        corner_len = min((x2 - x1), (y2 - y1)) // 4
        cv2.line(annotated, (x1, y1), (x1 + corner_len, y1), color, 5)
        cv2.line(annotated, (x1, y1), (x1, y1 + corner_len), color, 5)
        cv2.line(annotated, (x2, y1), (x2 - corner_len, y1), color, 5)
        cv2.line(annotated, (x2, y1), (x2, y1 + corner_len), color, 5)
        cv2.line(annotated, (x1, y2), (x1 + corner_len, y2), color, 5)
        cv2.line(annotated, (x1, y2), (x1, y2 - corner_len), color, 5)
        cv2.line(annotated, (x2, y2), (x2 - corner_len, y2), color, 5)
        cv2.line(annotated, (x2, y2), (x2, y2 - corner_len), color, 5)

        # Label Banner
        label = f"POTHOLE | {severity.upper()} {int(confidence * 100)}%"
        (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        
        cv2.rectangle(annotated, (x1, max(0, y1 - h - 14)), (x1 + w + 12, max(0, y1)), color, -1)
        cv2.putText(annotated, label, (x1 + 6, max(16, y1 - 8)), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

    return annotated

def calculate_severity(area_pixels: float, img_shape: Tuple[int, int, int]) -> Tuple[str, float]:
    """
    Calculates estimated surface area in sq meters and assigns severity level.
    Assumes standard roadside camera perspective calibration.
    """
    img_area = img_shape[0] * img_shape[1]
    ratio = area_pixels / max(1, img_area)
    
    # Scale factor for area estimation (approx 5.0 m^2 visible road patch)
    estimated_sq_m = round(ratio * 5.0, 2)
    
    if ratio > 0.08 or estimated_sq_m > 1.2:
        return "Critical", max(1.2, estimated_sq_m)
    elif ratio > 0.04 or estimated_sq_m > 0.6:
        return "High", max(0.6, estimated_sq_m)
    elif ratio > 0.015 or estimated_sq_m > 0.3:
        return "Medium", max(0.3, estimated_sq_m)
    else:
        return "Low", max(0.1, estimated_sq_m)
