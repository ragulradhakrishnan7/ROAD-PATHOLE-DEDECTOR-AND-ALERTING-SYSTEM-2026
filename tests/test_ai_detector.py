import pytest
import numpy as np
import cv2
import sys, os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ai.detector import PotholeDetector
from ai.utils import calculate_severity, draw_bounding_boxes

def test_severity_calculation():
    # Test low vs critical severity
    severity, sq_m = calculate_severity(1000, (640, 480, 3))
    assert severity in ["Low", "Medium"]

    severity_crit, sq_m_crit = calculate_severity(40000, (640, 480, 3))
    assert severity_crit in ["High", "Critical"]

def test_detector_opencv_fallback():
    detector = PotholeDetector()
    dummy_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    # Draw artificial dark spot simulating pothole
    cv2.circle(dummy_frame, (320, 240), 50, (30, 30, 30), -1)

    detections, annotated = detector.detect_in_frame(dummy_frame)
    assert isinstance(detections, list)
    assert len(detections) >= 1
    assert annotated.shape == dummy_frame.shape
