import React, { useState } from 'react';
import { Settings, Bell, Key, MapPin, Sliders } from 'lucide-react';
import { Toast } from '../components/Toast';

export const SettingsPage: React.FC = () => {
  const [googleMapsKey, setGoogleMapsKey] = useState('');
  const [confThreshold, setConfThreshold] = useState('0.45');
  const [toast, setToast] = useState<any>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setToast({
      id: Date.now().toString(),
      type: 'success',
      title: 'Settings Saved',
      message: 'System parameters and API credentials updated.'
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <div>
        <h1 className="text-2xl font-extrabold flex items-center space-x-3">
          <Settings className="w-7 h-7 text-brand-500" />
          <span>System Settings & API Keys</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure detection confidence thresholds, Google Maps credentials, and push notifications.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-8 space-y-6 shadow-sm">
        
        <div className="space-y-4">
          <h3 className="font-bold text-base flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <Key className="w-5 h-5 text-amber-500" />
            <span>Map Provider API Keys</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Google Maps JS API Key (Optional)</label>
            <input
              type="password"
              value={googleMapsKey}
              onChange={(e) => setGoogleMapsKey(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
            <p className="text-[11px] text-gray-400 mt-1">If blank, OpenStreetMap / Leaflet rendering engine is active.</p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-base flex items-center space-x-2 border-b border-gray-100 dark:border-gray-800 pb-3">
            <Sliders className="w-5 h-5 text-brand-500" />
            <span>AI YOLOv8 Parameters</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Confidence Score Threshold ({confThreshold})</label>
            <input
              type="range"
              min="0.1"
              max="0.9"
              step="0.05"
              value={confThreshold}
              onChange={(e) => setConfThreshold(e.target.value)}
              className="w-full accent-brand-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25 flex items-center space-x-2 transition"
        >
          <span>Save System Configurations</span>
        </button>
      </form>
    </div>
  );
};
