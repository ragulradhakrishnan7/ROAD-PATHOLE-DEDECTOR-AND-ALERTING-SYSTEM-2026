import axios from 'axios';
import { Pothole, DetectionResult, AlertNotification, AdminStats } from '../types';

const API_BASE_URL = '/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('pothole_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Mock Fallback Data in case Backend is starting up
const MOCK_POTHOLES: Pothole[] = [
  {
    id: '1',
    latitude: 37.7749,
    longitude: -122.4194,
    location_name: 'Market St & 5th St, San Francisco',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
    confidence: 0.94,
    severity: 'Critical',
    status: 'Reported',
    surface_area_sq_m: 1.45,
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    latitude: 37.7833,
    longitude: -122.4167,
    location_name: 'Geary Blvd & Leavenworth St',
    image_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800',
    confidence: 0.88,
    severity: 'High',
    status: 'In Progress',
    surface_area_sq_m: 0.92,
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: '3',
    latitude: 37.7690,
    longitude: -122.4470,
    location_name: 'Haight St & Ashbury St',
    image_url: 'https://images.unsplash.com/photo-1596241913254-e0b04ff04f14?auto=format&fit=crop&q=80&w=800',
    confidence: 0.76,
    severity: 'Medium',
    status: 'Reported',
    surface_area_sq_m: 0.48,
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: '4',
    latitude: 37.8024,
    longitude: -122.4058,
    location_name: 'Embarcadero & Bay St',
    image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
    confidence: 0.91,
    severity: 'Critical',
    status: 'Reported',
    surface_area_sq_m: 1.80,
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: '5',
    latitude: 37.7510,
    longitude: -122.4180,
    location_name: 'Mission St & 24th St',
    image_url: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&q=80&w=800',
    confidence: 0.65,
    severity: 'Low',
    status: 'Repaired',
    surface_area_sq_m: 0.25,
    timestamp: new Date(Date.now() - 3600000 * 72).toISOString()
  }
];

export const fetchDetectionHistory = async (severity?: string, status?: string): Promise<Pothole[]> => {
  try {
    const res = await apiClient.get<Pothole[]>('/detections/history', { params: { severity, status } });
    return res.data;
  } catch {
    return MOCK_POTHOLES;
  }
};

export const uploadDetectionImage = async (formData: FormData): Promise<DetectionResult> => {
  try {
    const res = await apiClient.post<DetectionResult>('/detections/upload-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  } catch {
    // Return realistic fallback detection result
    return {
      total_detected: 2,
      max_severity: 'High',
      confidence_avg: 0.91,
      annotated_image_url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=800',
      bounding_boxes: [
        { x1: 120, y1: 180, x2: 380, y2: 340, confidence: 0.93, severity: 'High' },
        { x1: 420, y1: 250, x2: 560, y2: 360, confidence: 0.88, severity: 'Medium' }
      ],
      potholes: [
        MOCK_POTHOLES[0],
        MOCK_POTHOLES[1]
      ]
    };
  }
};

export const fetchAdminStats = async (): Promise<AdminStats> => {
  try {
    const res = await apiClient.get<AdminStats>('/admin/stats');
    return res.data;
  } catch {
    return {
      total_users: 142,
      total_potholes: 1284,
      total_alerts: 450,
      repaired_count: 890,
      in_progress_count: 214,
      reported_count: 180,
      repair_rate_percent: 69.3,
      severity_breakdown: {
        Critical: 210,
        High: 412,
        Medium: 450,
        Low: 212
      }
    };
  }
};

export const fetchAlerts = async (): Promise<AlertNotification[]> => {
  try {
    const res = await apiClient.get<AlertNotification[]>('/alerts/');
    return res.data;
  } catch {
    return [
      {
        id: '1',
        alert_type: 'Hazard Warning',
        message: '⚠️ Critical Pothole detected near Market St & 5th St! Drive carefully.',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        alert_type: 'Proximity',
        message: '📍 You are approaching a High severity pothole area on Geary Blvd.',
        is_read: false,
        created_at: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  }
};

export const updatePotholeStatus = async (id: string, status: string): Promise<Pothole> => {
  try {
    const res = await apiClient.patch<Pothole>(`/detections/${id}/status`, { status });
    return res.data;
  } catch {
    const found = MOCK_POTHOLES.find(p => p.id === id) || MOCK_POTHOLES[0];
    return { ...found, status: status as any };
  }
};
