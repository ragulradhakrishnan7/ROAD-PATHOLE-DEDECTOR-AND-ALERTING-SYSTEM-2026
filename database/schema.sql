-- Road Pothole Detector and Alerting System Database Schema
-- Compatible with PostgreSQL and SQLite

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Potholes Table
CREATE TABLE IF NOT EXISTS potholes (
    id VARCHAR(36) PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    location_name VARCHAR(255),
    image_url VARCHAR(500) NOT NULL,
    confidence FLOAT NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    status VARCHAR(20) DEFAULT 'Reported' CHECK (status IN ('Reported', 'In Progress', 'Repaired')),
    surface_area_sq_m FLOAT DEFAULT 0.0,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id VARCHAR(36) PRIMARY KEY,
    pothole_id VARCHAR(36) REFERENCES potholes(id) ON DELETE CASCADE,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE CASCADE,
    alert_type VARCHAR(30) NOT NULL CHECK (alert_type IN ('Proximity', 'Hazard Warning', 'Status Update', 'System')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for GIS and Search Performance
CREATE INDEX IF NOT EXISTS idx_potholes_coords ON potholes(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_potholes_severity ON potholes(severity);
CREATE INDEX IF NOT EXISTS idx_potholes_status ON potholes(status);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
