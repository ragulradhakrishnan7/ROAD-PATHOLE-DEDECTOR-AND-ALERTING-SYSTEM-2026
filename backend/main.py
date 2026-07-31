import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn

# Ensure parent directory is in path for AI and App imports
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.api import api_router
from app.models.pothole import Pothole

# Auto-create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="API server for AI-powered Road Pothole Detection and Alerting System",
    version="1.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Configure CORS for Frontend React Vite app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded static media files
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static", StaticFiles(directory=settings.UPLOAD_DIR), name="static")

# Include Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.on_event("startup")
def startup_event():
    """Auto-seed initial database if empty for immediate demo execution"""
    db = SessionLocal()
    try:
        pothole_count = db.query(Pothole).count()
        if pothole_count == 0:
            print("[Seed] Empty database detected on startup. Executing seed script...")
            try:
                from database.seed_data import seed
                seed()
            except Exception as e:
                print(f"Notice during auto-seed: {e}")
    finally:
        db.close()

@app.get("/")
def root():
    return {
        "message": "Road Pothole Detector API is running smoothly",
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
