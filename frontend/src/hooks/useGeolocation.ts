import { useState, useEffect } from 'react';

export interface GeolocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  locationName: string;
}

/**
 * Custom hook that provides the user's live GPS position via the browser Geolocation API.
 * Falls back to a sensible default (0, 0) if geolocation is unavailable or denied.
 * Also performs a reverse-geocode lookup to provide a human-readable location name.
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: 0,
    longitude: 0,
    accuracy: null,
    loading: true,
    error: null,
    locationName: 'Fetching location...',
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Geolocation is not supported by this browser.',
        locationName: 'Location unavailable',
      }));
      return;
    }

    // Watch position for continuous updates
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Reverse geocode to get a human-readable address
        let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            { headers: { 'Accept-Language': 'en' } }
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address;
            // Build a short readable name from the address parts
            const road = addr?.road || addr?.pedestrian || addr?.neighbourhood || '';
            const area = addr?.suburb || addr?.city_district || addr?.town || addr?.city || '';
            const city = addr?.city || addr?.town || addr?.village || addr?.state || '';
            if (road && area) {
              locationName = `${road}, ${area}`;
            } else if (road && city) {
              locationName = `${road}, ${city}`;
            } else if (data.display_name) {
              // Use first 2 parts of the full display name
              const parts = data.display_name.split(',').slice(0, 2).map((s: string) => s.trim());
              locationName = parts.join(', ');
            }
          }
        } catch {
          // Keep the coordinate string as fallback
        }

        setState({
          latitude,
          longitude,
          accuracy,
          loading: false,
          error: null,
          locationName,
        });
      },
      (err) => {
        setState(prev => ({
          ...prev,
          loading: false,
          error: err.message,
          locationName: 'Location access denied',
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return state;
}
