# 🚧 Road Pothole Detector and Alerting System

A production-ready, full-stack AI-powered Road Pothole Detection and Real-Time Alerting System built with **React**, **TypeScript**, **Tailwind CSS**, **FastAPI**, **YOLOv8 / OpenCV**, **SQLAlchemy**, and **Leaflet / Google Maps**.

---

## 🌟 Key Features

- 🎯 **AI Pothole Detection**: State-of-the-art computer vision pipeline using YOLOv8 & OpenCV to detect potholes, identify severity (Low, Medium, High, Critical), calculate surface area, and draw bounding boxes.
- 📹 **Live Camera Detection**: Stream live webcam feed for real-time pothole detection with visual bounding box overlays and dynamic audio hazard alerts.
- 🖼️ **Image & Video Analytics**: Drag-and-drop batch upload for single images or full video clips with frame-by-frame analysis and downloadable annotated results.
- 🗺️ **Interactive GIS Map**: Live heatmap and marker visualization using Leaflet/OpenStreetMap (with full optional Google Maps API support) showing exact GPS coordinates, severity markers, and hazard clusters.
- 🚨 **Real-time Alerting**: Automated proximity warning triggers and push notification engine integration (Firebase Cloud Messaging).
- 📊 **Admin Dashboard**: System health, severity analytics, user management, and pothole status workflow (Reported ➔ In Progress ➔ Repaired).
- 🔐 **JWT Authentication & Security**: Secure user registration, password hashing (bcrypt), role-based access control (Admin / Standard User).
- 🎨 **Modern Glassmorphic UI**: High-end responsive dark/light mode UI built with React 18, Vite, Framer Motion, and Tailwind CSS.
- 🐳 **Docker Containerized**: Out-of-the-box Docker & Docker Compose setup with GitHub Actions CI/CD pipeline.

---

## 📁 Repository Structure

```text
road-pothole-detector/
├── frontend/             # React + TypeScript + Vite + Tailwind CSS UI
├── backend/              # FastAPI Python REST API service
├── ai/                   # YOLOv8 & OpenCV computer vision engine
├── database/             # PostgreSQL / SQLite SQL schema and seeding scripts
├── docs/                 # Complete technical documentation & reports
├── docker/               # Dockerfiles and Docker Compose config
├── tests/                # Automated pytest API & AI unit tests
├── screenshots/          # Application preview assets
└── .github/workflows/    # CI/CD automated pipeline
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v18+ & npm
- Python 3.9+
- Docker & Docker Compose (optional for containerized deployment)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

pip install -r requirements.txt
python main.py
```
Backend API server will run at: `http://localhost:8000` (Swagger docs at `http://localhost:8000/docs`).

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Frontend Web App will run at: `http://localhost:5173`.

### 3. Docker Deployment (Single Command)

```bash
docker-compose -f docker/docker-compose.yml up --build
```

---

## 📄 Documentation Links

- 📖 [Installation Guide](docs/INSTALLATION.md)
- 🔌 [API Documentation](docs/API_DOCUMENTATION.md)
- ☁️ [Deployment Guide](docs/DEPLOYMENT.md)
- 👤 [User Manual](docs/USER_MANUAL.md)
- 📑 [Project Academic Report](docs/PROJECT_REPORT.md)
- 📊 [PPT Slide Outline](docs/PPT_CONTENT.md)
- 📝 [Abstract](docs/ABSTRACT.md)
- 📌 [Synopsis](docs/SYNOPSIS.md)

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.
