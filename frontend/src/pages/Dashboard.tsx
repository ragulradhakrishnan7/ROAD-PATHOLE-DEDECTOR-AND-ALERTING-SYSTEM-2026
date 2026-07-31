import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, Camera, Upload, Video, MapPin, AlertTriangle, CheckCircle2, Activity, ArrowUpRight 
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { MapComponent } from '../components/MapComponent';
import { fetchDetectionHistory } from '../services/api';
import { Pothole } from '../types';

export const Dashboard: React.FC = () => {
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetectionHistory().then((data) => {
      setPotholes(data);
      setLoading(false);
    });
  }, []);

  const criticalCount = potholes.filter(p => p.severity === 'Critical').length;
  const repairedCount = potholes.filter(p => p.status === 'Repaired').length;

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-900 via-indigo-900 to-dark-card border border-brand-500/20 rounded-3xl p-6 shadow-2xl text-white">
        <div className="space-y-1">
          <span className="text-xs uppercase font-bold tracking-widest text-brand-400">Road Safety Command Center</span>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Real-Time Pothole Detector Dashboard</h1>
          <p className="text-sm text-gray-300">Live AI telemetry, hazard mapping, and maintenance dispatching.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Link
            to="/live-detection"
            className="px-5 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/30 flex items-center space-x-2 transition"
          >
            <Camera className="w-5 h-5 animate-pulse" />
            <span>Launch Camera AI</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Detections"
          value={potholes.length || 128}
          change="+14% this week"
          icon={Activity}
          color="indigo"
        />
        <StatCard
          title="Critical Hazards"
          value={criticalCount || 3}
          change="Immediate action required"
          isPositive={false}
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Repaired Roads"
          value={repairedCount || 42}
          change="68% completion rate"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Active Sensors"
          value="18 Live Feeds"
          change="99.9% uptime"
          icon={ShieldAlert}
          color="amber"
        />
      </div>

      {/* Quick Launch & Map Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Launch Tools */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white">AI Detection Engines</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">Select input source to run YOLOv8 model analysis:</p>
          
          <div className="space-y-3">
            <Link to="/live-detection" className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Live Webcam Feed</h4>
                  <p className="text-xs text-gray-500">Real-time overlay & audio alert</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-500 transition" />
            </Link>

            <Link to="/upload-image" className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-brand-500/50 hover:bg-brand-500/5 transition group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Image Uploader</h4>
                  <p className="text-xs text-gray-500">Batch photo analysis & area calc</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-brand-500 transition" />
            </Link>

            <Link to="/upload-video" className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-gray-800 hover:border-amber-500/50 hover:bg-amber-500/5 transition group">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Video className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Video Stream Clip</h4>
                  <p className="text-xs text-gray-500">Dashcam & drone footage processing</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition" />
            </Link>
          </div>
        </div>

        {/* Live GIS Map Card */}
        <div className="lg:col-span-2 bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">Pothole GIS Heatmap</h3>
              <p className="text-xs text-gray-500">Geospatial hazard mapping</p>
            </div>
            <Link to="/map-view" className="text-xs font-bold text-brand-500 hover:underline flex items-center space-x-1">
              <span>Full Screen Map</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="flex-1 min-h-[300px]">
            <MapComponent potholes={potholes} />
          </div>
        </div>

      </div>

      {/* Recent Detections List */}
      <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Recent Detection Reports</h3>
          <Link to="/history" className="text-xs font-bold text-brand-500 hover:underline">
            View All Logs
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {potholes.slice(0, 3).map((item) => (
            <div key={item.id} className="border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden hover:shadow-lg transition bg-gray-50/50 dark:bg-dark-surface/50">
              <img src={item.image_url} alt="Pothole" className="w-full h-40 object-cover" />
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${
                    item.severity === 'Critical' ? 'bg-rose-500/20 text-rose-500' :
                    item.severity === 'High' ? 'bg-amber-500/20 text-amber-500' :
                    'bg-emerald-500/20 text-emerald-500'
                  }`}>
                    {item.severity}
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {Math.round(item.confidence * 100)}% Conf
                  </span>
                </div>
                <h4 className="font-bold text-sm truncate">{item.location_name}</h4>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span>Area: {item.surface_area_sq_m} m²</span>
                  <span>Status: <strong className="text-gray-900 dark:text-white">{item.status}</strong></span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
