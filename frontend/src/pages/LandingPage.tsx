import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, Camera, MapPin, Cpu, Activity, ArrowRight, Zap, Bell, CheckCircle2 
} from 'lucide-react';
import { motion } from 'framer-motion';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg text-gray-900 dark:text-gray-100 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 dark:bg-brand-500/20 blur-[140px] rounded-full pointer-events-none" />
        
        <div className="text-center space-y-8 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-semibold text-xs uppercase tracking-widest"
          >
            <Zap className="w-4 h-4" />
            <span>Next-Gen Computer Vision & GIS Hazard Detection</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight"
          >
            Detect Potholes in Real-Time <br />
            <span className="bg-gradient-to-r from-brand-600 via-indigo-500 to-rose-500 bg-clip-text text-transparent">
              Protect Drivers & Infrastructure
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-lg sm:text-xl text-gray-600 dark:text-gray-400 font-normal leading-relaxed"
          >
            An end-to-end AI platform powered by YOLOv8 and OpenCV that identifies road defects from live camera feeds, calculates surface severity, tags GPS locations, and sends instant driver proximity alerts.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link
              to="/live-detection"
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/30 flex items-center justify-center space-x-3 group transition-all"
            >
              <Camera className="w-5 h-5" />
              <span>Launch Live Camera AI</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              to="/map-view"
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-dark-card hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-white font-bold rounded-2xl border border-gray-200 dark:border-gray-800 flex items-center justify-center space-x-2 transition-all"
            >
              <MapPin className="w-5 h-5 text-rose-500" />
              <span>Explore GIS Hazard Map</span>
            </Link>
          </motion.div>

        </div>

        {/* Feature Grid Preview Card */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-white/70 dark:bg-dark-card/70 backdrop-blur-xl border border-gray-200 dark:border-gray-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-brand-500 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">YOLOv8 Machine Learning</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                High-precision deep neural network detecting road surface anomalies down to millisecond frame rates.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Severity Matrix & Metrics</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Automatically calculates surface area in $m^2$, estimates pothole depth, and categorizes severity (Low ➔ Critical).
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Real-Time Hazard Alerts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Geofenced proximity audio notifications and push notifications for approaching drivers.
              </p>
            </div>
          </div>
        </motion.div>

      </section>

      {/* Stats Counter Section */}
      <section className="bg-white dark:bg-dark-card border-y border-gray-200 dark:border-gray-800 py-16">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h4 className="text-4xl font-extrabold text-brand-500">98.4%</h4>
            <p className="text-xs uppercase font-semibold tracking-wider text-gray-500 mt-1">Detection Accuracy</p>
          </div>
          <div>
            <h4 className="text-4xl font-extrabold text-emerald-500">&lt; 25 ms</h4>
            <p className="text-xs uppercase font-semibold tracking-wider text-gray-500 mt-1">Inference Latency</p>
          </div>
          <div>
            <h4 className="text-4xl font-extrabold text-amber-500">1,280+</h4>
            <p className="text-xs uppercase font-semibold tracking-wider text-gray-500 mt-1">Potholes Mapped</p>
          </div>
          <div>
            <h4 className="text-4xl font-extrabold text-rose-500">24/7</h4>
            <p className="text-xs uppercase font-semibold tracking-wider text-gray-500 mt-1">Automated Monitoring</p>
          </div>
        </div>
      </section>

    </div>
  );
};
