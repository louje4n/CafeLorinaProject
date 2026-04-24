/**
 * MapScreen
 *
 * SVG map of Melbourne CBD. Cafe pins and heatmap rings are placed using
 * real lat/lng from Supabase, projected onto the SVG canvas via a linear
 * bounding-box transform covering the CBD grid.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, { Rect, Circle, G, Text as SvgText, Line } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { BusynessChip, SeatBar } from '../components/SharedUI';
import { useCafes } from '../hooks/useCafes';

const { width: SCREEN_W } = Dimensions.get('window');

// Bounding box — Melbourne CBD
const LNG_MIN = 144.955;
const LNG_MAX = 144.968;
const LAT_MAX = -37.804;
const LAT_MIN = -37.815;
const SVG_W = 402;
const SVG_H = 740;

function latLngToSvg(lat, lng) {
  const x = ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * SVG_W;
  const y = ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * SVG_H;
  return { x, y };
}

function busynessHeat(level) {
  if (level === 'quiet') return 0.2;
  if (level === 'moderate') return 0.5;
  return 0.85;
}

function heatColor(h) {
  return h < 0.35 ? '#10B981' : h < 0.65 ? '#F59E0B' : '#EF4444';
}

// Melbourne CBD street positions (SVG pixels)
// EW streets (horizontal)
const LA_TROBE_Y = 202;   // lat -37.807
const LONSDALE_Y = 336;   // lat -37.809
const BOURKE_Y   = 538;   // lat -37.812
const COLLINS_Y  = 672;   // lat -37.814
// NS streets (vertical)
const WILLIAM_X  = 124;   // lng 144.959
const QUEEN_X    = 216;   // lng 144.962
const ELIZABETH_X = 309;  // lng 144.965

const ROAD_W = 14;
const BLOCK_COLOR_LIGHT = '#E4DDD4';
const BLOCK_COLOR_DARK  = '#201810';
const ROAD_COLOR_LIGHT  = '#D0C8BE';
const ROAD_COLOR_DARK   = '#2A1E14';

export default function MapScreen({ navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const { cafes } = useCafes();
  const [heatmap, setHeatmap] = useState(true);
  const [sel, setSel] = useState(null);

  const roadFill = T.dark ? ROAD_COLOR_DARK : ROAD_COLOR_LIGHT;
  const blockFill = T.dark ? BLOCK_COLOR_DARK : BLOCK_COLOR_LIGHT;

  // City blocks filling the CBD grid spaces
  const blocks = [
    // Row 0: north of La Trobe
    [0,           0, WILLIAM_X - ROAD_W/2,                    LA_TROBE_Y - ROAD_W/2],
    [WILLIAM_X + ROAD_W/2, 0, QUEEN_X - WILLIAM_X - ROAD_W,   LA_TROBE_Y - ROAD_W/2],
    [QUEEN_X + ROAD_W/2,   0, ELIZABETH_X - QUEEN_X - ROAD_W, LA_TROBE_Y - ROAD_W/2],
    [ELIZABETH_X + ROAD_W/2, 0, SVG_W - ELIZABETH_X - ROAD_W/2, LA_TROBE_Y - ROAD_W/2],
    // Row 1: La Trobe → Lonsdale
    [0,           LA_TROBE_Y + ROAD_W/2, WILLIAM_X - ROAD_W/2,                    LONSDALE_Y - LA_TROBE_Y - ROAD_W],
    [WILLIAM_X + ROAD_W/2, LA_TROBE_Y + ROAD_W/2, QUEEN_X - WILLIAM_X - ROAD_W,   LONSDALE_Y - LA_TROBE_Y - ROAD_W],
    [QUEEN_X + ROAD_W/2,   LA_TROBE_Y + ROAD_W/2, ELIZABETH_X - QUEEN_X - ROAD_W, LONSDALE_Y - LA_TROBE_Y - ROAD_W],
    [ELIZABETH_X + ROAD_W/2, LA_TROBE_Y + ROAD_W/2, SVG_W - ELIZABETH_X - ROAD_W/2, LONSDALE_Y - LA_TROBE_Y - ROAD_W],
    // Row 2: Lonsdale → Bourke
    [0,           LONSDALE_Y + ROAD_W/2, WILLIAM_X - ROAD_W/2,                    BOURKE_Y - LONSDALE_Y - ROAD_W],
    [WILLIAM_X + ROAD_W/2, LONSDALE_Y + ROAD_W/2, QUEEN_X - WILLIAM_X - ROAD_W,   BOURKE_Y - LONSDALE_Y - ROAD_W],
    [QUEEN_X + ROAD_W/2,   LONSDALE_Y + ROAD_W/2, ELIZABETH_X - QUEEN_X - ROAD_W, BOURKE_Y - LONSDALE_Y - ROAD_W],
    [ELIZABETH_X + ROAD_W/2, LONSDALE_Y + ROAD_W/2, SVG_W - ELIZABETH_X - ROAD_W/2, BOURKE_Y - LONSDALE_Y - ROAD_W],
    // Row 3: Bourke → Collins
    [0,           BOURKE_Y + ROAD_W/2, WILLIAM_X - ROAD_W/2,                    COLLINS_Y - BOURKE_Y - ROAD_W],
    [WILLIAM_X + ROAD_W/2, BOURKE_Y + ROAD_W/2, QUEEN_X - WILLIAM_X - ROAD_W,   COLLINS_Y - BOURKE_Y - ROAD_W],
    [QUEEN_X + ROAD_W/2,   BOURKE_Y + ROAD_W/2, ELIZABETH_X - QUEEN_X - ROAD_W, COLLINS_Y - BOURKE_Y - ROAD_W],
    [ELIZABETH_X + ROAD_W/2, BOURKE_Y + ROAD_W/2, SVG_W - ELIZABETH_X - ROAD_W/2, COLLINS_Y - BOURKE_Y - ROAD_W],
    // Row 4: south of Collins
    [0,           COLLINS_Y + ROAD_W/2, WILLIAM_X - ROAD_W/2,                    SVG_H - COLLINS_Y - ROAD_W/2],
    [WILLIAM_X + ROAD_W/2, COLLINS_Y + ROAD_W/2, QUEEN_X - WILLIAM_X - ROAD_W,   SVG_H - COLLINS_Y - ROAD_W/2],
    [QUEEN_X + ROAD_W/2,   COLLINS_Y + ROAD_W/2, ELIZABETH_X - QUEEN_X - ROAD_W, SVG_H - COLLINS_Y - ROAD_W/2],
    [ELIZABETH_X + ROAD_W/2, COLLINS_Y + ROAD_W/2, SVG_W - ELIZABETH_X - ROAD_W/2, SVG_H - COLLINS_Y - ROAD_W/2],
  ];

  return (
    <View style={styles.container}>
      {/* ── Map SVG ── */}
      <Svg
        width={SCREEN_W}
        height={SCREEN_W * 1.84}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        preserveAspectRatio="xMidYMid slice"
        style={StyleSheet.absoluteFill}
      >
        {/* Base */}
        <Rect width={SVG_W} height={SVG_H} fill={T.dark ? '#181210' : '#EEE8E0'} />

        {/* City blocks */}
        {blocks.map(([x, y, w, h], i) => (
          <Rect key={i} x={x} y={y} width={w} height={h} rx={4} fill={blockFill} opacity={0.8} />
        ))}

        {/* EW roads */}
        <Rect x={0} y={LA_TROBE_Y - ROAD_W/2}  width={SVG_W} height={ROAD_W} fill={roadFill} />
        <Rect x={0} y={LONSDALE_Y - ROAD_W/2}  width={SVG_W} height={ROAD_W} fill={roadFill} />
        <Rect x={0} y={BOURKE_Y   - ROAD_W/2}  width={SVG_W} height={ROAD_W} fill={roadFill} />
        <Rect x={0} y={COLLINS_Y  - ROAD_W/2}  width={SVG_W} height={ROAD_W} fill={roadFill} />

        {/* NS roads */}
        <Rect x={WILLIAM_X   - ROAD_W/2} y={0} width={ROAD_W} height={SVG_H} fill={roadFill} />
        <Rect x={QUEEN_X     - ROAD_W/2} y={0} width={ROAD_W} height={SVG_H} fill={roadFill} />
        <Rect x={ELIZABETH_X - ROAD_W/2} y={0} width={ROAD_W} height={SVG_H} fill={roadFill} />

        {/* Road labels (EW) */}
        <SvgText x={10} y={LA_TROBE_Y - 3}  fontSize={7} fill={T.dark ? '#7A6858' : '#A09080'} fontFamily="DMSans_400Regular">La Trobe St</SvgText>
        <SvgText x={10} y={LONSDALE_Y - 3}  fontSize={7} fill={T.dark ? '#7A6858' : '#A09080'} fontFamily="DMSans_400Regular">Lonsdale St</SvgText>
        <SvgText x={10} y={BOURKE_Y   - 3}  fontSize={7} fill={T.dark ? '#7A6858' : '#A09080'} fontFamily="DMSans_400Regular">Bourke St</SvgText>
        <SvgText x={10} y={COLLINS_Y  - 3}  fontSize={7} fill={T.dark ? '#7A6858' : '#A09080'} fontFamily="DMSans_400Regular">Collins St</SvgText>

        {/* Road labels (NS) */}
        <SvgText x={WILLIAM_X   + 2} y={20} fontSize={6} fill={T.dark ? '#7A6858' : '#A09080'} fontFamily="DMSans_400Regular" rotation={90} originX={WILLIAM_X + 2} originY={20}>William St</SvgText>
        <SvgText x={QUEEN_X     + 2} y={20} fontSize={6} fill={T.dark ? '#7A6858' : '#A09080'} fontFamily="DMSans_400Regular" rotation={90} originX={QUEEN_X + 2} originY={20}>Queen St</SvgText>
        <SvgText x={ELIZABETH_X + 2} y={20} fontSize={6} fill={T.dark ? '#7A6858' : '#A09080'} fontFamily="DMSans_400Regular" rotation={90} originX={ELIZABETH_X + 2} originY={20}>Elizabeth St</SvgText>

        {/* Heatmap rings */}
        {heatmap && cafes.map((c) => {
          if (!c.lat || !c.lng) return null;
          const { x, y } = latLngToSvg(c.lat, c.lng);
          const heat = busynessHeat(c.busyness);
          const col = heatColor(heat);
          return (
            <G key={c.id + 'h'}>
              <Circle cx={x} cy={y} r={52} fill={col} opacity={0.12} />
              <Circle cx={x} cy={y} r={26} fill={col} opacity={0.18} />
            </G>
          );
        })}

        {/* Pins */}
        {cafes.map((c) => {
          if (!c.lat || !c.lng) return null;
          const { x, y } = latLngToSvg(c.lat, c.lng);
          const isSel = sel?.id === c.id;
          return (
            <G key={c.id} onPress={() => setSel(isSel ? null : c)}>
              <Circle
                cx={x} cy={y}
                r={isSel ? 16 : 11}
                fill={isSel ? T.primary : T.card}
                stroke={T.primary}
                strokeWidth={isSel ? 2 : 1.5}
              />
              <Circle
                cx={x} cy={y}
                r={isSel ? 5 : 4}
                fill={isSel ? '#fff' : T.primary}
              />
            </G>
          );
        })}
      </Svg>

      {/* ── Top bar ── */}
      <View style={[styles.topBar, { top: insets.top + 10 }]}>
        <View style={[styles.mapTitle, { backgroundColor: T.card, borderColor: T.border }]}>
          <Text style={[styles.mapTitleText, { color: T.text }]}>Melbourne CBD</Text>
        </View>
        <TouchableOpacity
          onPress={() => setHeatmap((h) => !h)}
          style={[
            styles.heatBtn,
            {
              backgroundColor: heatmap ? T.primary : T.card,
              borderColor: heatmap ? T.primary : T.border,
            },
          ]}
        >
          <Text style={[styles.heatBtnText, { color: heatmap ? '#fff' : T.text }]}>
            Heatmap {heatmap ? 'On' : 'Off'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Legend ── */}
      {heatmap && (
        <View style={[styles.legend, { top: insets.top + 60, backgroundColor: T.card, borderColor: T.border }]}>
          {[['Quiet', '#10B981'], ['Moderate', '#F59E0B'], ['Busy', '#EF4444']].map(([l, col]) => (
            <View key={l} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: col }]} />
              <Text style={[styles.legendLabel, { color: T.text }]}>{l}</Text>
            </View>
          ))}
        </View>
      )}

      {/* ── Bottom Sheet ── */}
      {sel && (
        <View style={[styles.sheet, { backgroundColor: T.card, borderColor: T.border, paddingBottom: insets.bottom + 20 }]}>
          <View style={[styles.sheetHandle, { backgroundColor: T.border }]} />
          <View style={styles.sheetHeader}>
            <View style={styles.flex}>
              <Text style={[styles.sheetName, { color: T.text }]}>{sel.name}</Text>
              <Text style={[styles.sheetSub, { color: T.sub }]}>{sel.suburb}</Text>
            </View>
            <BusynessChip level={sel.busyness} />
          </View>
          <SeatBar avail={sel.seats_avail} total={sel.seats_total} T={T} />
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

  topBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 20,
  },
  mapTitle: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mapTitleText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
  },
  heatBtn: {
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  heatBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 11,
  },

  legend: {
    position: 'absolute',
    right: 14,
    borderRadius: 8,
    padding: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    zIndex: 20,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  legendDot: { width: 7, height: 7, borderRadius: 3.5 },
  legendLabel: { fontFamily: 'DMSans_400Regular', fontSize: 10 },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderRadius: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 16,
    paddingHorizontal: 18,
    borderWidth: 1,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    zIndex: 30,
  },
  sheetHandle: {
    width: 32,
    height: 3,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  sheetName: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 18 },
  sheetSub: { fontFamily: 'DMSans_400Regular', fontSize: 11, marginTop: 2 },
  flex: { flex: 1 },
  btnRow: { flexDirection: 'row', gap: 8 },
  viewBtn: {
    flex: 1,
    height: 42,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnText: { fontFamily: 'DMSans_600SemiBold', fontSize: 13, color: '#fff' },
  closeBtn: {
    width: 42,
    height: 42,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: 18 },
});
