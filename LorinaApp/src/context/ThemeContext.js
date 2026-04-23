import React, { createContext, useContext, useState } from 'react';
import { getT } from '../data/themes';

// ─── Theme Context ────────────────────────────────────────────────
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [themeId, setThemeId] = useState(1);   // 1=Minimal, 2=Azure, 3=Sage
  const [dark, setDark] = useState(false);

  const T = getT(themeId, dark);

  const toggleDark = () => setDark((d) => !d);
  const cycleTheme = () => setThemeId((id) => (id % 3) + 1);
  const selectTheme = (id) => setThemeId(id);

  return (
    <ThemeContext.Provider value={{ T, themeId, dark, toggleDark, cycleTheme, selectTheme }}>
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
