# 📝 Project Abstract

Potholes and road surface deterioration present major hazards to traffic safety, leading to vehicular damage, traffic congestion, and accidents. Traditional road inspection techniques rely on human reports and periodic physical surveys, which are time-consuming and inefficient.

This project introduces a **production-ready, real-time AI Road Pothole Detector and Alerting System**. By integrating state-of-the-art computer vision models (**YOLOv8** and **OpenCV**) with a high-performance full-stack web application (**React**, **TypeScript**, **FastAPI**, **SQLAlchemy**, and **Leaflet GIS Maps**), the system automatically detects road defects from live camera feeds, uploaded images, and video clips. 

When a pothole is detected, the system calculates its bounding box, surface area in $m^2$, confidence score, and severity level (*Low*, *Medium*, *High*, *Critical*). Detected hazards are geotagged to an interactive map, and real-time audio and push notifications alert approaching drivers. An admin portal enables municipal authorities to track reported defects and update repair status through completion.
