import { useState, useEffect, useCallback, useRef } from 'react';

export interface GeolocationState {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  locationName: string;
  permission: 'granted' | 'denied' | 'prompt' | 'unsupported' | 'fallback';
  requestLocation: () => void;
}

const DEFAULT_FALLBACK = {
  latitude: 13.0827,
  longitude: 80.2707,
  locationName: 'Chennai, Tamil Nadu (Default)',
};

/**
 * Custom hook that provides the user's live GPS position via the browser Geolocation API.
 * Auto-initiates location request on mount and provides IP-based location fallback
 * if browser permissions are denied or running in non-HTTPS/VS Code environments.
 */
export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    latitude: DEFAULT_FALLBACK.latitude,
    longitude: DEFAULT_FALLBACK.longitude,
    accuracy: null,
    loading: true,
    error: null,
    locationName: 'Acquiring GPS location...',
    permission: 'prompt',
    requestLocation: () => undefined,
  });

  const isMountedRef = useRef(true);

  const resolveLocationName = useCallback(async (latitude: number, longitude: number) => {
    let locationName = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );

      if (res.ok) {
        const data = await res.json();
        const addr = data.address;
        const road = addr?.road || addr?.pedestrian || addr?.neighbourhood || '';
        const area = addr?.suburb || addr?.city_district || addr?.town || addr?.city || '';
        const city = addr?.city || addr?.town || addr?.village || addr?.state || '';

        if (road && area) {
          locationName = `${road}, ${area}`;
        } else if (road && city) {
          locationName = `${road}, ${city}`;
        } else if (data.display_name) {
          const parts = data.display_name.split(',').slice(0, 2).map((s: string) => s.trim());
          locationName = parts.join(', ');
        }
      }
    } catch {
      // Keep coordinate string as fallback
    }

    return locationName;
  }, []);

  const tryIPFallback = useCallback(async (reasonMessage: string) => {
    try {
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        if (data.latitude && data.longitude && isMountedRef.current) {
          const city = data.city || data.region || 'Current Region';
          const country = data.country_name || '';
          const name = country ? `${city}, ${country}` : city;
          setState(prev => ({
            ...prev,
            latitude: data.latitude,
            longitude: data.longitude,
            accuracy: 5000,
            loading: false,
            error: null,
            locationName: `${name} (IP GPS)`,
            permission: 'fallback',
          }));
          return;
        }
      }
    } catch {
      // Ignore IP fetch failure
    }

    if (isMountedRef.current) {
      setState(prev => ({
        ...prev,
        latitude: DEFAULT_FALLBACK.latitude,
        longitude: DEFAULT_FALLBACK.longitude,
        accuracy: null,
        loading: false,
        error: reasonMessage,
        locationName: DEFAULT_FALLBACK.locationName,
        permission: 'fallback',
      }));
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      tryIPFallback('Geolocation unsupported by browser');
      return;
    }

    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      locationName: 'Acquiring GPS location...',
    }));

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (!isMountedRef.current) return;
        const { latitude, longitude, accuracy } = position.coords;
        const locationName = await resolveLocationName(latitude, longitude);

        if (isMountedRef.current) {
          setState({
            latitude,
            longitude,
            accuracy,
            loading: false,
            error: null,
            locationName,
            permission: 'granted',
            requestLocation,
          });
        }
      },
      (err) => {
        if (!isMountedRef.current) return;
        tryIPFallback(`GPS unavailable: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  }, [resolveLocationName, tryIPFallback]);

  useEffect(() => {
    isMountedRef.current = true;
    setState(prev => ({ ...prev, requestLocation }));
    requestLocation();

    return () => {
      isMountedRef.current = false;
    };
  }, [requestLocation]);

  return { ...state, requestLocation };
}

