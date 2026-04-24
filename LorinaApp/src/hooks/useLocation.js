import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';

export function useLocation() {
  const [coords, setCoords] = useState(null);
  const [city, setCity] = useState(null);
  const [state, setState] = useState(null);
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

      // High accuracy forces GPS rather than network/WiFi estimation
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      if (cancelled) return;

      const { latitude: lat, longitude: lng } = pos.coords;
      setCoords({ lat, lng });

      // Reverse geocode — prefer city, fall back to subregion
      try {
        const results = await Location.reverseGeocodeAsync(
          { latitude: lat, longitude: lng },
          { useGoogleMaps: false },
        );
        const geo = results?.[0];
        if (!cancelled && geo) {
          // iOS: city = suburb/city, region = full state name e.g. "Victoria"
          // Android: city = city, region = state abbreviation or full name
          const resolvedCity = geo.city || geo.subregion || geo.district || null;
          const resolvedState = geo.region || null;
          setCity(resolvedCity);
          setState(resolvedState);
        }
      } catch (_) {
        // Geocoding failure is non-fatal — header just won't show a city name
      }

      // Watch position for map dot (GPS accuracy, battery-friendly interval)
      subRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 15000,
          distanceInterval: 30,
        },
        (newPos) => {
          if (!cancelled) {
            setCoords({
              lat: newPos.coords.latitude,
              lng: newPos.coords.longitude,
            });
          }
        },
      );
    })();

    return () => {
      cancelled = true;
      subRef.current?.remove();
    };
  }, []);

  return { coords, city, state, permitted };
}
