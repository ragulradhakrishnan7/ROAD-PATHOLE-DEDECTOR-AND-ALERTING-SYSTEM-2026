import pytest
from fastapi.testclient import TestClient
import io, sys, os
from PIL import Image

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from main import app  # type: ignore[import-not-found]

client = TestClient(app)

def test_get_detection_history():
    response = client.get("/api/v1/detections/history")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_get_map_data():
    response = client.get("/api/v1/detections/map-data")
    assert response.status_code == 200
    data = response.json()
    assert data["type"] == "FeatureCollection"
    assert "features" in data

def test_upload_image_detection():
    # Generate dummy image byte stream
    img = Image.new("RGB", (640, 480), color="gray")
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format="JPEG")
    img_bytes = img_byte_arr.getvalue()

    files = {"file": ("test_road.jpg", img_bytes, "image/jpeg")}
    data = {"latitude": "37.7749", "longitude": "-122.4194", "location_name": "Test Road"}

    response = client.post("/api/v1/detections/upload-image", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert "annotated_image_url" in res_data
    assert "total_detected" in res_data
