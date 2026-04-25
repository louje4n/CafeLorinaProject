/**
 * SearchScreen
 *
 * Live search across cafe names and suburbs, with horizontal filter chips
 * (WiFi, Power Outlets, etc.) for quick filtering. Results tap through
 * to CafeProfile.
 *
 * Safe area: header paddingTop uses insets.top.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { SearchIco } from '../components/Icons';
import { BusynessChip, Stars } from '../components/SharedUI';
import { useCafes } from '../hooks/useCafes';

const FILTER_OPTS = [
  'WiFi', 'Power Outlets', 'Quiet', 'Study Friendly',
  'Open Now', 'CBD', 'Under $5', 'Under $20',
];

const CBD_SUBURBS = ['cbd', 'melbourne cbd', 'city', 'docklands', 'southbank', 'carlton', 'fitzroy'];

function isOpenNow(hours) {
  if (!hours) return true;
  const h = hours.toLowerCase();
  if (h.includes('24') || h.includes('always')) return true;
  try {
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();
    // Match patterns like "7am–9pm", "7:00am–10:00pm", "7am - 9pm"
    const match = h.match(/(\d+)(?::(\d+))?\s*(am|pm)\s*[–\-–]\s*(\d+)(?::(\d+))?\s*(am|pm)/);
    if (!match) return true;
    const toMins = (hr, min, period) => {
      let h24 = parseInt(hr, 10);
      if (period === 'pm' && h24 !== 12) h24 += 12;
      if (period === 'am' && h24 === 12) h24 = 0;
      return h24 * 60 + (parseInt(min || '0', 10));
    };
    const open  = toMins(match[1], match[2], match[3]);
    const close = toMins(match[4], match[5], match[6]);
    return currentMins >= open && currentMins < close;
  } catch {
    return true;
  }
}

const FILTER_FNS = {
  'WiFi':           (c) => c.wifi === true,
  'Power Outlets':  (c) => c.power === true,
  'Quiet':          (c) => c.busyness === 'quiet',
  'Study Friendly': (c) => (parseFloat(c.study_score) || 0) >= 4,
  'Open Now':       (c) => isOpenNow(c.hours),
  'CBD':            (c) => CBD_SUBURBS.some((s) => c.suburb?.toLowerCase().includes(s)),
  'Under $5':       (c) => c.price === '$',
  'Under $20':      (c) => c.price === '$' || c.price === '$$',
};

export default function SearchScreen({ navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const { cafes } = useCafes();
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState([]);

  const results = cafes.filter((c) => {
    const matchesQuery =
      q === '' ||
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      c.suburb.toLowerCase().includes(q.toLowerCase());

    const matchesFilters = filters.every((f) => {
      const fn = FILTER_FNS[f];
      return fn ? fn(c) : true;
    });

    return matchesQuery && matchesFilters;
  });

  function toggleFilter(f) {
    setFilters((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  }

  function goToCafe(cafe) {
    navigation.navigate('CafeProfile', { cafe });
  }

  return (
    <View style={[styles.flex, { backgroundColor: T.bg }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 14, borderBottomColor: T.border },
        ]}
      >
        <Text style={[styles.title, { color: T.text }]}>Search</Text>

        {/* Search bar */}
        <View style={[styles.searchBar, { backgroundColor: T.card, borderColor: T.border }]}>
          <SearchIco color={T.sub} />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="Cafés, suburbs..."
            placeholderTextColor={T.sub}
            style={[styles.searchInput, { color: T.text }]}
            autoCorrect={false}
          />
          {q.length > 0 && (
            <TouchableOpacity onPress={() => setQ('')}>
              <Text style={[styles.clearBtn, { color: T.sub }]}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {FILTER_OPTS.map((f) => {
            const sel = filters.includes(f);
            return (
              <TouchableOpacity
                key={f}
                onPress={() => toggleFilter(f)}
                style={[
                  styles.filterChip,
                  {
                    borderColor: sel ? T.primary : T.border,
                    backgroundColor: sel ? T.primary : T.card,
                  },
                ]}
              >
                <Text style={[styles.filterChipText, { color: sel ? '#fff' : T.sub }]}>
                  {f}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Results */}
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.resultsCount, { color: T.sub }]}>
          {results.length} {results.length === 1 ? 'result' : 'results'}
        </Text>

        {results.map((c) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => goToCafe(c)}
            activeOpacity={0.85}
            style={[styles.resultCard, { backgroundColor: T.card, borderColor: T.border }]}
          >
            {/* Avatar / initial */}
            <View style={[styles.resultAvatar, { backgroundColor: T.surf }]}>
              <Text style={[styles.resultAvatarText, { color: T.sub }]}>{c.name[0]}</Text>
            </View>

            {/* Info */}
            <View style={styles.flex}>
              <View style={styles.resultRow}>
                <Text style={[styles.resultName, { color: T.text }]} numberOfLines={1}>
                  {c.name}
                </Text>
                <BusynessChip level={c.busyness} mini />
              </View>
              <Text style={[styles.resultMeta, { color: T.sub }]}>
                {c.suburb} · {c.price}
              </Text>
              <View style={styles.starsRow}>
                <Stars rating={c.rating} size={10} />
                <Text style={[styles.ratingText, { color: T.sub }]}>{c.rating}</Text>
              </View>
            </View>
          </TouchableOpacity>
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
    marginBottom: 12,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    gap: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    padding: 0,
  },
  clearBtn: { fontSize: 16 },

  // Filters
  filtersContent: {
    gap: 6,
    paddingBottom: 2,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  filterChipText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 11,
  },

  // Results
  resultsList: {
    padding: 20,
    paddingBottom: 30,
  },
  resultsCount: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  resultCard: {
    borderRadius: 10,
    borderWidth: 1,
    padding: 13,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  resultAvatar: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  resultAvatarText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  resultName: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  resultMeta: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    marginTop: 2,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  ratingText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
  },
});
