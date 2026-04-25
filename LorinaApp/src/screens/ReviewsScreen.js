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
import React, { useState, useEffect, useCallback } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { Avi, Stars } from '../components/SharedUI';
import { HeartIco } from '../components/Icons';
import { useReviews } from '../hooks/useReviews';
import { supabase } from '../api/supabase';

export default function ReviewsScreen({ route, navigation }) {
  const { T } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const c = route?.params?.cafe;
  const { reviews, submitReview } = useReviews(c?.id);

  const [showForm, setShowForm] = useState(false);
  const [rat, setRat] = useState(0);
  const [txt, setTxt] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');

  // Likes state
  const [likedIds, setLikedIds] = useState(new Set());
  const [likeCounts, setLikeCounts] = useState({});

  // Load liked IDs and like counts for this cafe's reviews
  useEffect(() => {
    if (!c?.id) return;
    // Load counts for all reviews
    supabase
      .from('review_likes')
      .select('review_id')
      .in('review_id', reviews.map((r) => r.id))
      .then(({ data }) => {
        if (!data) return;
        const counts = {};
        data.forEach(({ review_id }) => {
          counts[review_id] = (counts[review_id] || 0) + 1;
        });
        setLikeCounts(counts);
      });
    // Load which ones this user liked
    if (!user) return;
    supabase
      .from('review_likes')
      .select('review_id')
      .eq('user_id', user.id)
      .in('review_id', reviews.map((r) => r.id))
      .then(({ data }) => {
        if (data) setLikedIds(new Set(data.map((row) => row.review_id)));
      });
  }, [c?.id, user, reviews]);

  const toggleLike = useCallback(async (reviewId) => {
    if (!user) { navigation.navigate('Welcome'); return; }
    const isLiked = likedIds.has(reviewId);

    // Optimistic update
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (isLiked) next.delete(reviewId); else next.add(reviewId);
      return next;
    });
    setLikeCounts((prev) => ({
      ...prev,
      [reviewId]: Math.max(0, (prev[reviewId] || 0) + (isLiked ? -1 : 1)),
    }));

    if (isLiked) {
      await supabase.from('review_likes').delete()
        .eq('review_id', reviewId).eq('user_id', user.id);
    } else {
      await supabase.from('review_likes').insert({ review_id: reviewId, user_id: user.id });
    }
  }, [user, likedIds, navigation]);

  if (!c) return null;

  if (!user) {
    return (
      <View style={[styles.flex, { backgroundColor: T.bg, paddingTop: insets.top + 20, paddingHorizontal: 22 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={[styles.backArrow, { color: T.text }]}>←</Text>
        </TouchableOpacity>
        <View style={[styles.lockCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.lockTitle, { color: T.text }]}>Sign in to view reviews</Text>
          <Text style={[styles.lockSub, { color: T.sub }]}>
            Create an account to see community reviews and post your own cafe experiences.
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Welcome')} style={[styles.lockBtn, { backgroundColor: T.primary }]}>
            <Text style={styles.lockBtnText}>Continue to sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  async function handlePost() {
    if (rat === 0 || !txt.trim() || posting) return;
    setPosting(true);
    setPostError('');
    try {
      await submitReview({ cafeId: c.id, userId: user.id, rating: rat, text: txt.trim() });
      setShowForm(false);
      setRat(0);
      setTxt('');
    } catch (e) {
      setPostError('Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  }

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
            {postError ? (
              <Text style={{ color: '#E05252', fontFamily: 'DMSans_400Regular', fontSize: 11, marginTop: 6 }}>
                {postError}
              </Text>
            ) : null}
            <View style={styles.formActions}>
              <TouchableOpacity
                onPress={() => { setShowForm(false); setRat(0); setTxt(''); setPostError(''); }}
                style={[styles.cancelBtn, { borderColor: T.border }]}
              >
                <Text style={[styles.cancelBtnText, { color: T.sub }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePost}
                disabled={rat === 0 || !txt.trim() || posting}
                style={[styles.postBtn, { backgroundColor: rat > 0 && txt.trim() ? T.primary : T.surf }]}
              >
                <Text style={[styles.postBtnText, { color: rat > 0 && txt.trim() ? '#fff' : T.sub }]}>
                  {posting ? 'Posting...' : 'Post review'}
                </Text>
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
              <TouchableOpacity
                onPress={() => toggleLike(r.id)}
                style={styles.likesRow}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <HeartIco
                  color={likedIds.has(r.id) ? '#E05252' : T.sub}
                  size={12}
                  filled={likedIds.has(r.id)}
                />
                <Text style={[styles.likesText, { color: likedIds.has(r.id) ? '#E05252' : T.sub }]}>
                  {likeCounts[r.id] ?? r.likes ?? 0}
                </Text>
              </TouchableOpacity>
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
  lockCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  lockTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 21,
    marginBottom: 6,
  },
  lockSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  lockBtn: {
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockBtnText: {
    color: '#fff',
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
  },
});
