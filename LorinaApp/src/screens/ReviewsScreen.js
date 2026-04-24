/**
 * ReviewsScreen
 *
 * Full review list for a cafe with:
 *   - Rating histogram (5-star breakdown bars)
 *   - Write review form (star picker + text area)
 *   - Study vibe badge on qualifying reviews
 *
 * Safe area: nav header paddingTop uses insets.top.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Avi, Stars } from '../components/SharedUI';
import { HeartIco } from '../components/Icons';
import { useReviews } from '../hooks/useReviews';

export default function ReviewsScreen({ route, navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const c = route?.params?.cafe;
  const { reviews } = useReviews(c?.id);
  if (!c) return null;
  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const [showForm, setShowForm] = useState(false);
  const [rat, setRat] = useState(0);
  const [txt, setTxt] = useState('');

  return (
    <View style={[styles.flex, { backgroundColor: T.bg }]}>
      {/* Nav header — safe area */}
      <View
        style={[
          styles.nav,
          { paddingTop: insets.top + 12, borderBottomColor: T.border },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: T.text }]}>←</Text>
        </TouchableOpacity>
        <View>
          <Text style={[styles.navTitle, { color: T.text }]}>{c.name}</Text>
          <Text style={[styles.navSub, { color: T.sub }]}>Reviews</Text>
        </View>
      </View>

      {/* Summary bar */}
      <View style={[styles.summaryBar, { backgroundColor: T.card, borderBottomColor: T.border }]}>
        <View style={styles.avgBlock}>
          <Text style={[styles.avgNumber, { color: T.text }]}>{avg.toFixed(1)}</Text>
          <Stars rating={avg} size={12} />
          <Text style={[styles.avgCount, { color: T.sub }]}>{reviews.length} reviews</Text>
        </View>
        <View style={styles.flex}>
          {[5, 4, 3, 2, 1].map((s) => {
            const pct = reviews.length
              ? reviews.filter((r) => r.rating === s).length / reviews.length
              : 0;
            return (
              <View key={s} style={styles.barRow}>
                <Text style={[styles.barStar, { color: T.sub }]}>{s}</Text>
                <View style={[styles.barTrack, { backgroundColor: T.border }]}>
                  <View style={[styles.barFill, { width: `${pct * 100}%`, backgroundColor: T.primary }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Write review toggle */}
        {!showForm ? (
          <TouchableOpacity
            onPress={() => setShowForm(true)}
            style={[styles.writeBtn, { borderColor: T.border }]}
          >
            <Text style={[styles.writeBtnText, { color: T.sub }]}>+ Write a review</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.form, { backgroundColor: T.card, borderColor: T.border }]}>
            <Text style={[styles.formTitle, { color: T.text }]}>Your review</Text>
            <View style={styles.starPicker}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setRat(s)}
                  style={[
                    styles.starBtn,
                    {
                      borderColor: s <= rat ? '#C0882A' : T.border,
                      backgroundColor: s <= rat ? '#C0882A14' : T.surf,
                    },
                  ]}
                >
                  <Text style={{ color: s <= rat ? '#C0882A' : T.sub, fontSize: 15 }}>★</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              value={txt}
              onChangeText={setTxt}
              placeholder="Share your experience..."
              placeholderTextColor={T.sub}
              multiline
              style={[
                styles.textArea,
                { borderColor: T.border, backgroundColor: T.surf, color: T.text },
              ]}
            />
            <View style={styles.formActions}>
              <TouchableOpacity
                onPress={() => { setShowForm(false); setRat(0); setTxt(''); }}
                style={[styles.cancelBtn, { borderColor: T.border }]}
              >
                <Text style={[styles.cancelBtnText, { color: T.sub }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { setShowForm(false); setRat(0); setTxt(''); }}
                style={[styles.postBtn, { backgroundColor: T.primary }]}
              >
                <Text style={styles.postBtnText}>Post review</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Review list */}
        {reviews.map((r) => (
          <View
            key={r.id}
            style={[styles.reviewCard, { backgroundColor: T.card, borderColor: T.border }]}
          >
            <View style={styles.reviewHeader}>
              <Avi initials={r.avatar} size={34} color={T.primary} />
              <View style={styles.flex}>
                <Text style={[styles.reviewUser, { color: T.text }]}>@{r.user}</Text>
                <View style={styles.starsTime}>
                  <Stars rating={r.rating} />
                  <Text style={[styles.reviewTime, { color: T.sub }]}>{r.time}</Text>
                </View>
              </View>
              <View style={styles.likesRow}>
                <HeartIco color={T.sub} size={12} />
                <Text style={[styles.likesText, { color: T.sub }]}>{r.likes}</Text>
              </View>
            </View>
            <Text style={[styles.reviewText, { color: T.text }]}>{r.text}</Text>
            {r.studyVibe && (
              <Text style={[styles.studyVibe, { color: T.primary }]}>Great for studying</Text>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  nav: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  backBtn: { padding: 4 },
  backArrow: { fontSize: 20, lineHeight: 24 },
  navTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16 },
  navSub: { fontFamily: 'DMSans_400Regular', fontSize: 10, letterSpacing: 0.2 },

  summaryBar: {
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexShrink: 0,
  },
  avgBlock: { alignItems: 'center', minWidth: 56 },
  avgNumber: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, lineHeight: 34 },
  avgCount: { fontFamily: 'DMSans_400Regular', fontSize: 9, marginTop: 3 },

  barRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  barStar: { fontFamily: 'DMSans_400Regular', fontSize: 9, width: 7, textAlign: 'right' },
  barTrack: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 2 },

  content: { padding: 18, paddingBottom: 30 },

  writeBtn: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  writeBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12 },

  form: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  formTitle: { fontFamily: 'DMSans_700Bold', fontSize: 12, marginBottom: 10 },
  starPicker: { flexDirection: 'row', gap: 6, marginBottom: 12 },
  starBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 12,
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    height: 76,
    textAlignVertical: 'top',
  },
  formActions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  cancelBtn: {
    flex: 1,
    height: 38,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelBtnText: { fontFamily: 'DMSans_400Regular', fontSize: 12 },
  postBtn: {
    flex: 2,
    height: 38,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: '#fff' },

  reviewCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 13,
    marginBottom: 9,
  },
  reviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 9,
  },
  reviewUser: { fontFamily: 'DMSans_700Bold', fontSize: 12 },
  starsTime: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  reviewTime: { fontFamily: 'DMSans_400Regular', fontSize: 10 },
  likesRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likesText: { fontFamily: 'DMSans_400Regular', fontSize: 10 },
  reviewText: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 20 },
  studyVibe: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    letterSpacing: 0.2,
    marginTop: 8,
  },
});
