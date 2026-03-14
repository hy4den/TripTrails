import { useState, useEffect, useRef, useCallback } from 'react';

export default function useGeolocation(options = {}) {
  const {
    enableHighAccuracy = true,
    maximumAge = 10000,
    timeout = 15000,
  } = options;

  const [position, setPosition] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const [isWatching, setIsWatching] = useState(false);
  const watchIdRef = useRef(null);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Tarayiciniz konum servislerini desteklemiyor.');
      return;
    }

    setError(null);
    setIsWatching(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setAccuracy(pos.coords.accuracy);
        setError(null);
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('Konum izni reddedildi. Lutfen tarayici ayarlarindan izin verin.');
            break;
          case err.POSITION_UNAVAILABLE:
            setError('Konum bilgisi alinamiyor.');
            break;
          case err.TIMEOUT:
            setError('Konum istegi zaman asimina ugradi.');
            break;
          default:
            setError('Konum alinamadi.');
        }
      },
      { enableHighAccuracy, maximumAge, timeout }
    );
  }, [enableHighAccuracy, maximumAge, timeout]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsWatching(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { position, accuracy, error, isWatching, startWatching, stopWatching };
}
