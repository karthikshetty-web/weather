import { useState, useCallback } from 'react';
import { reverseGeocode } from '../services/api';

export function useGeolocation() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const err = new Error('Geolocation is not supported by your browser.');
        setError(err.message);
        reject(err);
        return;
      }

      setLoading(true);
      setError(null);

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const place = await reverseGeocode(latitude, longitude);
            setLoading(false);
            resolve(place);
          } catch (err) {
            setLoading(false);
            setError('Failed to resolve city name for your location.');
            reject(err);
          }
        },
        (err) => {
          setLoading(false);
          let message = 'Location access denied or unavailable.';
          if (err.code === 1) message = 'Location permission was denied in your browser.';
          else if (err.code === 2) message = 'Position unavailable. Check your network or GPS.';
          else if (err.code === 3) message = 'Location request timed out.';
          setError(message);
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    });
  }, []);

  return { getCurrentLocation, loading, error, setError };
}
