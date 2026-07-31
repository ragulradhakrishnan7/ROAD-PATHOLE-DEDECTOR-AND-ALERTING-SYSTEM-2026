import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Pothole } from '../types';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

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

interface MapComponentProps {
  potholes: Pothole[];
  selectedPotholeId?: string | null;
  onSelectPothole?: (pothole: Pothole) => void;
  center?: [number, number];
  zoom?: number;
}

const MapRecenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({
  potholes,
  selectedPotholeId,
  onSelectPothole,
  center = [37.7749, -122.4194],
  zoom = 13
}) => {
  return (
    <div className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-800 relative">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '400px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter center={center} zoom={zoom} />

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
    </div>
  );
};
