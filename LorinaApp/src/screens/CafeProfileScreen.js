/**
 * CafeProfileScreen
 *
 * Full detail view for a single cafe. Receives the `cafe` object via
 * route.params from Home, Map, or Search. Sections:
 *   - Header band with name and busyness
 *   - Live seat availability bar
 *   - Amenities table (WiFi, power, study score, hours, price)
 *   - Tags + reviews preview
 *   - Check In and Write Review CTAs
 *
 * Safe area: header band paddingTop uses insets.top.
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
import { useAuth } from '../context/AuthContext';
import { BusynessChip, Stars, Avi, SeatBar, Tag } from '../components/SharedUI';
import { useReviews } from '../hooks/useReviews';
import { useSavedCafes } from '../hooks/useSavedCafes';

export default function CafeProfileScreen({ route, navigation }) {
  const { T } = useTheme();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const c = route?.params?.cafe;
  const { reviews } = useReviews(c?.id);
  const { savedIds, toggleSave } = useSavedCafes(user?.id);
  const isSaved = c ? savedIds.has(c.id) : false;

  if (!c) return null;

  const amenityRows = [
    { label: 'WiFi',          value: c.wifi  ? 'Available' : 'Not available' },
    { label: 'Power outlets', value: c.power ? 'Available' : 'Not available' },
    { label: 'Study score',   value: `${c.study_score} / 5` },
    { label: 'Opening hours', value: c.hours },
    { label: 'Price range',   value: c.price },
  ];

  function requireAuth(next) {
    if (user) {
      next();
      return;
    }
    navigation.navigate('Welcome');
  }

  return (
    <View style={[styles.flex, { backgroundColor: T.bg }]}>
      {/* ── Header band ── */}
      <View
        style={[
          styles.headerBand,
          {
            backgroundColor: T.surf,
            borderBottomColor: T.border,
            paddingTop: insets.top + 10,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.backBtn, { backgroundColor: T.card, borderColor: T.border }]}
        >
          <Text style={[styles.backBtnText, { color: T.text }]}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.headerBottom}>
          <Text style={[styles.cafeName, { color: T.text }]} numberOfLines={1}>
            {c.name}
          </Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => user ? toggleSave(c) : navigation.navigate('Welcome')}
              style={[styles.saveIconBtn, { backgroundColor: isSaved ? T.primary + '18' : T.card, borderColor: isSaved ? T.primary : T.border }]}
            >
              <Text style={[styles.saveIconText, { color: isSaved ? T.primary : T.sub }]}>
                {isSaved ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
            <BusynessChip level={c.busyness} />
          </View>
        </View>
      </View>

      {/* ── Scrollable body ── */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Rating row */}
        <View style={[styles.ratingRow, { marginBottom: 4 }]}>
          <Stars rating={c.rating} />
          <Text style={[styles.ratingValue, { color: T.text }]}>{c.rating}</Text>
          <Text style={[styles.ratingCount, { color: T.sub }]}>({c.review_count} reviews)</Text>
        </View>
        <Text style={[styles.metaLine, { color: T.sub }]}>
          {c.suburb} · {c.price} · {c.hours}
        </Text>

        {/* Known for */}
        <View style={[styles.knownForBar, { borderLeftColor: T.primary }]}>
          <Text style={[styles.knownForLabel, { color: T.sub }]}>Known for</Text>
          <Text style={[styles.knownForText, { color: T.text }]}>{c.specialty}</Text>
        </View>

        {/* Live seats */}
        <View style={[styles.infoCard, { backgroundColor: T.card, borderColor: T.border, marginBottom: 12 }]}>
          <Text style={[styles.infoCardLabel, { color: T.sub }]}>Live Seat Availability</Text>
          <SeatBar avail={c.seats_avail} total={c.seats_total} T={T} />
          <Text style={[styles.infoCardNote, { color: T.sub }]}>
            Updated 3 min ago · community sourced
          </Text>
        </View>

        {/* Amenities */}
        <View style={[styles.amenityCard, { backgroundColor: T.card, borderColor: T.border, marginBottom: 12 }]}>
          {amenityRows.map((a, i) => (
            <View
              key={a.label}
              style={[
                styles.amenityRow,
                {
                  borderBottomWidth: i < amenityRows.length - 1 ? StyleSheet.hairlineWidth : 0,
                  borderBottomColor: T.border,
                },
              ]}
            >
              <Text style={[styles.amenityKey, { color: T.sub }]}>{a.label}</Text>
              <Text style={[styles.amenityVal, { color: T.text }]}>{a.value}</Text>
            </View>
          ))}
        </View>

        {/* Tags */}
        <View style={[styles.tagsRow, { marginBottom: 16 }]}>
          {c.tags.map((t) => <Tag key={t} label={t} T={T} />)}
        </View>

        {/* Reviews section */}
        <View style={[styles.reviewsHeader, { marginBottom: 10 }]}>
          <Text style={[styles.reviewsLabel, { color: T.sub }]}>Reviews</Text>
          <TouchableOpacity onPress={() => requireAuth(() => navigation.navigate('Reviews', { cafe: c }))}>
            <Text style={[styles.seeAllText, { color: T.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>
        {reviews.slice(0, 2).map((r) => (
          <View
            key={r.id}
            style={[styles.reviewCard, { backgroundColor: T.card, borderColor: T.border }]}
          >
            <View style={styles.reviewMeta}>
              <Avi initials={r.avatar} size={30} color={T.primary} />
              <View style={styles.flex}>
                <Text style={[styles.reviewUser, { color: T.text }]}>@{r.user}</Text>
                <View style={styles.starsTime}>
                  <Stars rating={r.rating} size={10} />
                  <Text style={[styles.reviewTime, { color: T.sub }]}>{r.time}</Text>
                </View>
              </View>
            </View>
            <Text style={[styles.reviewText, { color: T.text }]}>{r.text}</Text>
          </View>
        ))}

        {/* Live Vibe Check */}
        <TouchableOpacity
          onPress={() => navigation.navigate('LiveChat', { cafe: c })}
          style={[styles.liveBtn, { backgroundColor: T.surf, borderColor: T.border }]}
        >
          <View style={styles.liveDot} />
          <Text style={[styles.liveBtnText, { color: T.text }]}>Join Live Vibe Check</Text>
          <Text style={[styles.liveBtnSub, { color: T.sub }]}>Chat · expires in 15 min</Text>
        </TouchableOpacity>

        {/* Actions */}
        <View style={[styles.actionsRow, { marginTop: 8, marginBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            onPress={() => requireAuth(() => navigation.navigate('Community'))}
            style={[styles.actionOutline, { borderColor: T.border }]}
          >
            <Text style={[styles.actionOutlineText, { color: T.text }]}>Check In</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => requireAuth(() => navigation.navigate('Reviews', { cafe: c }))}
            style={[styles.actionPrimary, { backgroundColor: T.primary }]}
          >
            <Text style={styles.actionPrimaryText}>Write Review</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  headerBand: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  backBtn: {
    alignSelf: 'flex-start',
    borderRadius: 7,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 7,
    marginBottom: 12,
  },
  backBtnText: { fontFamily: 'DMSans_500Medium', fontSize: 12 },
  headerBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  saveIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveIconText: {
    fontSize: 17,
    lineHeight: 20,
  },
  cafeName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    flex: 1,
    marginRight: 10,
    lineHeight: 28,
  },

  bodyContent: {
    padding: 18,
    paddingTop: 14,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingValue: { fontFamily: 'DMSans_700Bold', fontSize: 12 },
  ratingCount: { fontFamily: 'DMSans_400Regular', fontSize: 11 },

  metaLine: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    marginBottom: 14,
    letterSpacing: 0.1,
    marginTop: 2,
  },

  knownForBar: {
    borderLeftWidth: 2,
    paddingLeft: 12,
    marginBottom: 16,
  },
  knownForLabel: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  knownForText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
  },

  infoCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    paddingHorizontal: 16,
  },
  infoCardLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
    marginBottom: 10,
  },
  infoCardNote: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 9,
    marginTop: 6,
    letterSpacing: 0.2,
  },

  amenityCard: {
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  amenityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  amenityKey: { fontFamily: 'DMSans_400Regular', fontSize: 12 },
  amenityVal: { fontFamily: 'DMSans_600SemiBold', fontSize: 12 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewsLabel: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  seeAllText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12 },

  reviewCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 13,
    marginBottom: 8,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 8,
  },
  reviewUser: { fontFamily: 'DMSans_700Bold', fontSize: 12 },
  starsTime: { flexDirection: 'row', gap: 5, alignItems: 'center' },
  reviewTime: { fontFamily: 'DMSans_400Regular', fontSize: 10 },
  reviewText: { fontFamily: 'DMSans_400Regular', fontSize: 12, lineHeight: 19 },

  liveBtn: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 10,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E05252',
    flexShrink: 0,
  },
  liveBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    flex: 1,
  },
  liveBtnSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
  },

  actionsRow: { flexDirection: 'row', gap: 8 },
  actionOutline: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionOutlineText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12 },
  actionPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPrimaryText: { fontFamily: 'DMSans_600SemiBold', fontSize: 12, color: '#fff' },
});
