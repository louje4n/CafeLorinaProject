/**
 * Icons — all custom SVG icons used in the app.
 *
 * Uses react-native-svg primitives only. No external icon library.
 *
 * Exports:
 *   Navigation: LorinaLogo, HomeIco, MapIco, CommIco, SearchIco, ProfileIco
 *   Inline:     HeartIco, ThumbsUpIco
 */
import React from 'react';
import Svg, {
  Path,
  Rect,
  Text as SvgText,
  Circle,
  Line,
  Polyline,
  Polygon,
} from 'react-native-svg';

// ─── Lorina Logo ─────────────────────────────────────────────────
export function LorinaLogo({ size = 32, color = '#7C5230' }) {
  return (
    <Svg width={size} height={size * 1.1} viewBox="0 0 40 44" fill="none">
      <Path d="M15 7 Q16.5 3.5 15 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M20 6 Q21.5 2.5 20 0" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Path d="M25 7 Q26.5 3.5 25 1" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <Rect x="7" y="7" width="26" height="5" rx="2.5" fill={color} />
      <Rect x="16.5" y="4.5" width="7" height="3.5" rx="1.75" fill={color} />
      <Path d="M9.5 12 L30.5 12 L27.5 40 L12.5 40 Z" fill={color} />
      <Path d="M11.5 22 L28.5 22 L27 32 L13 32 Z" fill="rgba(0,0,0,0.1)" />
      <SvgText
        x="20"
        y="35"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fill="white"
        fontFamily="Georgia, serif"
      >
        L
      </SvgText>
    </Svg>
  );
}

// ─── Bottom Nav Icons ─────────────────────────────────────────────

export function HomeIco({ active, color }) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill={active ? color : 'none'}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      <Polyline points="9,22 9,12 15,12 15,22" />
    </Svg>
  );
}

export function MapIco({ color }) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Polygon points="1,6 1,22 8,18 16,22 23,18 23,2 16,6 8,2 1,6" />
      <Line x1="8" y1="2" x2="8" y2="18" />
      <Line x1="16" y1="6" x2="16" y2="22" />
    </Svg>
  );
}

export function CommIco({ active, color }) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill={active ? color : 'none'}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </Svg>
  );
}

export function SearchIco({ color }) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <Circle cx="11" cy="11" r="8" />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Svg>
  );
}

export function ProfileIco({ active, color }) {
  return (
    <Svg
      width={22}
      height={22}
      viewBox="0 0 24 24"
      fill={active ? color : 'none'}
      stroke={color}
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <Circle cx="12" cy="7" r="4" />
    </Svg>
  );
}

// ─── Inline utility icons ─────────────────────────────────────────

export function HeartIco({ color, size = 12 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
    </Svg>
  );
}

export function ThumbsUpIco({ color, size = 12 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <Path d="M14 9V5a3 3 0 00-3-3l-4 9v11h11.28a2 2 0 002-1.7l1.38-9a2 2 0 00-2-2.3H14z" />
      <Path d="M7 22H4a2 2 0 01-2-2v-7a2 2 0 012-2h3" />
    </Svg>
  );
}
