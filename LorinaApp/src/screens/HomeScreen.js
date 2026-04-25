/**
 * HomeScreen
 *
 * Two views toggled by the Nearby / Trending tab:
 *   - Nearby: scrollable list of all cafes with seat availability
 *   - Trending: full-screen swipe card for one cafe at a time
 *
 * Safe area: paddingTop uses insets.top so the header clears the
 * Dynamic Island / notch on every device.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { LorinaLogo } from '../components/Icons';
import { BusynessChip, Stars, SeatBar } from '../components/SharedUI';
import { useCafes } from '../hooks/useCafes';
import { useLocation } from '../hooks/useLocation';

export default function HomeScreen({ navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState('nearby');
  const [popIdx, setPopIdx] = useState(0);
  const { cafes, loading, error } = useCafes();
  const { city, state: locState } = useLocation();

  if (error) {
    return (
      <View style={[styles.flex, { backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center', padding: 30 }]}>
        <Text style={{ fontFamily: 'DMSans_600SemiBold', fontSize: 14, color: T.text, textAlign: 'center' }}>
          Could not load cafés
        </Text>
        <Text style={{ fontFamily: 'DMSans_400Regular', fontSize: 12, color: T.sub, textAlign: 'center', marginTop: 6 }}>
          Check your connection and try again.
        </Text>
      </View>
    );
  }

  function goToCafe(cafe) {
    navigation.navigate('CafeProfile', { cafe });
  }

  // ─── Trending (card swipe) view ───────────────────────────────
  if (tab === 'trending') {
    if (loading || cafes.length === 0) {
      return (
        <View style={[styles.flex, { backgroundColor: T.bg, alignItems: 'center', justifyContent: 'center' }]}>
          <ActivityIndicator color={T.primary} />
        </View>
      );
    }
    const cafe = cafes[popIdx % cafes.length];
    return (
      <View style={[styles.flex, { backgroundColor: T.bg }]}>
        {/* Muted gradient wash */}
        <View
          style={[
            StyleSheet.absoluteFillObject,
            { backgroundColor: T.surf, opacity: 0.6 },
          ]}
        />

        {/* Top tabs — safe area aware */}
        <View
          style={[
            styles.trendingHeader,
            { paddingTop: insets.top + 12 },
          ]}
        >
          <View style={styles.tabRow}>
            {[['nearby', 'Nearby'], ['trending', 'Trending']].map(([k, l]) => (
              <TouchableOpacity
                key={k}
                onPress={() => setTab(k)}
                style={[
                  styles.tabPill,
                  { backgroundColor: tab === k ? T.primary : 'transparent' },
                ]}
              >
                <Text
                  style={[
                    styles.tabPillText,
                    { color: tab === k ? '#fff' : T.sub },
                  ]}
                >
                  {l}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <LorinaLogo size={28} color={T.primary} />
        </View>

        {/* Trending card */}
        <View style={styles.trendingCardWrap}>
          {/* Image placeholder */}
          <View style={[styles.trendingImagePlaceholder, { backgroundColor: T.surf, borderColor: T.border }]}>
            <Text style={[styles.placeholderText, { color: T.sub }]}>CAFÉ IMAGE</Text>
          </View>

          <View
            style={[
              styles.trendingCardBody,
              { backgroundColor: T.card, borderColor: T.border },
            ]}
          >
            <View style={styles.cardRow}>
              <View style={styles.flex}>
                <Text style={[styles.cafeNameLg, { color: T.text }]}>{cafe.name}</Text>
                <Text style={[styles.cafeMeta, { color: T.sub }]}>
                  {cafe.suburb} · {cafe.price}
                </Text>
              </View>
              <BusynessChip level={cafe.busyness} />
            </View>

            <View style={[styles.starsRow, { marginBottom: 12 }]}>
              <Stars rating={cafe.rating} size={11} />
              <Text style={[styles.ratingText, { color: T.sub }]}>
                {cafe.rating} ({cafe.review_count})
              </Text>
            </View>

            <SeatBar avail={cafe.seats_avail} total={cafe.seats_total} T={T} />

            <View style={[styles.btnRow, { marginTop: 14 }]}>
              <TouchableOpacity
                onPress={() => setPopIdx((i) => i + 1)}
                style={[styles.btnOutline, { borderColor: T.border }]}
              >
                <Text style={[styles.btnOutlineText, { color: T.text }]}>Next</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => goToCafe(cafe)}
                style={[styles.btnPrimary, { backgroundColor: T.primary }]}
              >
                <Text style={styles.btnPrimaryText}>View Café</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={[styles.paginationText, { color: T.sub }]}>
            {(popIdx % cafes.length) + 1} / {cafes.length}
          </Text>
        </View>
      </View>
    );
  }

  // ─── Nearby (list) view ───────────────────────────────────────
  return (
    <View style={[styles.flex, { backgroundColor: T.bg }]}>
      {/* Header — insets.top replaces hardcoded 70px */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12, borderBottomColor: 'transparent' },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, { color: T.text }]}>
            {city ? `${city}${locState ? `, ${locState}` : ''}` : 'Cafés near you'}
          </Text>
          {city && <Text style={[styles.headerSub, { color: T.sub }]}>Cafés near you</Text>}
        </View>
        <LorinaLogo size={30} color={T.primary} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabsContainer, { borderBottomColor: T.border }]}>
        {[['nearby', 'Nearby'], ['trending', 'Trending']].map(([k, l]) => (
          <TouchableOpacity
            key={k}
            onPress={() => setTab(k)}
            style={[
              styles.tabUnderline,
              { borderBottomColor: tab === k ? T.primary : 'transparent' },
            ]}
          >
            <Text
              style={[
                styles.tabUnderlineText,
                {
                  color: tab === k ? T.text : T.sub,
                  fontFamily: tab === k ? 'DMSans_700Bold' : 'DMSans_400Regular',
                },
              ]}
            >
              {l}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Café list */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <ActivityIndicator color={T.primary} style={{ marginTop: 40 }} />
        ) : cafes.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => goToCafe(c)}
            activeOpacity={0.85}
            style={[
              styles.cafeCard,
              {
                backgroundColor: T.card,
                borderColor: T.border,
                shadowColor: T.dark ? '#000' : '#00000010',
              },
            ]}
          >
            {/* Color accent strip */}
            <View
              style={[
                styles.cafeCardStrip,
                { backgroundColor: c.bg, borderBottomColor: T.border },
              ]}
            >
              <Text style={[styles.cafeCardStripText, { color: T.sub }]}>
                {c.name}
              </Text>
            </View>

            {/* Card body */}
            <View style={styles.cafeCardBody}>
              <View style={styles.cafeCardRow}>
                <Text
                  style={[styles.cafeCardName, { color: T.text }]}
                  numberOfLines={1}
                >
                  {c.name}
                </Text>
                <BusynessChip level={c.busyness} mini />
              </View>

              <View style={[styles.cafeCardRow, { marginBottom: 8 }]}>
                <Text style={[styles.cafeCardMeta, { color: T.sub }]}>
                  {c.suburb} · {c.price}
                </Text>
                <View style={styles.starsRow}>
                  <Stars rating={c.rating} size={10} />
                  <Text style={[styles.ratingBold, { color: T.text }]}>{c.rating}</Text>
                </View>
              </View>

              <SeatBar avail={c.seats_avail} total={c.seats_total} T={T} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // ─── Trending layout
  trendingHeader: {
    paddingHorizontal: 20,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  tabRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 6,
  },
  tabPillText: {
    fontSize: 12,
    fontFamily: 'DMSans_600SemiBold',
  },
  trendingCardWrap: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  trendingImagePlaceholder: {
    height: 180,
    borderRadius: 14,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderWidth: 1,
    borderBottomWidth: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trendingCardBody: {
    borderRadius: 14,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    padding: 16,
    borderWidth: 1,
    borderTopWidth: 0,
  },

  // ─── Nearby header
  header: {
    paddingHorizontal: 20,
    paddingBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    flexShrink: 0,
  },
  headerLeft: { flex: 1 },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.2,
  },

  // ─── Tabs (underline style)
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  tabUnderline: {
    marginRight: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
  },
  tabUnderlineText: {
    fontSize: 13,
  },

  // ─── Café list
  listContent: {
    padding: 20,
    paddingBottom: 20,
  },
  cafeCard: {
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cafeCardStrip: {
    height: 60,
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cafeCardStripText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  cafeCardBody: {
    padding: 12,
    paddingHorizontal: 14,
    paddingBottom: 13,
  },
  cafeCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cafeCardName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  cafeCardMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    flex: 1,
  },

  // ─── Shared inline
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  cafeNameLg: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
  },
  cafeMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
  },
  ratingBold: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  btnOutline: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnOutlineText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
  },
  btnPrimary: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimaryText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 12,
    color: '#fff',
  },
  placeholderText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  paginationText: {
    textAlign: 'center',
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    letterSpacing: 0.3,
    marginTop: 10,
  },
});
