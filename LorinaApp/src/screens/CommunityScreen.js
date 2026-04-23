/**
 * CommunityScreen
 *
 * Two sections:
 *   1. Report card — pick a cafe and its current busyness level to submit
 *      a live community update (with a 2.5s success confirmation)
 *   2. Feed — recent busyness posts from other users
 *
 * Safe area: header paddingTop uses insets.top.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Avi, BusynessChip } from '../components/SharedUI';
import { ThumbsUpIco } from '../components/Icons';
import { CAFES, COMMUNITY_POSTS } from '../data/cafes';

const BUSYNESS_OPTS = [
  { key: 'quiet',    label: 'Quiet',    sub: 'Plenty of seats', col: '#10B981' },
  { key: 'moderate', label: 'Moderate', sub: 'Getting busy',    col: '#F59E0B' },
  { key: 'busy',     label: 'Busy',     sub: 'Almost full',     col: '#EF4444' },
];

export default function CommunityScreen() {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const [selCafe, setSelCafe] = useState(null);
  const [busyness, setBusyness] = useState(null);
  const [posted, setPosted] = useState(false);

  function handlePost() {
    if (selCafe && busyness) {
      setPosted(true);
      setTimeout(() => {
        setPosted(false);
        setBusyness(null);
        setSelCafe(null);
      }, 2500);
    }
  }

  return (
    <View style={[styles.flex, { backgroundColor: T.bg }]}>
      {/* Header — insets.top replaces hardcoded top padding */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 14, borderBottomColor: T.border },
        ]}
      >
        <Text style={[styles.title, { color: T.text }]}>Live Updates</Text>
        <Text style={[styles.subtitle, { color: T.sub }]}>
          Community-sourced café status
        </Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Report card ── */}
        <View style={[styles.reportCard, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.sectionLabel, { color: T.sub }]}>Report a café</Text>

          {/* Café selector */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.cafeScroll}
            contentContainerStyle={styles.cafeScrollContent}
          >
            {CAFES.map((c) => {
              const isSel = selCafe?.id === c.id;
              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setSelCafe(isSel ? null : c)}
                  style={[
                    styles.cafePill,
                    {
                      borderColor: isSel ? T.primary : T.border,
                      backgroundColor: isSel ? T.primary : T.surf,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cafePillText,
                      {
                        color: isSel ? '#fff' : T.text,
                        fontFamily: isSel ? 'DMSans_600SemiBold' : 'DMSans_400Regular',
                      },
                    ]}
                  >
                    {c.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Busyness selector */}
          <View style={styles.busynessGrid}>
            {BUSYNESS_OPTS.map((opt) => {
              const isSel = busyness === opt.key;
              return (
                <TouchableOpacity
                  key={opt.key}
                  onPress={() => setBusyness(isSel ? null : opt.key)}
                  style={[
                    styles.busynessOption,
                    {
                      borderColor: isSel ? opt.col : T.border,
                      backgroundColor: isSel ? opt.col + '14' : T.surf,
                    },
                  ]}
                >
                  <View style={styles.busynessOptionHeader}>
                    <View style={[styles.busynessDot, { backgroundColor: opt.col }]} />
                    <Text
                      style={[
                        styles.busynessLabel,
                        { color: isSel ? opt.col : T.text },
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </View>
                  <Text style={[styles.busynessSub, { color: T.sub }]}>{opt.sub}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Submit */}
          {posted ? (
            <View style={[styles.postedBanner, { backgroundColor: T.surf }]}>
              <Text style={[styles.postedText, { color: T.primary }]}>
                Update shared — thank you 🙌
              </Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={handlePost}
              style={[
                styles.shareBtn,
                {
                  backgroundColor: selCafe && busyness ? T.primary : T.border,
                  opacity: selCafe && busyness ? 1 : 0.5,
                },
              ]}
              activeOpacity={0.8}
            >
              <Text style={styles.shareBtnText}>Share update</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* ── Feed ── */}
        <Text style={[styles.feedLabel, { color: T.sub }]}>Recent</Text>
        {COMMUNITY_POSTS.map((p) => (
          <View
            key={p.id}
            style={[styles.postCard, { backgroundColor: T.card, borderColor: T.border }]}
          >
            <View style={styles.postHeader}>
              <Avi initials={p.avatar} size={32} color={T.primary} />
              <View style={styles.flex}>
                <Text style={[styles.postUser, { color: T.text }]}>@{p.user}</Text>
                <Text style={[styles.postMeta, { color: T.sub }]}>
                  at {p.cafeName} · {p.time}
                </Text>
              </View>
              <BusynessChip level={p.busyness} mini />
            </View>
            <Text style={[styles.postText, { color: T.text }]}>{p.text}</Text>
            <View style={styles.postActions}>
              <TouchableOpacity style={styles.actionBtn}>
                <ThumbsUpIco color={T.sub} size={12} />
                <Text style={[styles.actionText, { color: T.sub }]}>
                  Helpful · {p.likes}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity>
                <Text style={[styles.actionText, { color: T.sub }]}>Reply</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  header: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 21,
  },
  subtitle: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.2,
  },

  content: {
    padding: 18,
    paddingBottom: 30,
  },

  // Report card
  reportCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    marginBottom: 16,
  },
  sectionLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  cafeScroll: { marginBottom: 12 },
  cafeScrollContent: { gap: 6, paddingBottom: 2 },
  cafePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  cafePillText: {
    fontSize: 11,
  },

  // Busyness grid
  busynessGrid: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 12,
  },
  busynessOption: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  busynessOptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 3,
  },
  busynessDot: { width: 7, height: 7, borderRadius: 3.5 },
  busynessLabel: { fontFamily: 'DMSans_700Bold', fontSize: 11 },
  busynessSub: { fontFamily: 'DMSans_400Regular', fontSize: 9, textAlign: 'center' },

  // Submit
  shareBtn: {
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: '#fff' },
  postedBanner: {
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  postedText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12 },

  // Feed
  feedLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  postCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 12,
    paddingHorizontal: 14,
    marginBottom: 9,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 9,
  },
  postUser: { fontFamily: 'DMSans_700Bold', fontSize: 12 },
  postMeta: { fontFamily: 'DMSans_400Regular', fontSize: 10 },
  postText: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 19 },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginTop: 10,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontFamily: 'DMSans_400Regular', fontSize: 11 },
});
