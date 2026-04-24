import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Image, StyleSheet, Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useProfile } from '../context/ProfileContext';

const ALL_BADGES = [
  { id: '1', label: 'Study Regular', color: '#6B3F1F' },
  { id: '2', label: 'Matcha Fan',    color: '#4A9E6A' },
  { id: '3', label: 'Early Riser',   color: '#C0882A' },
  { id: '4', label: 'Café Hopper',   color: '#5A7FA0' },
  { id: '5', label: 'Night Owl',     color: '#7B5EA7' },
  { id: '6', label: 'First In',      color: '#D4695A' },
];

export default function EditProfileScreen({ navigation }) {
  const { T, dark, toggleDark } = useTheme();
  const insets = useSafeAreaInsets();
  const profile = useProfile();

  const [name, setName]     = useState(profile.name);
  const [handle, setHandle] = useState(profile.handle);
  const [bio, setBio]       = useState(profile.bio);
  const [avatarUri, setAvatarUri] = useState(profile.avatarUri);
  const [badges, setBadges] = useState(profile.badges.map(b => b.id));

  async function pickImage() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo access to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  }

  function toggleBadge(id) {
    setBadges(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  }

  function save() {
    profile.setName(name.trim() || profile.name);
    profile.setHandle(handle.trim() || profile.handle);
    profile.setBio(bio.trim());
    profile.setAvatarUri(avatarUri);
    profile.setBadges(ALL_BADGES.filter(b => badges.includes(b.id)));
    navigation.goBack();
  }

  const initials = name?.trim()?.[0]?.toUpperCase() ?? 'U';

  return (
    <View style={[styles.flex, { backgroundColor: T.bg }]}>
      {/* ── Nav bar ─────────────────────────────────────────── */}
      <View style={[styles.nav, { paddingTop: insets.top + 12, borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: T.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.navTitle, { color: T.text }]}>Edit Profile</Text>
        <TouchableOpacity
          onPress={save}
          style={[styles.saveBtn, { backgroundColor: T.primary }]}
        >
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 30 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Profile picture ─────────────────────────────── */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={pickImage} activeOpacity={0.8}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarFallback, { backgroundColor: T.surf, borderColor: T.border }]}>
                <Text style={[styles.avatarText, { color: T.primary }]}>{initials}</Text>
              </View>
            )}
            <View style={[styles.avatarEditBadge, { backgroundColor: T.primary }]}>
              <Text style={styles.avatarEditIcon}>✎</Text>
            </View>
          </TouchableOpacity>
          <Text style={[styles.avatarHint, { color: T.sub }]}>Tap to change photo</Text>
        </View>

        {/* ── Name ────────────────────────────────────────── */}
        <Text style={[styles.fieldLabel, { color: T.sub }]}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          style={[styles.input, { borderColor: T.border, backgroundColor: T.card, color: T.text }]}
          placeholderTextColor={T.sub}
          placeholder="Your name"
        />

        {/* ── Handle ──────────────────────────────────────── */}
        <Text style={[styles.fieldLabel, { color: T.sub }]}>Handle / University</Text>
        <TextInput
          value={handle}
          onChangeText={setHandle}
          style={[styles.input, { borderColor: T.border, backgroundColor: T.card, color: T.text }]}
          placeholderTextColor={T.sub}
          placeholder="@handle · University"
          autoCapitalize="none"
        />

        {/* ── Bio ─────────────────────────────────────────── */}
        <Text style={[styles.fieldLabel, { color: T.sub }]}>Bio</Text>
        <TextInput
          value={bio}
          onChangeText={setBio}
          style={[styles.input, styles.bioInput, { borderColor: T.border, backgroundColor: T.card, color: T.text }]}
          placeholderTextColor={T.sub}
          placeholder="Tell the community about yourself..."
          multiline
          maxLength={160}
          textAlignVertical="top"
        />
        <Text style={[styles.charCount, { color: T.sub }]}>{bio.length}/160</Text>

        {/* ── Badges ──────────────────────────────────────── */}
        <Text style={[styles.fieldLabel, { color: T.sub }]}>Badges</Text>
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.cardHint, { color: T.sub }]}>Tap to toggle</Text>
          <View style={styles.badgesGrid}>
            {ALL_BADGES.map((b) => {
              const active = badges.includes(b.id);
              return (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => toggleBadge(b.id)}
                  style={[
                    styles.badge,
                    {
                      backgroundColor: active ? b.color + '18' : T.surf,
                      borderColor:     active ? b.color + '50' : T.border,
                    },
                  ]}
                >
                  <Text style={[styles.badgeText, { color: active ? b.color : T.sub }]}>
                    {b.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Appearance ──────────────────────────────────── */}
        <Text style={[styles.fieldLabel, { color: T.sub }]}>Appearance</Text>
        <View style={[styles.card, { backgroundColor: T.card, borderColor: T.border }]}>
          <View style={styles.appearanceRow}>
            <TouchableOpacity
              onPress={() => { if (dark) toggleDark(); }}
              style={[
                styles.appearanceBtn,
                {
                  backgroundColor: !dark ? T.primary : T.surf,
                  borderColor:     !dark ? T.primary : T.border,
                },
              ]}
            >
              <Text style={[styles.appearanceBtnText, { color: !dark ? '#fff' : T.sub }]}>
                Light
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { if (!dark) toggleDark(); }}
              style={[
                styles.appearanceBtn,
                {
                  backgroundColor: dark ? T.primary : T.surf,
                  borderColor:     dark ? T.primary : T.border,
                },
              ]}
            >
              <Text style={[styles.appearanceBtnText, { color: dark ? '#fff' : T.sub }]}>
                Dark
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backBtn: { padding: 4, minWidth: 40 },
  backArrow: { fontSize: 20, lineHeight: 24 },
  navTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
  },
  saveBtn: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: '#fff',
  },

  content: {
    padding: 20,
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarFallback: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 32,
  },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEditIcon: { color: '#fff', fontSize: 13 },
  avatarHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    marginTop: 8,
  },

  fieldLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    marginBottom: 18,
  },
  bioInput: {
    height: 90,
    marginBottom: 4,
  },
  charCount: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 18,
  },

  card: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 20,
  },
  cardHint: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    marginBottom: 10,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  badge: {
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  badgeText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },

  appearanceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  appearanceBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appearanceBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
  },
});
