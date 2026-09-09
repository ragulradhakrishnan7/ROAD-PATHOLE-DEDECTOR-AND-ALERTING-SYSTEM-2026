import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Maximize2 } from 'lucide-react';
import { Pothole } from '../types';

// Fix Leaflet Default Icon Assets in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Severity Marker Icons
const createSeverityIcon = (severity: string) => {
  const COLOR_HEX: Record<string, string> = {
    Critical: '#ef4444',
    High: '#f97316',
    Medium: '#eab308',
    Low: '#10b981'
  };
  const color = COLOR_HEX[severity] || '#6366f1';

  const svgHtml = `
    <div style="
      background-color: ${color};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="width: 10px; height: 10px; background-color: white; border-radius: 50%;"></div>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// "You Are Here" pulsing blue marker for user's live location
const createUserLocationIcon = () => {
  const html = `
    <div style="position: relative; width: 24px; height: 24px;">
      <div style="
        position: absolute;
        inset: 0;
        background-color: rgba(59, 130, 246, 0.25);
        border-radius: 50%;
        animation: locPulse 2s ease-out infinite;
      "></div>
      <div style="
        position: absolute;
        top: 4px; left: 4px;
        width: 16px;
        height: 16px;
        background-color: #3b82f6;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(59, 130, 246, 0.6);
      "></div>
    </div>
    <style>
      @keyframes locPulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(3); opacity: 0; }
      }
    </style>
  `;

  return L.divIcon({
    html,
    className: 'user-location-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

interface MapComponentProps {
  potholes: Pothole[];
  selectedPotholeId?: string | null;
  onSelectPothole?: (pothole: Pothole) => void;
  center?: [number, number];
  zoom?: number;
  /** User's live GPS position — shown as a blue "You Are Here" dot */
  userLocation?: { latitude: number; longitude: number; accuracy: number | null } | null;
}

/**
 * Handles initial auto-fit to markers and user location.
 * Listens for manual drag/zoom interactions to freeze auto-bounds adjustments.
 */
const FitBoundsHandler: React.FC<{
  potholes: Pothole[];
  userLocation?: { latitude: number; longitude: number } | null;
  fallbackCenter: [number, number];
  fallbackZoom: number;
  hasUserInteracted: React.MutableRefObject<boolean>;
  registerRecenter: (recenterFn: () => void) => void;
  onUserInteraction: () => void;
}> = ({ potholes, userLocation, fallbackCenter, fallbackZoom, hasUserInteracted, registerRecenter, onUserInteraction }) => {
  const map = useMap();
  const initialFitDone = useRef(false);

  // Listen for user map drag / zoom gestures to pause auto re-centering
  useEffect(() => {
    const handleUserGesture = (e: any) => {
      // If movement is triggered by mouse/touch interaction (originalEvent exists) or explicit drag/zoom
      if (e?.type === 'dragstart' || e?.type === 'zoomstart' || e?.originalEvent) {
        hasUserInteracted.current = true;
        onUserInteraction();
      }
    };

    map.on('dragstart', handleUserGesture);
    map.on('zoomstart', handleUserGesture);
    map.on('movestart', handleUserGesture);

    return () => {
      map.off('dragstart', handleUserGesture);
      map.off('zoomstart', handleUserGesture);
      map.off('movestart', handleUserGesture);
    };
  }, [map, hasUserInteracted, onUserInteraction]);

  const fitToContent = useCallback((force = false) => {
    if (!force && hasUserInteracted.current) return;

    const points: L.LatLngExpression[] = potholes.map(p => [p.latitude, p.longitude]);
    if (userLocation && (userLocation.latitude !== 0 || userLocation.longitude !== 0)) {
      points.push([userLocation.latitude, userLocation.longitude]);
    }

    if (points.length === 0) {
      if (!initialFitDone.current || force) {
        map.setView(fallbackCenter, fallbackZoom);
        initialFitDone.current = true;
      }
      return;
    }

    if (points.length === 1) {
      const [lat, lng] = points[0] as [number, number];
      map.setView([lat, lng], 14, { animate: true });
    } else {
      const bounds = L.latLngBounds(points);
      if (bounds.isValid()) {
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 16,
          animate: true,
        });
      }
    }
    initialFitDone.current = true;
  }, [potholes, userLocation, fallbackCenter, fallbackZoom, map, hasUserInteracted]);

  // Register re-center callback for parent button
  useEffect(() => {
    registerRecenter(() => {
      hasUserInteracted.current = false;
      fitToContent(true);
    });
  }, [registerRecenter, fitToContent, hasUserInteracted]);

  // Initial fit execution
  useEffect(() => {
    if (!initialFitDone.current) {
      fitToContent(false);
    }
  }, [fitToContent]);

  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  potholes,
  selectedPotholeId,
  onSelectPothole,
  center = [20, 78], // Default to India center when no location data
  zoom = 5,
  userLocation,
}) => {
  const hasUserInteracted = useRef(false);
  const [showRecenterBtn, setShowRecenterBtn] = useState(false);
  const recenterFnRef = useRef<(() => void) | null>(null);

  const registerRecenter = useCallback((recenterFn: () => void) => {
    recenterFnRef.current = recenterFn;
  }, []);

  const handleUserInteraction = useCallback(() => {
    setShowRecenterBtn(true);
  }, []);

  const handleRecenterClick = () => {
    hasUserInteracted.current = false;
    setShowRecenterBtn(false);
    if (recenterFnRef.current) {
      recenterFnRef.current();
    }
  };

  const effectiveCenter: [number, number] =
    userLocation && (userLocation.latitude !== 0 || userLocation.longitude !== 0)
      ? [userLocation.latitude, userLocation.longitude]
      : center;
  const effectiveZoom = userLocation && (userLocation.latitude !== 0 || userLocation.longitude !== 0) ? 14 : zoom;

  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-800 relative">
      <MapContainer
        center={effectiveCenter}
        zoom={effectiveZoom}
        minZoom={3}
        maxZoom={19}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBoundsHandler
          potholes={potholes}
          userLocation={userLocation}
          fallbackCenter={effectiveCenter}
          fallbackZoom={effectiveZoom}
          hasUserInteracted={hasUserInteracted}
          registerRecenter={registerRecenter}
          onUserInteraction={handleUserInteraction}
        />

        {/* User's live location marker */}
        {userLocation && (userLocation.latitude !== 0 || userLocation.longitude !== 0) && (
          <>
            <Marker
              position={[userLocation.latitude, userLocation.longitude]}
              icon={createUserLocationIcon()}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="text-center p-1 text-gray-900">
                  <p className="font-bold text-sm">📍 You Are Here</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
                  </p>
                  {userLocation.accuracy && (
                    <p className="text-xs text-gray-400">
                      Accuracy: ±{Math.round(userLocation.accuracy)}m
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
            {/* Accuracy radius circle */}
            {userLocation.accuracy && userLocation.accuracy < 500 && (
              <Circle
                center={[userLocation.latitude, userLocation.longitude]}
                radius={userLocation.accuracy}
                pathOptions={{
                  color: '#3b82f6',
                  fillColor: '#3b82f6',
                  fillOpacity: 0.08,
                  weight: 1,
                }}
              />
            )}
          </>
        )}

        {/* Pothole markers */}
        {potholes.map((pothole) => (
          <Marker
            key={pothole.id}
            position={[pothole.latitude, pothole.longitude]}
            icon={createSeverityIcon(pothole.severity)}
            eventHandlers={{
              click: () => onSelectPothole && onSelectPothole(pothole),
            }}
          >
            <Popup className="custom-popup">
              <div className="p-1 max-w-xs text-gray-900">
                <img
                  src={pothole.image_url}
                  alt="Pothole"
                  className="w-full h-28 object-cover rounded-lg mb-2"
                />
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                    pothole.severity === 'Critical' ? 'bg-red-100 text-red-700' :
                    pothole.severity === 'High' ? 'bg-orange-100 text-orange-700' :
                    pothole.severity === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {pothole.severity} Severity
                  </span>
                  <span className="text-xs font-semibold text-gray-500">
                    {Math.round(pothole.confidence * 100)}% Conf
                  </span>
                </div>
                <h5 className="font-bold text-sm mt-1">{pothole.location_name}</h5>
                <p className="text-xs text-gray-500">Area: {pothole.surface_area_sq_m} m²</p>
                <p className="text-xs text-gray-400 mt-1">Status: {pothole.status}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating Re-center / Fit Bounds Control Button */}
      {showRecenterBtn && (
        <button
          onClick={handleRecenterClick}
          id="recenter-map-bounds-button"
          className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 px-4 py-2.5 rounded-xl
            bg-white/95 dark:bg-gray-900/95 backdrop-blur-md
            text-xs font-bold text-indigo-600 dark:text-indigo-400
            border border-gray-200 dark:border-gray-700
            shadow-xl hover:shadow-2xl hover:scale-105
            transition-all duration-200 cursor-pointer"
          title="Reset map view to fit all markers & live location"
        >
          <Crosshair className="w-4 h-4 text-indigo-500" />
          <span>Fit View</span>
        </button>
      )}
    </div>
  );
};

