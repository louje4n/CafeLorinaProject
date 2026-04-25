import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getT } from '../data/themes';

const STORAGE_KEY = '@lorina_theme';

// ─── Theme Context ────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(1);   // 1=Minimal, 2=Azure, 3=Sage
  const [dark, setDark] = useState(false);
  const [ready, setReady] = useState(false);

  // Load persisted preference on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val) {
          try {
            const { themeId: tid, dark: d } = JSON.parse(val);
            if (tid) setThemeId(tid);
            if (typeof d === 'boolean') setDark(d);
          } catch (_) { /* corrupted — ignore */ }
        }
      })
      .finally(() => setReady(true));
  }, []);

  // Persist whenever either value changes (skip the initial unready render)
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ themeId, dark }));
  }, [themeId, dark, ready]);

  const T = getT(themeId, dark);

  const toggleDark  = () => setDark((d) => !d);
  const cycleTheme  = () => setThemeId((id) => (id % 3) + 1);
  const selectTheme = (id) => setThemeId(id);

  return (
    <ThemeContext.Provider value={{ T, themeId, dark, toggleDark, cycleTheme, selectTheme, ready }}>
      {children}
    </ThemeContext.Provider>
  );
}

/** Convenience hook — throws if used outside ThemeProvider */
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
