import { useState, useCallback } from 'react';
import type { GeoLocation } from '../types';

interface GeolocationState {
  location: GeoLocation | null;
  error: string | null;
  loading: boolean;
  hasLocation: boolean;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
    hasLocation: false,
  });

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const getLocation = useCallback((): Promise<GeoLocation> => {
    return new Promise((resolve) => {
      setState({ location: null, error: null, loading: true, hasLocation: false });

      if (!navigator.geolocation) {
        const fallback: GeoLocation = { latitude: 0, longitude: 0 };
        setState({ location: fallback, error: 'location-unsupported', loading: false, hasLocation: false });
        resolve(fallback);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: GeoLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setState({ location: loc, error: null, loading: false, hasLocation: true });
          resolve(loc);
        },
        (err) => {
          const fallback: GeoLocation = { latitude: 0, longitude: 0 };
          const code = err.code === 1 ? 'location-denied' : err.code === 2 ? 'location-unavailable' : 'location-timeout';
          setState({ location: fallback, error: code, loading: false, hasLocation: false });
          resolve(fallback);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  return { ...state, getLocation, clearError };
}
