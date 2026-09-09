export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar_url?: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface BoundingBox {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface Pothole {
  id: string;
  latitude: number;
  longitude: number;
  location_name: string;
  image_url: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Reported' | 'In Progress' | 'Repaired';
  surface_area_sq_m: number;
  user_id?: string;
  timestamp: string;
}

export interface DetectionResult {
  total_detected: number;
  max_severity: string;
  confidence_avg: number;
  annotated_image_url: string;
  bounding_boxes: BoundingBox[];
  potholes: Pothole[];
}

export interface AlertNotification {
  id: string;
  pothole_id?: string;
  user_id?: string;
  alert_type: 'Proximity' | 'Hazard Warning' | 'Status Update' | 'System';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_potholes: number;
  total_alerts: number;
  repaired_count: number;
  in_progress_count: number;
  reported_count: number;
  repair_rate_percent: number;
  severity_breakdown: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
}

export interface VideoFrameDetection {
  frame_number: number;
  timestamp_sec: number;
  detection_count: number;
  bounding_boxes: BoundingBox[];
  annotated_frame_url?: string;
}

export interface VideoDetectionResult {
  total_frames_analyzed: number;
  total_potholes_detected: number;
  max_severity: string;
  confidence_avg: number;
  severity_breakdown: {
    Critical: number;
    High: number;
    Medium: number;
    Low: number;
  };
  frame_detections: VideoFrameDetection[];
  potholes: Pothole[];
}

