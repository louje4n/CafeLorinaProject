import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { Stars } from '../components/SharedUI';
import { useCafes } from '../hooks/useCafes';

const STATS = [
  { label: 'Check-ins', value: '47' },
  { label: 'Reviews',   value: '23' },
  { label: 'Followers', value: '184' },
];

export default function ProfileScreen({ navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const { name, handle, bio, avatarUri, badges } = useProfile();
  const { cafes } = useCafes();

  return (
    <ScrollView
      style={[styles.flex, { backgroundColor: T.bg }]}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Header ────────────────────────────────────────────── */}
      <View style={[
        styles.header,
        { backgroundColor: T.card, borderBottomColor: T.border, paddingTop: insets.top + 16 },
      ]}>
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate('Home');
            }
          }}
          style={[styles.backBtn, { borderColor: T.border, backgroundColor: T.surf }]}
        >
          <Text style={[styles.backBtnText, { color: T.text }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.profileRow}>
          {/* Avatar */}
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: T.surf, borderColor: T.border }]}>
              <Text style={[styles.avatarText, { color: T.primary }]}>
                {name?.[0] ?? 'U'}
              </Text>
            </View>
          )}

          {/* Name + handle */}
          <View style={styles.flex}>
            <Text style={[styles.profileName, { color: T.text }]}>{name}</Text>
            <Text style={[styles.profileHandle, { color: T.sub }]}>{handle}</Text>
          </View>

          {/* Edit */}
          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={[styles.editBtn, { borderColor: T.border }]}
          >
            <Text style={[styles.editBtnText, { color: T.text }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
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

      {/* ── Body ──────────────────────────────────────────────── */}
      <View style={styles.body}>

        {/* Bio */}
        {bio ? (
          <>
            <Text style={[styles.sectionLabel, { color: T.sub }]}>Bio</Text>
            <View style={[styles.bioCard, { backgroundColor: T.card, borderColor: T.border }]}>
              <Text style={[styles.bioText, { color: T.text }]}>{bio}</Text>
            </View>
          </>
        ) : null}

        {/* Badges */}
        {badges.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { color: T.sub }]}>Badges</Text>
            <View style={styles.badgesRow}>
              {badges.map((b) => (
                <View
                  key={b.id}
                  style={[styles.badge, { backgroundColor: b.color + '14', borderColor: b.color + '30' }]}
                >
                  <Text style={[styles.badgeText, { color: b.color }]}>{b.label}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* Saved Cafés */}
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

  header: {
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
  backBtn: {
    alignSelf: 'flex-start',
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 12,
  },
  backBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
  },
  avatarFallback: {
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

  bioCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  bioText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    lineHeight: 20,
  },

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
