/**
 * MapScreen — real map tiles via react-native-maps
 *
 * Uses Apple Maps (iOS) / Google Maps (Android) with:
 *  - Live user location blue dot (showsUserLocation)
 *  - Tappable custom cafe pins
 *  - Toggleable busyness heatmap circles
 *  - Bottom sheet preview → CafeProfile
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Dimensions,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { BusynessChip, BusynessBar } from '../components/SharedUI';
import { useCafes } from '../hooks/useCafes';
import { useLocation } from '../hooks/useLocation';

const { width: SW } = Dimensions.get('window');

// Melbourne CBD centre
const INITIAL_REGION = {
  latitude: -37.8099,
  longitude: 144.9625,
  latitudeDelta: 0.012,
  longitudeDelta: 0.012,
};

function busynessColor(level) {
  if (level === 'quiet')    return '#10B981';
  if (level === 'moderate') return '#F59E0B';
  return '#EF4444';
}

function heatFill(level) {
  if (level === 'quiet')    return 'rgba(16,185,129,0.18)';
  if (level === 'moderate') return 'rgba(245,158,11,0.18)';
  return 'rgba(239,68,68,0.18)';
}

// Custom pin rendered inside <Marker>
function CafePin({ level, selected }) {
  const col = busynessColor(level);
  return (
    <View style={[
      styles.pinOuter,
      { borderColor: col, backgroundColor: selected ? col : '#fff' },
      selected && styles.pinOuterSel,
    ]}>
      <View style={[styles.pinDot, { backgroundColor: selected ? '#fff' : col }]} />
      <View style={[styles.pinTail, { borderTopColor: col }]} />
    </View>
  );
}

export default function MapScreen({ navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const { cafes } = useCafes();
  const { coords } = useLocation();
  const mapRef = useRef(null);
  const [heatmap, setHeatmap] = useState(true);
  const [sel, setSel] = useState(null);
  const centeredRef = useRef(false);

  // Once we get GPS coords, animate the map to the user's real location (once only)
  useEffect(() => {
    if (!coords || centeredRef.current) return;
    centeredRef.current = true;
    mapRef.current?.animateToRegion(
      {
        latitude: coords.lat,
        longitude: coords.lng,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      },
      800,
    );
  }, [coords]);

  function handleMarkerPress(cafe) {
    setSel(prev => prev?.id === cafe.id ? null : cafe);
  }

  function recenter() {
    const region = coords
      ? { latitude: coords.lat, longitude: coords.lng, latitudeDelta: 0.012, longitudeDelta: 0.012 }
      : INITIAL_REGION;
    mapRef.current?.animateToRegion(region, 600);
  }

  const validCafes = cafes.filter(c => c.lat && c.lng);

  return (
    <View style={styles.container}>
      {/* ── Map ─────────────────────────────────────────────────── */}
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={INITIAL_REGION}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
        onPress={() => setSel(null)}
      >
        {/* Heatmap circles */}
        {heatmap && validCafes.map(c => (
          <Circle
            key={c.id + '_h'}
            center={{ latitude: c.lat, longitude: c.lng }}
            radius={130}
            fillColor={heatFill(c.busyness)}
            strokeWidth={0}
          />
        ))}

        {/* Cafe pins */}
        {validCafes.map(c => {
          const isSel = sel?.id === c.id;
          return (
            <Marker
              key={c.id}
              coordinate={{ latitude: c.lat, longitude: c.lng }}
              onPress={(e) => { e.stopPropagation(); handleMarkerPress(c); }}
              tracksViewChanges={isSel}
              anchor={{ x: 0.5, y: 1 }}
            >
              <CafePin level={c.busyness} selected={isSel} />
            </Marker>
          );
        })}
      </MapView>

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <View style={[styles.pill, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.pillTitle, { color: T.text }]}>Melbourne CBD</Text>
        </View>

        <View style={styles.topRight}>
          {/* Recenter */}
          <TouchableOpacity
            onPress={recenter}
            style={[styles.iconBtn, { backgroundColor: T.card, borderColor: T.border }]}
          >
            <Text style={styles.iconBtnText}>◎</Text>
          </TouchableOpacity>

          {/* Heatmap toggle */}
          <TouchableOpacity
            onPress={() => setHeatmap(h => !h)}
            style={[
              styles.heatBtn,
              {
                backgroundColor: heatmap ? T.primary : T.card,
                borderColor:     heatmap ? T.primary : T.border,
              },
            ]}
          >
            <Text style={[styles.heatBtnText, { color: heatmap ? '#fff' : T.text }]}>
              Heatmap {heatmap ? 'On' : 'Off'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Legend ──────────────────────────────────────────────── */}
      {heatmap && (
        <View style={[
          styles.legend,
          { top: insets.top + 62, backgroundColor: T.card, borderColor: T.border },
        ]}>
          {[['Quiet', '#10B981'], ['Moderate', '#F59E0B'], ['Busy', '#EF4444']].map(([l, col]) => (
            <View key={l} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: col }]} />
              <Text style={[styles.legendLabel, { color: T.text }]}>{l}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Bottom sheet ────────────────────────────────────────── */}
      {sel && (
        <View style={[
          styles.sheet,
          { backgroundColor: T.card, borderColor: T.border, paddingBottom: insets.bottom + 20 },
        ]}>
          <View style={[styles.handle, { backgroundColor: T.border }]} />

          <View style={styles.sheetHeader}>
            <View style={styles.flex}>
              <Text style={[styles.sheetName, { color: T.text }]}>{sel.name}</Text>
              <Text style={[styles.sheetSub, { color: T.sub }]}>
                {sel.suburb} · {sel.price} · {sel.hours}
              </Text>
            </View>
            <BusynessChip level={sel.busyness} />
          </View>

          <BusynessBar level={sel.busyness} T={T} />

          <View style={[styles.btnRow, { marginTop: 14 }]}>
            <TouchableOpacity
              onPress={() => navigation.navigate('CafeProfile', { cafe: sel })}
              style={[styles.viewBtn, { backgroundColor: T.primary }]}
            >
              <Text style={styles.viewBtnText}>View Café</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setSel(null)}
              style={[styles.closeBtn, { borderColor: T.border, backgroundColor: T.surf }]}
            >
              <Text style={[styles.closeBtnText, { color: T.sub }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  // ── Custom pin
  pinOuter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pinOuterSel: { width: 36, height: 36, borderRadius: 18 },
  pinDot: { width: 9, height: 9, borderRadius: 4.5 },
  pinTail: {
    position: 'absolute',
    bottom: -8,
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  // ── Top bar
  topBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  pill: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pillTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconBtnText: { fontSize: 18 },
  heatBtn: {
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  heatBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },

  // ── Legend
  legend: {
    position: 'absolute',
    right: 14,
    borderRadius: 10,
    padding: 10,
    paddingHorizontal: 13,
    borderWidth: 1,
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 4,
  },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontFamily: 'DMSans_400Regular', fontSize: 11 },

  // ── Bottom sheet
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 30,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sheetName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 19,
    lineHeight: 24,
  },
  sheetSub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    marginTop: 3,
  },
  btnRow: { flexDirection: 'row', gap: 8 },
  viewBtn: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 13,
    color: '#fff',
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 18 },
});
