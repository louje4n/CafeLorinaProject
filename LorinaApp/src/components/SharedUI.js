/**
 * Shared UI components used across all screens.
 *
 * Exports: BusynessChip, Stars, Avi, SeatBar, Tag
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';

// ─── BusynessChip ─────────────────────────────────────────────────
const BUSYNESS_MAP = {
  quiet:    { label: 'Quiet',    dot: '#10B981' },
  moderate: { label: 'Moderate', dot: '#F59E0B' },
  busy:     { label: 'Busy',     dot: '#EF4444' },
};

export function BusynessChip({ level, mini = false }) {
  const m = BUSYNESS_MAP[level] || BUSYNESS_MAP.quiet;
  return (
    <View style={styles.busynessRow}>
      <View style={[styles.busynessDot, { backgroundColor: m.dot }]} />
      {!mini && (
        <Text style={[styles.busynessLabel, { color: m.dot }]}>{m.label}</Text>
      )}
    </View>
  );
}

// ─── Stars ───────────────────────────────────────────────────────
export function Stars({ rating, size = 12 }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Svg key={i} width={size} height={size} viewBox="0 0 12 12">
          <Path
            d="M6 1l1.5 3 3.3.5-2.4 2.3.6 3.3L6 8.8l-3 1.3.6-3.3L1.2 4.5 4.5 4z"
            fill={i <= Math.round(rating) ? '#F59E0B' : '#E5E7EB'}
          />
        </Svg>
      ))}
    </View>
  );
}

// ─── Avatar / Avi ────────────────────────────────────────────────
export function Avi({ initials, size = 36, color = '#7C5230' }) {
  return (
    <View
      style={[
        styles.avi,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color + '18',
          borderColor: color + '30',
        },
      ]}
    >
      <Text style={[styles.aviText, { fontSize: size * 0.32, color }]}>{initials}</Text>
    </View>
  );
}

// ─── BusynessBar ─────────────────────────────────────────────────
// Replaces SeatBar — shows busyness level as 3 community-sourced segments
const BUSYNESS_LEVELS = [
  { key: 'quiet',    label: 'Quiet',    col: '#10B981', desc: 'Plenty of space' },
  { key: 'moderate', label: 'Moderate', col: '#F59E0B', desc: 'Getting busier' },
  { key: 'busy',     label: 'Busy',     col: '#EF4444', desc: 'Almost full' },
];

export function BusynessBar({ level, T }) {
  const active = BUSYNESS_LEVELS.find((l) => l.key === level) || BUSYNESS_LEVELS[0];
  return (
    <View>
      <View style={styles.busynessBarRow}>
        {BUSYNESS_LEVELS.map((l) => {
          const isActive = l.key === level;
          return (
            <View
              key={l.key}
              style={[
                styles.busynessSegment,
                {
                  backgroundColor: isActive ? l.col : T.border,
                  opacity: isActive ? 1 : 0.35,
                },
              ]}
            />
          );
        })}
      </View>
      <Text style={[styles.busynessBarLabel, { color: active.col }]}>
        {active.label} · {active.desc}
      </Text>
    </View>
  );
}

// Keep SeatBar exported so old imports don't crash — points to BusynessBar
export function SeatBar({ T, level }) {
  return <BusynessBar level={level} T={T} />;
}

// ─── Tag ─────────────────────────────────────────────────────────
export function Tag({ label, T }) {
  return (
    <View style={[styles.tag, { backgroundColor: T.chip }]}>
      <Text style={[styles.tagText, { color: T.sub }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // BusynessChip
  busynessRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 0,
  },
  busynessDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  busynessLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 0.1,
  },

  // Stars
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

  // Avi
  avi: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  aviText: {
    fontFamily: 'DMSans_700Bold',
    letterSpacing: -0.3,
  },

  // BusynessBar
  busynessBarRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 7,
  },
  busynessSegment: {
    flex: 1,
    height: 5,
    borderRadius: 3,
  },
  busynessBarLabel: {
    fontSize: 11,
    fontFamily: 'DMSans_600SemiBold',
    letterSpacing: 0.1,
  },

  // Tag
  tag: {
    borderRadius: 4,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    fontFamily: 'DMSans_500Medium',
    letterSpacing: 0.2,
  },
});
