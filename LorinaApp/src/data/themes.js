/**
 * Theme definitions for the Lorina app.
 *
 * Three palettes — each with light and dark variants.
 * Use getT(themeId, dark) to resolve a flat token object for use in styles.
 *
 * 1. Espresso — warm white base, rich coffee-brown primary (default)
 * 2. Caramel  — warm white base, golden honey/caramel primary
 * 3. Matcha   — warm white base, earthy sage-green primary
 */

export const THEMES = {
  1: {
    name: 'Espresso',
    primaryDark: '#4E2C10',
    secondary: '#C48A5A',
    accent: '#E8C9A0',
    light: {
      bg:     '#FAFAF8',   // Barely warm white — not grey, not beige
      surf:   '#F4EDE6',   // Warm linen for surface areas
      card:   '#FFFFFF',   // Pure white cards
      text:   '#1A100A',   // Deep espresso — softer than pure black
      sub:    '#7A6252',   // Warm taupe for secondary text
      border: '#EDE5DC',   // Subtle warm border
      chip:   '#F4EDE6',
      primary:   '#6B3F1F', // Rich roasted espresso brown
      secondary: '#C48A5A', // Caramel accent
    },
    dark: {
      bg:     '#110C08',
      surf:   '#1C1410',
      card:   '#261C14',
      text:   '#F5EDE4',
      sub:    '#A08870',
      border: '#382818',
      chip:   '#261C14',
      primary:   '#D4956A', // Warm caramel — readable on dark
      secondary: '#E8C9A0',
    },
  },
  2: {
    name: 'Caramel',
    primaryDark: '#A0621E',
    secondary: '#D4956A',
    accent: '#FAD5A5',
    light: {
      bg:     '#FAFAF8',
      surf:   '#FFF6EE',
      card:   '#FFFFFF',
      text:   '#1A100A',
      sub:    '#7A6252',
      border: '#FCDEBB',
      chip:   '#FFF6EE',
      primary:   '#C07028', // Honey / golden caramel
      secondary: '#D4956A',
    },
    dark: {
      bg:     '#110D06',
      surf:   '#1C1508',
      card:   '#261C0C',
      text:   '#F5EDE4',
      sub:    '#A08068',
      border: '#382810',
      chip:   '#261C0C',
      primary:   '#E8A84A',
      secondary: '#F0C880',
    },
  },
  3: {
    name: 'Matcha',
    primaryDark: '#2D5C3A',
    secondary: '#7AAF8A',
    accent: '#B8D8C4',
    light: {
      bg:     '#F8FAF8',
      surf:   '#EEF5F0',
      card:   '#FFFFFF',
      text:   '#0E1E14',
      sub:    '#527060',
      border: '#D4EAD8',
      chip:   '#EEF5F0',
      primary:   '#3D7A52', // Earthy sage-green — like matcha
      secondary: '#7AAF8A',
    },
    dark: {
      bg:     '#080F0A',
      surf:   '#101A12',
      card:   '#16241A',
      text:   '#ECF5EE',
      sub:    '#7AAF8A',
      border: '#1E3424',
      chip:   '#16241A',
      primary:   '#6BBF84',
      secondary: '#A8D8B8',
    },
  },
};

/**
 * Resolves a flat theme token object from the nested THEMES structure.
 * @param {number} themeId  - 1 (Espresso), 2 (Caramel), or 3 (Matcha)
 * @param {boolean} dark    - Whether dark mode is active
 * @returns {object}        - Flat token map used throughout the app
 */
export function getT(themeId, dark) {
  const t = THEMES[themeId];
  const mode = dark ? t.dark : t.light;
  return {
    name:         t.name,
    dark,
    primaryDark:  t.primaryDark,
    secondary:    t.secondary,
    accent:       t.accent,
    primary:      mode.primary,
    bg:           mode.bg,
    surf:         mode.surf,
    card:         mode.card,
    text:         mode.text,
    sub:          mode.sub,
    border:       mode.border,
    chip:         mode.chip,
  };
}
