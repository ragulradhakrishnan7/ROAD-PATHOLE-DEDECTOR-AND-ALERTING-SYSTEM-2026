# 🛠️ Installation & Setup Guide

This document provides step-by-step instructions to configure and run the **Road Pothole Detector and Alerting System** on your local machine or server.

---

## 📋 System Prerequisites

- **Node.js**: Version 18.0 or higher
- **Python**: Version 3.9, 3.10, or 3.11
- **Git**: Installed and configured
- **Docker** *(Optional)*: Docker Engine & Docker Compose for containerized setup

---

## ⚙️ 1. Clone & Environment Setup

```bash
git clone https://github.com/your-username/road-pothole-detector.git
cd road-pothole-detector
cp .env.example .env
```

---

## 🐍 2. Backend Setup (FastAPI + AI Engine)

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   # Windows:
   python -m venv venv
   venv\Scripts\activate

   # Linux/macOS:
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Launch the FastAPI server:
   ```bash
   python main.py
   ```
   - Server runs at: `http://localhost:8000`
   - Interactive Swagger API Docs: `http://localhost:8000/docs`

---

## ⚛️ 3. Frontend Setup (React + Vite + Tailwind CSS)

1. Open a new terminal and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   - Access the Web Application at: `http://localhost:5173`

---

## 🐳 4. One-Command Docker Setup

If you prefer running everything in containerized isolation:

```bash
docker-compose -f docker/docker-compose.yml up --build
```
- Frontend will be accessible at: `http://localhost`
- Backend API will be accessible at: `http://localhost:8000`
