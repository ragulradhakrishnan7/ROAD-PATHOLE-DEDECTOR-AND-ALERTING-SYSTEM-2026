import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Crosshair, Loader2 } from 'lucide-react';
import { MapComponent } from '../components/MapComponent';
import { fetchDetectionHistory } from '../services/api';
import { Pothole } from '../types';
import { useGeolocation } from '../hooks/useGeolocation';

export const MapViewPage: React.FC = () => {
  const [potholes, setPotholes] = useState<Pothole[]>([]);
  const [selectedPothole, setSelectedPothole] = useState<Pothole | null>(null);
  const [severityFilter, setSeverityFilter] = useState('All');
  const geo = useGeolocation();

  useEffect(() => {
    fetchDetectionHistory().then(setPotholes);
  }, []);

  const filtered = severityFilter === 'All'
    ? potholes
    : potholes.filter(p => p.severity === severityFilter);

  return (
    <div className="space-y-6 h-[calc(100vh-6rem)] flex flex-col">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold flex items-center space-x-3">
            <MapPin className="w-7 h-7 text-rose-500" />
            <span>Interactive GIS Pothole Map</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center space-x-2 flex-wrap gap-2">
            {geo.loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Acquiring GPS position...</span>
              </>
            ) : geo.error ? (
              <>
                <Crosshair className="w-3.5 h-3.5 text-amber-500" />
                <span>GPS unavailable — showing all reported locations</span>
                <button
                  type="button"
                  onClick={geo.requestLocation}
                  className="ml-1 px-2.5 py-1 rounded-lg bg-emerald-500 text-white text-[11px] font-semibold hover:bg-emerald-600 transition-colors"
                >
                  Enable GPS
                </button>
              </>
            ) : (
              <>
                <Crosshair className="w-3.5 h-3.5 text-emerald-500" />
                <span>Live GPS: {geo.locationName} ({geo.latitude.toFixed(4)}, {geo.longitude.toFixed(4)})</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <span className="text-gray-500 font-semibold">Filter Severity:</span>
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2 outline-none font-bold"
          >
            <option value="All">All Hazards ({potholes.length})</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>
        </div>
      </div>

      {/* Map Split Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        
        {/* Full Interactive Map */}
        <div className="lg:col-span-3 h-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800">
          <MapComponent
            potholes={filtered}
            onSelectPothole={(p) => setSelectedPothole(p)}
            userLocation={!geo.loading && !geo.error ? geo : null}
          />
        </div>

        {/* Selected Pothole Detail Card */}
        <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-800 rounded-3xl p-6 overflow-y-auto space-y-4 shadow-sm">
          <h3 className="font-bold text-base border-b border-gray-200 dark:border-gray-800 pb-3">Hazard Inspector</h3>

          {!selectedPothole ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <Navigation className="w-10 h-10 mx-auto stroke-1 text-rose-500 animate-pulse" />
              <p className="text-xs">Click any marker on the map to inspect full severity report.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <img src={selectedPothole.image_url} alt="Pothole" className="w-full h-40 object-cover rounded-2xl" />
              <div>
                <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                  selectedPothole.severity === 'Critical' ? 'bg-rose-500/20 text-rose-500' : 'bg-amber-500/20 text-amber-500'
                }`}>
                  {selectedPothole.severity} Severity
                </span>
                <h4 className="font-bold text-base mt-1">{selectedPothole.location_name}</h4>
              </div>

              <div className="space-y-2 text-xs border-t border-gray-100 dark:border-gray-800 pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">GPS Coordinates:</span>
                  <span className="font-mono">{selectedPothole.latitude.toFixed(4)}, {selectedPothole.longitude.toFixed(4)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Surface Area:</span>
                  <span className="font-bold">{selectedPothole.surface_area_sq_m} m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Repair Status:</span>
                  <span className="font-bold text-brand-500">{selectedPothole.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
