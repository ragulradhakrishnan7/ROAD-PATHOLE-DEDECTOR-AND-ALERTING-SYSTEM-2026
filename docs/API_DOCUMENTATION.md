# 🔌 REST API Documentation

Base URL: `http://localhost:8000/api/v1`

---

## 1. Authentication Endpoints

### `POST /auth/register`
Register a new user account.
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!"
  }
  ```
- **Response** (201 Created):
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "user": {
      "id": "uuid-v4",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user",
      "created_at": "2026-07-26T18:00:00Z"
    }
  }
  ```

### `POST /auth/login`
Authenticate user credentials and obtain JWT access token.

---

## 2. Detection Endpoints

### `POST /detections/upload-image`
Upload a road image file for YOLOv8 & OpenCV pothole detection.
- **Form Data**:
  - `file`: Image file (multipart/form-data)
  - `latitude`: float (e.g. `37.7749`)
  - `longitude`: float (e.g. `-122.4194`)
  - `location_name`: string (e.g. `"Market St & 5th St"`)

### `POST /detections/live-frame`
Low-latency real-time frame evaluation endpoint for webcam streams.

### `GET /detections/history`
Query detection log history.
- **Query Params**: `severity`, `status`, `limit`

### `GET /detections/map-data`
Returns GeoJSON FeatureCollection of all pothole coordinates for Leaflet / Google Maps rendering.

---

## 3. Admin Endpoints

### `GET /admin/stats`
Returns aggregated analytics metrics:
- Total potholes, repair completion percentage, severity breakdown.
