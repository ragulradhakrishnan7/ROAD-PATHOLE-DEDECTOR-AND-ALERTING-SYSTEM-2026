import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair } from 'lucide-react';
import type { LocationPoint } from '../hooks/useLiveLocation';

// Fix Leaflet Default Icon Assets in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ─── Animated User Location Marker ──────────────────────────────────────────

const createLiveUserIcon = (heading: number | null) => {
  const rotation = heading !== null && !isNaN(heading) ? heading : 0;
  const showArrow = heading !== null && !isNaN(heading);

  const html = `
    <div style="position: relative; width: 40px; height: 40px;">
      <!-- Outer pulse ring -->
      <div class="live-marker-pulse" style="
        position: absolute;
        inset: 0;
        background-color: rgba(59, 130, 246, 0.18);
        border-radius: 50%;
      "></div>
      <!-- Middle ring -->
      <div style="
        position: absolute;
        top: 6px; left: 6px;
        width: 28px; height: 28px;
        background-color: rgba(59, 130, 246, 0.12);
        border-radius: 50%;
      "></div>
      <!-- Core dot -->
      <div style="
        position: absolute;
        top: 12px; left: 12px;
        width: 16px; height: 16px;
        background: linear-gradient(135deg, #60a5fa, #3b82f6);
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 12px rgba(59, 130, 246, 0.7), 0 0 0 2px rgba(59, 130, 246, 0.2);
      "></div>
      ${showArrow ? `
      <!-- Heading arrow -->
      <div style="
        position: absolute;
        top: -4px; left: 15px;
        width: 0; height: 0;
        border-left: 5px solid transparent;
        border-right: 5px solid transparent;
        border-bottom: 12px solid #3b82f6;
        transform: rotate(${rotation}deg);
        transform-origin: center 24px;
        filter: drop-shadow(0 1px 3px rgba(59,130,246,0.5));
      "></div>
      ` : ''}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'live-user-location-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

// ─── AutoFollow Sub-component ───────────────────────────────────────────────

const AutoFollow: React.FC<{
  latitude: number;
  longitude: number;
  isTracking: boolean;
  followMode: boolean;
  onUserInteraction: () => void;
}> = ({ latitude, longitude, isTracking, followMode, onUserInteraction }) => {
  const map = useMap();
  const isFirstPosition = useRef(true);

  // Detect user-initiated map interactions
  useEffect(() => {
    const handleMove = () => {
      // Only flag user interaction when tracking is active
      if (isTracking) {
        onUserInteraction();
      }
    };

    map.on('dragstart', handleMove);
    map.on('zoomstart', handleMove);

    return () => {
      map.off('dragstart', handleMove);
      map.off('zoomstart', handleMove);
    };
  }, [map, isTracking, onUserInteraction]);

  // Follow user position
  useEffect(() => {
    if (!isTracking || latitude === 0 && longitude === 0) return;

    if (isFirstPosition.current) {
      map.setView([latitude, longitude], 17, { animate: true });
      isFirstPosition.current = false;
      return;
    }

    if (followMode) {
      map.panTo([latitude, longitude], { animate: true, duration: 0.5 });
    }
  }, [latitude, longitude, isTracking, followMode, map]);

  // Reset first-position flag when tracking restarts
  useEffect(() => {
    if (!isTracking) {
      isFirstPosition.current = true;
    }
  }, [isTracking]);

  return null;
};

// ─── Main Component ─────────────────────────────────────────────────────────

interface LiveLocationMapProps {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  isTracking: boolean;
  history: LocationPoint[];
}

export const LiveLocationMap: React.FC<LiveLocationMapProps> = ({
  latitude,
  longitude,
  accuracy,
  heading,
  speed,
  isTracking,
  history,
}) => {
  const [followMode, setFollowMode] = useState(true);

  const handleUserInteraction = useCallback(() => {
    setFollowMode(false);
  }, []);

  const handleRecenter = useCallback(() => {
    setFollowMode(true);
  }, []);

  // Re-enable follow mode when tracking starts
  useEffect(() => {
    if (isTracking) {
      setFollowMode(true);
    }
  }, [isTracking]);

  // Build polyline from history
  const trailPositions: [number, number][] = history.map((p) => [
    p.latitude,
    p.longitude,
  ]);

  const hasPosition = latitude !== 0 || longitude !== 0;
  const center: [number, number] = hasPosition
    ? [latitude, longitude]
    : [20, 78]; // Fallback to India center
  const zoom = hasPosition ? 17 : 5;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden relative" id="live-location-map-container">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        zoomControl={false}
        style={{ width: '100%', height: '100%', minHeight: '300px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <AutoFollow
          latitude={latitude}
          longitude={longitude}
          isTracking={isTracking}
          followMode={followMode}
          onUserInteraction={handleUserInteraction}
        />

        {/* Location trail polyline */}
        {trailPositions.length > 1 && (
          <Polyline
            positions={trailPositions}
            pathOptions={{
              color: '#3b82f6',
              weight: 4,
              opacity: 0.5,
              dashArray: '8, 6',
              lineCap: 'round',
              lineJoin: 'round',
            }}
          />
        )}

        {/* Accuracy radius */}
        {hasPosition && accuracy && accuracy < 500 && (
          <Circle
            center={[latitude, longitude]}
            radius={accuracy}
            pathOptions={{
              color: '#3b82f6',
              fillColor: '#3b82f6',
              fillOpacity: 0.06,
              weight: 1.5,
              dashArray: '4, 4',
            }}
          />
        )}

        {/* User position marker */}
        {hasPosition && (
          <Marker
            position={[latitude, longitude]}
            icon={createLiveUserIcon(heading)}
            zIndexOffset={1000}
          >
            <Popup>
              <div className="text-center p-2 text-gray-900 min-w-[160px]">
                <p className="font-bold text-sm mb-1">📍 Your Live Position</p>
                <p className="text-xs text-gray-600 font-mono">
                  {latitude.toFixed(6)}, {longitude.toFixed(6)}
                </p>
                {accuracy && (
                  <p className="text-xs text-gray-400 mt-1">
                    Accuracy: ±{Math.round(accuracy)}m
                  </p>
                )}
                {speed !== null && speed > 0 && (
                  <p className="text-xs text-blue-500 mt-1">
                    Speed: {(speed * 3.6).toFixed(1)} km/h
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Re-center button — appears when user scrolls away */}
      {isTracking && !followMode && hasPosition && (
        <button
          onClick={handleRecenter}
          id="recenter-map-button"
          className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-white/90 dark:bg-gray-900/90 backdrop-blur-md
            text-sm font-semibold text-brand-600 dark:text-brand-500
            border border-gray-200 dark:border-gray-700
            shadow-lg hover:shadow-xl hover:scale-105
            transition-all duration-200 cursor-pointer"
        >
          <Crosshair className="w-4 h-4" />
          Re-center
        </button>
      )}
    </div>
  );
};
