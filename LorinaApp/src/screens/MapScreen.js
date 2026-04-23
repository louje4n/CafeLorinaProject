/**
 * MapScreen
 *
 * Full-screen SVG city map with:
 *   - Heatmap overlay (toggleable) showing cafe busyness by area
 *   - Tappable cafe pins that open a bottom sheet preview
 *   - Bottom sheet navigates to full CafeProfile
 *
 * Safe area: top bar positioned using insets.top.
 */
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Svg, {
  Rect,
  Circle,
  G,
  Text as SvgText,
  Line,
} from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { BusynessChip, SeatBar } from '../components/SharedUI';
import { CAFES } from '../data/cafes';

const { width: SCREEN_W } = Dimensions.get('window');

function heatColor(h) {
  return h < 0.3 ? '#4A9E6A' : h < 0.65 ? '#C0882A' : '#B84848';
}

export default function MapScreen({ navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const [heatmap, setHeatmap] = useState(true);
  const [sel, setSel] = useState(null);

  function goToCafe(cafe) {
    navigation.navigate('CafeProfile', { cafe });
  }

  return (
    <View style={styles.container}>
      {/* ── Map SVG ── */}
      <Svg width={SCREEN_W} height={SCREEN_W * 1.84} viewBox={`0 0 402 740`} preserveAspectRatio="xMidYMid slice" style={StyleSheet.absoluteFill}>
        {/* Base */}
        <Rect width={402} height={740} fill={T.dark ? '#181210' : '#EEE8E0'} />

        {/* City blocks */}
        {[[60,80,82,60],[162,60,102,80],[280,80,102,54],[38,180,122,90],[190,170,92,90],[300,160,92,100],[38,300,102,120],[168,290,112,120],[298,290,92,120],[38,450,122,90],[180,440,92,90],[298,440,92,80]].map(([x,y,w,h],i) => (
          <Rect key={i} x={x} y={y} width={w} height={h} rx={5} fill={T.dark ? '#201810' : '#E4DDD4'} opacity={0.75} />
        ))}

        {/* Roads */}
        <Rect x={0} y={152} width={402} height={20} fill={T.dark ? '#2A1E14' : '#D0C8BE'} />
        <Rect x={0} y={272} width={402} height={16} fill={T.dark ? '#2A1E14' : '#D0C8BE'} />
        <Rect x={0} y={432} width={402} height={14} fill={T.dark ? '#2A1E14' : '#D0C8BE'} />
        <Rect x={0} y={558} width={402} height={18} fill={T.dark ? '#2A1E14' : '#D0C8BE'} />
        <Rect x={28} y={0} width={20} height={740} fill={T.dark ? '#2A1E14' : '#D0C8BE'} />
        <Rect x={154} y={0} width={14} height={740} fill={T.dark ? '#2A1E14' : '#D0C8BE'} />
        <Rect x={284} y={0} width={14} height={740} fill={T.dark ? '#2A1E14' : '#D0C8BE'} />

        {/* Road labels */}
        <SvgText x={76} y={148} fontSize={7} fill={T.dark ? '#7A6858' : '#A09080'} fontFamily="DMSans_400Regular" fontWeight={500}>Flinders St</SvgText>
        <SvgText x={76} y={268} fontSize={7} fill={T.dark ? '#7A6858' : '#A09080'} fontFamily="DMSans_400Regular" fontWeight={500}>Collins St</SvgText>

        {/* Park */}
        <Rect x={30} y={153} width={116} height={18} fill={T.dark ? '#162010' : '#C8DCC0'} opacity={0.5} />
        <SvgText x={58} y={165} fontSize={7} fill="#4A9E6A" fontFamily="DMSans_400Regular">Flagstaff Gardens</SvgText>

        {/* Heatmap rings */}
        {heatmap && CAFES.map((c) => {
          const cx = (c.mapX / 100) * 402;
          const cy = (c.mapY / 100) * 600 + 60;
          const col = heatColor(c.heat);
          return (
            <G key={c.id + 'h'}>
              <Circle cx={cx} cy={cy} r={52} fill={col} opacity={0.12} />
              <Circle cx={cx} cy={cy} r={26} fill={col} opacity={0.18} />
            </G>
          );
        })}

        {/* Pins */}
        {CAFES.map((c) => {
          const cx = (c.mapX / 100) * 402;
          const cy = (c.mapY / 100) * 600 + 60;
          const isSel = sel?.id === c.id;
          return (
            <G key={c.id} onPress={() => setSel(isSel ? null : c)}>
              <Circle
                cx={cx} cy={cy}
                r={isSel ? 16 : 11}
                fill={isSel ? T.primary : T.card}
                stroke={T.primary}
                strokeWidth={isSel ? 2 : 1.5}
              />
              <Circle
                cx={cx} cy={cy}
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
          <Text style={[styles.mapTitleText, { color: T.text }]}>Map</Text>
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
          {[['Quiet', '#4A9E6A'], ['Moderate', '#C0882A'], ['Busy', '#B84848']].map(([l, c]) => (
            <View key={l} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: c }]} />
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
              <Text style={[styles.sheetSub, { color: T.sub }]}>{sel.suburb} · {sel.distance}</Text>
            </View>
            <BusynessChip level={sel.busyness} />
          </View>
          <SeatBar avail={sel.seatsAvail} total={sel.seatsTotal} T={T} />
          <View style={[styles.btnRow, { marginTop: 14 }]}>
            <TouchableOpacity
              onPress={() => goToCafe(sel)}
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

  // Top bar
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
    fontSize: 17,
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

  // Legend
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

  // Bottom sheet
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
