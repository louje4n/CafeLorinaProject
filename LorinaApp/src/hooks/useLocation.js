import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [coords, setCoords] = useState(null);   // { lat, lng }
  const [city, setCity] = useState(null);        // e.g. "Melbourne"
  const [state, setState] = useState(null);      // e.g. "VIC"
  const [permitted, setPermitted] = useState(null);
  const subRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      if (status !== 'granted') {
        setPermitted(false);
        return;
      }
      setPermitted(true);

      // Initial position
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (cancelled) return;
      const { latitude: lat, longitude: lng } = pos.coords;
      setCoords({ lat, lng });

      // Reverse geocode once for city name
      const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
      if (!cancelled && geo) {
        setCity(geo.city || geo.subregion || geo.region || null);
        setState(geo.region || geo.isoCountryCode || null);
      }

      // Watch for movement
      subRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 10000,
          distanceInterval: 20,
        },
        (newPos) => {
          if (!cancelled) {
            setCoords({
              lat: newPos.coords.latitude,
              lng: newPos.coords.longitude,
            });
          }
        }
      );
    })();

    return () => {
      cancelled = true;
      subRef.current?.remove();
    };
  }, []);

  return { coords, city, state, permitted };
}
