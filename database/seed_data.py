"""
Seed Data Script for Road Pothole Detector System
Populates initial admin, standard users, sample potholes, and alert notifications.
"""
import uuid
import datetime
import os
import sys

# Ensure backend imports work
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.core.database import SessionLocal, engine, Base  # type: ignore[import-not-found]
from app.models.user import User  # type: ignore[import-not-found]
from app.models.pothole import Pothole  # type: ignore[import-not-found]
from app.models.alert import Alert  # type: ignore[import-not-found]
from app.core.security import get_password_hash  # type: ignore[import-not-found]

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Clear existing data for clean seed
    db.query(Alert).delete()
    db.query(Pothole).delete()
    db.query(User).delete()
    db.commit()

    print("[Seed] Seeding database...")

    # Create Users
    admin_user = User(
        id=str(uuid.uuid4()),
        name="System Admin",
        email="admin@roadpothole.com",
        password_hash=get_password_hash("Admin123!"),
        role="admin",
        avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"
    )

    demo_user = User(
        id=str(uuid.uuid4()),
        name="Alex Driver",
        email="alex@example.com",
        password_hash=get_password_hash("User123!"),
        role="user",
        avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250"
    )

    db.add(admin_user)
    db.add(demo_user)
    db.commit()

    # Sample Potholes with realistic GPS locations (San Francisco / Major Metro bounds)
    potholes_data = [
        {
            "lat": 37.7749, "lng": -122.4194, "location": "Market St & 5th St",
            "confidence": 0.94, "severity": "Critical", "status": "Reported", "area": 1.45,
            "img": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800"
        },
        {
            "lat": 37.7833, "lng": -122.4167, "location": "Geary Blvd & Leavenworth St",
            "confidence": 0.88, "severity": "High", "status": "In Progress", "area": 0.92,
            "img": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800"
        },
        {
            "lat": 37.7690, "lng": -122.4470, "location": "Haight St & Ashbury St",
            "confidence": 0.76, "severity": "Medium", "status": "Reported", "area": 0.48,
            "img": "https://images.unsplash.com/photo-1596241913254-e0b04ff04f14?auto=format&fit=crop&q=80&w=800"
        },
        {
            "lat": 37.8024, "lng": -122.4058, "location": "Embarcadero & Bay St",
            "confidence": 0.91, "severity": "Critical", "status": "Reported", "area": 1.80,
            "img": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800"
        },
        {
            "lat": 37.7510, "lng": -122.4180, "location": "Mission St & 24th St",
            "confidence": 0.65, "severity": "Low", "status": "Repaired", "area": 0.25,
            "img": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800"
        }
    ]

    pothole_objects = []
    for data in potholes_data:
        p = Pothole(
            id=str(uuid.uuid4()),
            latitude=data["lat"],
            longitude=data["lng"],
            location_name=data["location"],
            image_url=data["img"],
            confidence=data["confidence"],
            severity=data["severity"],
            status=data["status"],
            surface_area_sq_m=data["area"],
            user_id=demo_user.id,
            timestamp=datetime.datetime.utcnow() - datetime.timedelta(hours=int(data["area"] * 10))
        )
        db.add(p)
        pothole_objects.append(p)
    
    db.commit()

    # Alerts
    for p in pothole_objects[:3]:
        alert = Alert(
            id=str(uuid.uuid4()),
            pothole_id=p.id,
            user_id=demo_user.id,
            alert_type="Hazard Warning" if p.severity in ["High", "Critical"] else "Proximity",
            message=f"⚠️ {p.severity} Pothole detected near {p.location_name}! Drive carefully.",
            is_read=False,
            created_at=p.timestamp
        )
        db.add(alert)
    
    db.commit()
    db.close()
    print("[Seed] Database successfully seeded with demo users, potholes, and alerts!")

if __name__ == "__main__":
    seed()
