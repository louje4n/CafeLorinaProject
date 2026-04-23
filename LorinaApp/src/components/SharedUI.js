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
  quiet:    { label: 'Quiet',    dot: '#4A9E6A' },
  moderate: { label: 'Moderate', dot: '#C0882A' },
  busy:     { label: 'Busy',     dot: '#B84848' },
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
            fill={i <= Math.round(rating) ? '#C0882A' : '#E0D8CE'}
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

// ─── SeatBar ─────────────────────────────────────────────────────
export function SeatBar({ avail, total, T }) {
  const pct = total > 0 ? avail / total : 0;
  const col = pct > 0.5 ? '#4A9E6A' : pct > 0.2 ? '#C0882A' : '#B84848';
  return (
    <View>
      <View style={[styles.seatTrack, { backgroundColor: T.border }]}>
        <View
          style={[
            styles.seatFill,
            { width: `${pct * 100}%`, backgroundColor: col },
          ]}
        />
      </View>
      <Text style={[styles.seatLabel, { color: T.sub }]}>
        {avail} of {total} seats available
      </Text>
    </View>
  );
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

  // SeatBar
  seatTrack: {
    height: 3,
    borderRadius: 2,
    overflow: 'hidden',
  },
  seatFill: {
    height: '100%',
    borderRadius: 2,
  },
  seatLabel: {
    fontSize: 10,
    fontFamily: 'DMSans_400Regular',
    marginTop: 4,
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
