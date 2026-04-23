/**
 * Theme definitions for the Lorina app.
 *
 * Three palettes — Oat, Parchment, Dusk — each with light and dark variants.
 * Use getT(themeId, dark) to resolve a flat token object for use in styles.
 */

export const THEMES = {
  1: {
    name: 'Oat',
    primary: '#7C5230',
    primaryDark: '#5E3C22',
    secondary: '#B48C6C',
    accent: '#D4BEA4',
    bg: { light: '#F6F2ED', dark: '#130D08' },
    surf: { light: '#EDE8E1', dark: '#1E160F' },
    card: { light: '#FFFFFF', dark: '#271D14' },
    text: { light: '#1A120A', dark: '#EDE8E1' },
    sub: { light: '#7A6A5C', dark: '#A09080' },
    border: { light: '#DDD5CB', dark: '#362818' },
    chip: { light: '#EDE8E1', dark: '#271D14' },
  },
  2: {
    name: 'Parchment',
    primary: '#6B5040',
    primaryDark: '#503C30',
    secondary: '#A89080',
    accent: '#CCC0B4',
    bg: { light: '#F4F0EC', dark: '#110E0A' },
    surf: { light: '#EAE6E0', dark: '#1C1610' },
    card: { light: '#FFFFFF', dark: '#241C14' },
    text: { light: '#18100A', dark: '#EAE6E0' },
    sub: { light: '#72645A', dark: '#988880' },
    border: { light: '#D8D0C8', dark: '#302418' },
    chip: { light: '#EAE6E0', dark: '#241C14' },
  },
  3: {
    name: 'Dusk',
    primary: '#5C4434',
    primaryDark: '#3E2E22',
    secondary: '#9C8070',
    accent: '#BEB0A4',
    bg: { light: '#F0EBE5', dark: '#0E0A07' },
    surf: { light: '#E6E0D8', dark: '#181209' },
    card: { light: '#FFFFFF', dark: '#211810' },
    text: { light: '#160E08', dark: '#E6E0D8' },
    sub: { light: '#6A5C50', dark: '#908070' },
    border: { light: '#D0C8BF', dark: '#2A1E14' },
    chip: { light: '#E6E0D8', dark: '#211810' },
  },
};

/**
 * Resolves a flat theme token object from the nested THEMES structure.
 * @param {number} themeId  - 1 (Oat), 2 (Parchment), or 3 (Dusk)
 * @param {boolean} dark    - Whether dark mode is active
 * @returns {object}        - Flat token map used throughout the app
 */
export function getT(themeId, dark) {
  const t = THEMES[themeId];
  return {
    primary: t.primary,
    primaryDark: t.primaryDark,
    secondary: t.secondary,
    accent: t.accent,
    bg: dark ? t.bg.dark : t.bg.light,
    surf: dark ? t.surf.dark : t.surf.light,
    card: dark ? t.card.dark : t.card.light,
    text: dark ? t.text.dark : t.text.light,
    sub: dark ? t.sub.dark : t.sub.light,
    border: dark ? t.border.dark : t.border.light,
    chip: dark ? t.chip.dark : t.chip.light,
    name: t.name,
    dark,
  };
}
