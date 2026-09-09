import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Navigation2,
  MapPin,
  Gauge,
  Crosshair,
  Clock,
  Compass,
  Radio,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  Info,
  Satellite,
} from 'lucide-react';
import { useLiveLocation } from '../hooks/useLiveLocation';
import { LiveLocationMap } from '../components/LiveLocationMap';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatElapsedTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function formatSpeed(speedMs: number | null): string {
  if (speedMs === null || speedMs <= 0) return '—';
  return `${(speedMs * 3.6).toFixed(1)} km/h`;
}

function formatHeading(heading: number | null): string {
  if (heading === null || isNaN(heading)) return '—';
  const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(heading / 45) % 8;
  return `${dirs[idx]} (${Math.round(heading)}°)`;
}

// ─── Stat Card ──────────────────────────────────────────────────────────────

const StatItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}> = ({ icon, label, value, accent = 'text-gray-100' }) => (
  <div className="flex flex-col items-center gap-1 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/[0.06] min-w-[100px]">
    <div className="text-gray-400">{icon}</div>
    <span className="text-[10px] uppercase tracking-widest font-semibold text-gray-500">{label}</span>
    <span className={`text-sm font-bold font-mono ${accent}`}>{value}</span>
  </div>
);

// ─── Page Component ─────────────────────────────────────────────────────────

export const LiveLocationPage: React.FC = () => {
  const loc = useLiveLocation({ maxHistory: 100 });

  // ── State badges ────────────────────────────────────────────────────────

  const renderStatusBadge = () => {
    if (loc.isTracking) {
      return (
        <span className="live-tracking-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          LIVE
        </span>
      );
    }
    if (loc.status === 'error') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400 border border-red-500/25">
          <AlertTriangle className="w-3 h-3" />
          ERROR
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-500/15 text-gray-400 border border-gray-500/25">
        <Radio className="w-3 h-3" />
        OFF
      </span>
    );
  };

  // ── Permission rationale (shown before first request) ───────────────────

  const renderPermissionRationale = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="flex-1 flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full text-center space-y-6">
        {/* Icon animation */}
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-brand-500/25"
        >
          <Navigation2 className="w-10 h-10 text-white" />
        </motion.div>

        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold">Enable Live Location</h2>
          <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
            We need access to your device's GPS to track your real-time position on the map.
            This helps detect nearby potholes and send you proximity alerts as you move.
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          {[
            {
              icon: <Satellite className="w-5 h-5 text-blue-400" />,
              title: 'GPS Tracking',
              desc: 'Uses your device GPS for accurate positioning',
            },
            {
              icon: <ShieldAlert className="w-5 h-5 text-amber-400" />,
              title: 'Privacy First',
              desc: 'Location stays on your device — no server upload',
            },
            {
              icon: <Gauge className="w-5 h-5 text-emerald-400" />,
              title: 'Battery Smart',
              desc: 'Optimized polling to minimize battery drain',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="p-3 rounded-xl bg-white/5 border border-white/[0.06] space-y-1.5"
            >
              {item.icon}
              <p className="text-xs font-bold">{item.title}</p>
              <p className="text-[10px] text-gray-500 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>

        <button
          id="enable-live-tracking-button"
          onClick={loc.startTracking}
          className="w-full px-6 py-3.5 rounded-2xl font-bold text-sm
            bg-gradient-to-r from-brand-600 to-indigo-600
            hover:from-brand-700 hover:to-indigo-700
            text-white shadow-lg shadow-brand-500/25
            hover:shadow-xl hover:shadow-brand-500/30
            hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 cursor-pointer"
        >
          <span className="flex items-center justify-center gap-2">
            <Navigation2 className="w-4 h-4" />
            Enable Live Tracking
          </span>
        </button>

        <p className="text-[10px] text-gray-600 flex items-center justify-center gap-1">
          <Info className="w-3 h-3" />
          Your browser will ask for permission. You can revoke it anytime.
        </p>
      </div>
    </motion.div>
  );

  // ── Permission denied state ─────────────────────────────────────────────

  const renderPermissionDenied = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>
        <h2 className="text-xl font-extrabold text-red-400">Location Access Denied</h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
          You've denied location permission. To use live tracking, please enable location access in your browser settings:
        </p>
        <div className="text-left text-xs text-gray-500 space-y-2 bg-white/5 rounded-xl p-4 border border-white/[0.06]">
          <p className="font-semibold text-gray-300 mb-2">How to enable:</p>
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Click the <strong className="text-gray-300">lock/site-info icon</strong> in the address bar</li>
            <li>Find <strong className="text-gray-300">Location</strong> in the permissions list</li>
            <li>Change it to <strong className="text-gray-300">Allow</strong></li>
            <li>Refresh this page and try again</li>
          </ol>
        </div>
        <button
          id="retry-permission-button"
          onClick={loc.startTracking}
          className="px-6 py-3 rounded-xl font-bold text-sm
            bg-white/10 hover:bg-white/15 text-gray-200
            border border-white/10 hover:border-white/20
            transition-all duration-200 cursor-pointer"
        >
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Try Again
          </span>
        </button>
      </div>
    </motion.div>
  );

  // ── Error state (non-permission errors) ─────────────────────────────────

  const renderErrorState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 flex items-center justify-center p-6"
    >
      <div className="max-w-md w-full text-center space-y-5">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
          <AlertTriangle className="w-8 h-8 text-amber-400" />
        </div>
        <h2 className="text-xl font-extrabold text-amber-400">Location Error</h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-sm mx-auto">
          {loc.error?.message || 'An unexpected error occurred while accessing your location.'}
        </p>
        <button
          id="retry-tracking-button"
          onClick={loc.startTracking}
          className="px-6 py-3 rounded-xl font-bold text-sm
            bg-gradient-to-r from-amber-600 to-orange-600
            hover:from-amber-700 hover:to-orange-700
            text-white shadow-lg shadow-amber-500/20
            hover:scale-[1.02] active:scale-[0.98]
            transition-all duration-200 cursor-pointer"
        >
          <span className="flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </span>
        </button>
      </div>
    </motion.div>
  );

  // ── Active tracking view ────────────────────────────────────────────────

  const renderTrackingView = () => (
    <div className="flex-1 flex flex-col min-h-0">
      {/* Map fills remaining space */}
      <div className="flex-1 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl relative">
        <LiveLocationMap
          latitude={loc.latitude}
          longitude={loc.longitude}
          accuracy={loc.accuracy}
          heading={loc.heading}
          speed={loc.speed}
          isTracking={loc.isTracking}
          history={loc.history}
        />
      </div>

      {/* Stats overlay bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-4 rounded-2xl bg-dark-card/80 backdrop-blur-xl border border-white/[0.06] p-4 space-y-4"
      >
        {/* Stat items row */}
        <div className="flex flex-wrap justify-center gap-3">
          <StatItem
            icon={<MapPin className="w-4 h-4" />}
            label="Latitude"
            value={loc.latitude.toFixed(6)}
            accent="text-blue-400"
          />
          <StatItem
            icon={<MapPin className="w-4 h-4" />}
            label="Longitude"
            value={loc.longitude.toFixed(6)}
            accent="text-blue-400"
          />
          <StatItem
            icon={<Gauge className="w-4 h-4" />}
            label="Speed"
            value={formatSpeed(loc.speed)}
            accent="text-emerald-400"
          />
          <StatItem
            icon={<Crosshair className="w-4 h-4" />}
            label="Accuracy"
            value={loc.accuracy ? `±${Math.round(loc.accuracy)}m` : '—'}
            accent="text-amber-400"
          />
          <StatItem
            icon={<Compass className="w-4 h-4" />}
            label="Heading"
            value={formatHeading(loc.heading)}
            accent="text-purple-400"
          />
          <StatItem
            icon={<Clock className="w-4 h-4" />}
            label="Elapsed"
            value={formatElapsedTime(loc.elapsedSeconds)}
            accent="text-indigo-400"
          />
        </div>

        {/* Location name + controls row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-center sm:text-left">
            {loc.locationName && (
              <p className="text-sm text-gray-300 font-medium truncate max-w-xs">
                📍 {loc.locationName}
              </p>
            )}
            <p className="text-[10px] text-gray-600">
              {loc.history.length} position{loc.history.length !== 1 ? 's' : ''} recorded
            </p>
          </div>

          <div className="flex items-center gap-2">
            {loc.isTracking ? (
              <button
                id="stop-tracking-button"
                onClick={loc.stopTracking}
                className="px-5 py-2.5 rounded-xl font-bold text-sm
                  bg-gradient-to-r from-red-600 to-rose-600
                  hover:from-red-700 hover:to-rose-700
                  text-white shadow-lg shadow-red-500/20
                  hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-200 cursor-pointer
                  flex items-center gap-2"
              >
                <span className="w-3 h-3 rounded-sm bg-white" />
                Stop Tracking
              </button>
            ) : (
              <button
                id="resume-tracking-button"
                onClick={loc.startTracking}
                className="px-5 py-2.5 rounded-xl font-bold text-sm
                  bg-gradient-to-r from-brand-600 to-indigo-600
                  hover:from-brand-700 hover:to-indigo-700
                  text-white shadow-lg shadow-brand-500/20
                  hover:scale-[1.02] active:scale-[0.98]
                  transition-all duration-200 cursor-pointer
                  flex items-center gap-2"
              >
                <Navigation2 className="w-4 h-4" />
                Resume Tracking
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );

  // ── Determine which view to render ──────────────────────────────────────

  const renderContent = () => {
    // Permission explicitly denied
    if (loc.permission === 'denied' || loc.error?.code === 'PERMISSION_DENIED') {
      return renderPermissionDenied();
    }

    // Non-permission error (PERMISSION_DENIED is already handled above)
    if (loc.status === 'error') {
      return renderErrorState();
    }

    // Tracking is active or was previously active (has position data)
    if (loc.isTracking || (loc.status === 'idle' && (loc.latitude !== 0 || loc.longitude !== 0))) {
      return renderTrackingView();
    }

    // Initial / idle state — show rationale
    return renderPermissionRationale();
  };

  return (
    <div className="space-y-4 h-[calc(100vh-6rem)] flex flex-col" id="live-location-page">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Navigation2 className="w-5 h-5 text-white" />
            </div>
            Live Location Tracker
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 ml-12">
            Real-time GPS position tracking with interactive map visualization
          </p>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={loc.isTracking ? 'live' : loc.status === 'error' ? 'error' : 'off'}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            {renderStatusBadge()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Main content area */}
      <AnimatePresence mode="wait">
        {renderContent()}
      </AnimatePresence>
    </div>
  );
};
