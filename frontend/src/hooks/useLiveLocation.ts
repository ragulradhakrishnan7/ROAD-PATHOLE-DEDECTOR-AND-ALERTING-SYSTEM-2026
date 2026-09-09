import { useState, useCallback, useRef, useEffect } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unknown';
export type TrackingStatus = 'idle' | 'active' | 'paused' | 'error';
export type LocationErrorCode =
  | 'PERMISSION_DENIED'
  | 'POSITION_UNAVAILABLE'
  | 'TIMEOUT'
  | 'NOT_SUPPORTED'
  | 'UNKNOWN';

export interface LocationPoint {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  timestamp: number;
}

export interface LiveLocationState {
  /** Current position */
  latitude: number;
  longitude: number;
  accuracy: number | null;
  speed: number | null;
  heading: number | null;
  /** Human-readable address */
  locationName: string;
  /** Permission state from the browser */
  permission: PermissionState;
  /** Current tracking status */
  status: TrackingStatus;
  /** Whether GPS is being actively watched */
  isTracking: boolean;
  /** Error information */
  error: { code: LocationErrorCode; message: string } | null;
  /** Trail of recent positions */
  history: LocationPoint[];
  /** Elapsed tracking time in seconds */
  elapsedSeconds: number;
}

interface UseLiveLocationOptions {
  /** Max number of history points to keep (default: 50) */
  maxHistory?: number;
  /** Enable high accuracy GPS (default: true) */
  highAccuracy?: boolean;
  /** GPS timeout in ms (default: 20000) */
  timeout?: number;
  /** Max age of cached position in ms (default: 5000) */
  maximumAge?: number;
  /** Minimum interval between reverse-geocode lookups in ms (default: 10000) */
  geocodeThrottleMs?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function mapGeolocationError(err: GeolocationPositionError): {
  code: LocationErrorCode;
  message: string;
} {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return {
        code: 'PERMISSION_DENIED',
        message:
          'Location permission was denied. Please enable location access in your browser settings.',
      };
    case err.POSITION_UNAVAILABLE:
      return {
        code: 'POSITION_UNAVAILABLE',
        message:
          'Your device could not determine its position. Ensure GPS/location services are enabled.',
      };
    case err.TIMEOUT:
      return {
        code: 'TIMEOUT',
        message:
          'Location request timed out. Move to an area with better GPS signal and try again.',
      };
    default:
      return {
        code: 'UNKNOWN',
        message: err.message || 'An unknown location error occurred.',
      };
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLiveLocation(options: UseLiveLocationOptions = {}) {
  const {
    maxHistory = 50,
    highAccuracy = true,
    timeout = 20000,
    maximumAge = 5000,
    geocodeThrottleMs = 10000,
  } = options;

  const [state, setState] = useState<LiveLocationState>({
    latitude: 0,
    longitude: 0,
    accuracy: null,
    speed: null,
    heading: null,
    locationName: '',
    permission: 'unknown',
    status: 'idle',
    isTracking: false,
    error: null,
    history: [],
    elapsedSeconds: 0,
  });

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const lastGeocodeRef = useRef<number>(0);

  // ── Check permission state on mount ──────────────────────────────────────

  useEffect(() => {
    async function checkPermission() {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({
            name: 'geolocation' as PermissionName,
          });
          setState((prev) => ({ ...prev, permission: result.state as PermissionState }));

          // Listen for permission changes (e.g. user revokes in browser settings)
          result.addEventListener('change', () => {
            setState((prev) => ({
              ...prev,
              permission: result.state as PermissionState,
            }));

            // If permission is revoked while tracking, stop gracefully
            if (result.state === 'denied' && watchIdRef.current !== null) {
              stopTracking();
              setState((prev) => ({
                ...prev,
                status: 'error',
                error: {
                  code: 'PERMISSION_DENIED',
                  message:
                    'Location permission was revoked. Please re-enable in browser settings.',
                },
              }));
            }
          });
        }
      } catch {
        // Permissions API not supported — we'll know once watchPosition is called
        setState((prev) => ({ ...prev, permission: 'unknown' }));
      }
    }

    checkPermission();

    // Cleanup on unmount
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Reverse geocoding (throttled) ────────────────────────────────────────

  const reverseGeocode = useCallback(
    async (lat: number, lng: number) => {
      const now = Date.now();
      if (now - lastGeocodeRef.current < geocodeThrottleMs) return;
      lastGeocodeRef.current = now;

      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
          { headers: { 'Accept-Language': 'en' } }
        );
        if (!res.ok) return;
        const data = await res.json();
        const addr = data.address;
        const road =
          addr?.road || addr?.pedestrian || addr?.neighbourhood || '';
        const area =
          addr?.suburb || addr?.city_district || addr?.town || addr?.city || '';
        const city =
          addr?.city || addr?.town || addr?.village || addr?.state || '';

        let name = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
        if (road && area) {
          name = `${road}, ${area}`;
        } else if (road && city) {
          name = `${road}, ${city}`;
        } else if (data.display_name) {
          const parts = data.display_name
            .split(',')
            .slice(0, 2)
            .map((s: string) => s.trim());
          name = parts.join(', ');
        }

        setState((prev) => ({ ...prev, locationName: name }));
      } catch {
        // Silently fail — keep the previous name or the coord string
      }
    },
    [geocodeThrottleMs]
  );

  // ── Start tracking ──────────────────────────────────────────────────────

  const startTracking = useCallback(() => {
    // Check browser support
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        status: 'error',
        error: {
          code: 'NOT_SUPPORTED',
          message:
            'Geolocation is not supported by your browser. Please use a modern browser.',
        },
      }));
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState((prev) => ({
      ...prev,
      status: 'active',
      isTracking: true,
      error: null,
      elapsedSeconds: 0,
    }));

    // Start elapsed-time counter
    startTimeRef.current = Date.now();
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const elapsed = Math.floor(
          (Date.now() - startTimeRef.current) / 1000
        );
        setState((prev) => ({ ...prev, elapsedSeconds: elapsed }));
      }
    }, 1000);

    // Start watching
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy, speed, heading } =
          position.coords;

        const point: LocationPoint = {
          latitude,
          longitude,
          accuracy,
          speed,
          heading,
          timestamp: position.timestamp,
        };

        setState((prev) => {
          const newHistory = [...prev.history, point].slice(-maxHistory);
          return {
            ...prev,
            latitude,
            longitude,
            accuracy,
            speed: speed ?? null,
            heading: heading ?? null,
            permission: 'granted',
            status: 'active',
            isTracking: true,
            error: null,
            history: newHistory,
          };
        });

        // Kick off reverse geocode (throttled internally)
        reverseGeocode(latitude, longitude);
      },
      (err) => {
        const mapped = mapGeolocationError(err);

        setState((prev) => ({
          ...prev,
          status: 'error',
          isTracking: false,
          error: mapped,
          permission:
            err.code === err.PERMISSION_DENIED ? 'denied' : prev.permission,
        }));

        // Clean up on error
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      },
      {
        enableHighAccuracy: highAccuracy,
        timeout,
        maximumAge,
      }
    );
  }, [highAccuracy, timeout, maximumAge, maxHistory, reverseGeocode]);

  // ── Stop tracking ───────────────────────────────────────────────────────

  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = null;

    setState((prev) => ({
      ...prev,
      status: 'idle',
      isTracking: false,
    }));
  }, []);

  // ── Clear history ───────────────────────────────────────────────────────

  const clearHistory = useCallback(() => {
    setState((prev) => ({ ...prev, history: [] }));
  }, []);

  return {
    ...state,
    startTracking,
    stopTracking,
    clearHistory,
  };
}
