import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Image, StyleSheet, Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';
import { useAuth } from '../context/AuthContext';
import { Stars } from '../components/SharedUI';
import { useSavedCafes } from '../hooks/useSavedCafes';
import { supabase } from '../api/supabase';

export default function ProfileScreen({ navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const { name, handle, bio, avatarUri, badges } = useProfile();
  const { signOut, user } = useAuth();
  const { savedCafes } = useSavedCafes(user?.id);

  const [checkInCount, setCheckInCount] = useState(0);
  const [reviewCount, setReviewCount]   = useState(0);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('profiles')
      .select('check_in_count, review_count')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setCheckInCount(data.check_in_count ?? 0);
          setReviewCount(data.review_count ?? 0);
        }
      });
  }, [user]);

  function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        },
      },
    ]);
  }

  const initials = name?.[0]?.toUpperCase() ?? 'U';

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
        <View style={styles.profileRow}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: T.surf, borderColor: T.border }]}>
              <Text style={[styles.avatarText, { color: T.primary }]}>{initials}</Text>
            </View>
          )}

          <View style={styles.flex}>
            <Text style={[styles.profileName, { color: T.text }]}>{name || 'Your Name'}</Text>
            <Text style={[styles.profileHandle, { color: T.sub }]}>{handle || '@handle'}</Text>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('EditProfile')}
            style={[styles.editBtn, { borderColor: T.border }]}
          >
            <Text style={[styles.editBtnText, { color: T.text }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Stats — check-ins and reviews only */}
        <View style={[styles.statsRow, { borderTopColor: T.border }]}>
          <View style={[styles.statCell, { borderRightColor: T.border, borderRightWidth: StyleSheet.hairlineWidth }]}>
            <Text style={[styles.statValue, { color: T.text }]}>{checkInCount}</Text>
            <Text style={[styles.statLabel, { color: T.sub }]}>Check-ins</Text>
          </View>
          <View style={styles.statCell}>
            <Text style={[styles.statValue, { color: T.text }]}>{reviewCount}</Text>
            <Text style={[styles.statLabel, { color: T.sub }]}>Reviews</Text>
          </View>
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
        {savedCafes.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.emptyText, { color: T.sub }]}>
              No saved cafés yet — tap the bookmark on any café to save it.
            </Text>
          </View>
        ) : (
          savedCafes.map((c) => (
            <TouchableOpacity
              key={c.id}
              onPress={() => navigation.navigate('Home', { screen: 'CafeProfile', params: { cafe: c } })}
              style={[styles.savedCard, { backgroundColor: T.card, borderColor: T.border }]}
            >
              <View style={[styles.savedAvatar, { backgroundColor: T.surf }]}>
                <Text style={[styles.savedAvatarText, { color: T.sub }]}>{c.name[0]}</Text>
              </View>
              <View style={styles.flex}>
                <Text style={[styles.savedName, { color: T.text }]}>{c.name}</Text>
                <Text style={[styles.savedSub, { color: T.sub }]}>{c.suburb}</Text>
              </View>
              <Stars rating={parseFloat(c.rating) || 0} size={11} />
            </TouchableOpacity>
          ))
        )}

        {/* Sign out */}
        <TouchableOpacity
          onPress={handleSignOut}
          style={[styles.signOutBtn, { borderColor: '#E05252' }]}
        >
          <Text style={styles.signOutText}>Sign out</Text>
        </TouchableOpacity>
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
  avatar: { width: 62, height: 62, borderRadius: 31 },
  avatarFallback: { borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24 },
  profileName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 19 },
  profileHandle: { fontFamily: 'DMSans_400Regular', fontSize: 11, marginTop: 1 },
  editBtn: { borderRadius: 7, borderWidth: 1, paddingHorizontal: 13, paddingVertical: 7 },
  editBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11 },

  statsRow: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 16,
  },
  statCell: { flex: 1, alignItems: 'center' },
  statValue: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20 },
  statLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10, marginTop: 1, letterSpacing: 0.2 },

  body: { padding: 20, paddingBottom: 40 },

  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },

  bioCard: { borderRadius: 10, borderWidth: 1, padding: 14, marginBottom: 20 },
  bioText: { fontFamily: 'DMSans_400Regular', fontSize: 13, lineHeight: 20 },

  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginBottom: 20 },
  badge: { borderRadius: 6, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 7 },
  badgeText: { fontFamily: 'DMSans_600SemiBold', fontSize: 11 },

  emptyCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
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
    width: 38, height: 38, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  savedAvatarText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 15 },
  savedName: { fontFamily: 'DMSans_600SemiBold', fontSize: 13 },
  savedSub: { fontFamily: 'DMSans_400Regular', fontSize: 10, marginTop: 1 },

  signOutBtn: {
    marginTop: 24,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#E05252' },
});
