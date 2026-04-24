/**
 * ProfileScreen
 *
 * Shows user stats, badges, and saved cafes.
 * Includes a live theme switcher (Oat / Parchment / Dusk / Dark mode)
 * that updates the whole app instantly via ThemeContext.
 *
 * Safe area: profile header paddingTop uses insets.top.
 */
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Stars } from '../components/SharedUI';
import { THEMES } from '../data/themes';
import { useCafes } from '../hooks/useCafes';

const STATS = [
  { label: 'Check-ins', value: '47' },
  { label: 'Reviews',   value: '23' },
  { label: 'Followers', value: '184' },
];

export default function ProfileScreen() {
  const { T, themeId, dark, toggleDark, selectTheme } = useTheme();
  const insets = useSafeAreaInsets();
  const { cafes } = useCafes();

  const badges = [
    { label: 'Study Regular', color: T.primary },
    { label: 'Matcha Fan',    color: '#4A9E6A' },
    { label: 'Early Riser',  color: '#C0882A' },
    { label: 'Café Hopper',  color: T.secondary },
  ];

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: T.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Profile header card ── */}
      <View
        style={[
          styles.profileHeader,
          {
            backgroundColor: T.card,
            borderBottomColor: T.border,
            paddingTop: insets.top + 16,
          },
        ]}
      >
        <View style={styles.profileRow}>
          {/* Avatar */}
          <View
            style={[
              styles.avatar,
              { backgroundColor: T.surf, borderColor: T.border },
            ]}
          >
            <Text style={[styles.avatarText, { color: T.primary }]}>S</Text>
          </View>
          {/* Name / handle */}
          <View style={styles.flex}>
            <Text style={[styles.profileName, { color: T.text }]}>Sofia R.</Text>
            <Text style={[styles.profileHandle, { color: T.sub }]}>
              @sofiaR · UTS Sydney
            </Text>
          </View>
          {/* Edit button */}
          <TouchableOpacity
            style={[styles.editBtn, { borderColor: T.border }]}
          >
            <Text style={[styles.editBtnText, { color: T.text }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Stats row */}
        <View style={[styles.statsRow, { borderTopColor: T.border }]}>
          {STATS.map((s, i) => (
            <View
              key={s.label}
              style={[
                styles.statCell,
                { borderRightColor: T.border, borderRightWidth: i < 2 ? StyleSheet.hairlineWidth : 0 },
              ]}
            >
              <Text style={[styles.statValue, { color: T.text }]}>{s.value}</Text>
              <Text style={[styles.statLabel, { color: T.sub }]}>{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* ── Body ── */}
      <View style={styles.body}>

        {/* ── Theme switcher ── */}
        <Text style={[styles.sectionLabel, { color: T.sub }]}>Appearance</Text>
        <View style={[styles.themeCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={styles.themeRow}>
            {[1, 2, 3].map((id) => {
              const t = THEMES[id];
              const sel = themeId === id && !dark;
              return (
                <TouchableOpacity
                  key={id}
                  onPress={() => { selectTheme(id); if (dark) toggleDark(); }}
                  style={[
                    styles.themePill,
                    {
                      borderColor: sel ? T.primary : T.border,
                      backgroundColor: sel ? T.primary + '20' : T.surf,
                    },
                  ]}
                >
                  <View style={[styles.themeColorDot, { backgroundColor: t.primary }]} />
                  <Text style={[styles.themeName, { color: sel ? T.primary : T.sub }]}>{t.name}</Text>
                </TouchableOpacity>
              );
            })}
            <TouchableOpacity
              onPress={toggleDark}
              style={[
                styles.themePill,
                {
                  borderColor: dark ? T.primary : T.border,
                  backgroundColor: dark ? T.primary + '20' : T.surf,
                },
              ]}
            >
              <Text style={{ fontSize: 12 }}>🌙</Text>
              <Text style={[styles.themeName, { color: dark ? T.primary : T.sub }]}>Dark</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Badges ── */}
        <Text style={[styles.sectionLabel, { color: T.sub }]}>Badges</Text>
        <View style={styles.badgesRow}>
          {badges.map((b) => (
            <View
              key={b.label}
              style={[
                styles.badge,
                { backgroundColor: b.color + '14', borderColor: b.color + '28' },
              ]}
            >
              <Text style={[styles.badgeText, { color: b.color }]}>{b.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Saved Cafés ── */}
        <Text style={[styles.sectionLabel, { color: T.sub }]}>Saved Cafés</Text>
        {cafes.slice(0, 3).map((c) => (
          <View
            key={c.id}
            style={[styles.savedCard, { backgroundColor: T.card, borderColor: T.border }]}
          >
            <View style={[styles.savedAvatar, { backgroundColor: T.surf }]}>
              <Text style={[styles.savedAvatarText, { color: T.sub }]}>{c.name[0]}</Text>
            </View>
            <View style={styles.flex}>
              <Text style={[styles.savedName, { color: T.text }]}>{c.name}</Text>
              <Text style={[styles.savedSub, { color: T.sub }]}>{c.suburb}</Text>
            </View>
            <Stars rating={c.rating} size={11} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  profileHeader: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
  },
  profileName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 19,
  },
  profileHandle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    marginTop: 1,
  },
  editBtn: {
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 7,
  },
  editBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },

  statsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
  },
  statLabel: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    marginTop: 1,
    letterSpacing: 0.2,
  },

  body: {
    padding: 20,
    paddingBottom: 40,
  },

  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },

  // Theme switcher
  themeCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 7,
    flexWrap: 'wrap',
  },
  themePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  themeColorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  themeName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },

  // Badges
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginBottom: 20,
  },
  badge: {
    borderRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  badgeText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },

  // Saved cafés
  savedCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 11,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  savedAvatar: {
    width: 38,
    height: 38,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  savedAvatarText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
  },
  savedName: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
  savedSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    marginTop: 1,
  },
});
