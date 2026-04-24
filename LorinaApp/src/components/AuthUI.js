import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

export function AuthInput({
  label,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  T,
}) {
  const focused = useRef(new Animated.Value(value ? 1 : 0)).current;
  const isFocused = useRef(false);

  useEffect(() => {
    Animated.timing(focused, {
      toValue: value || isFocused.current ? 1 : 0,
      duration: 180,
      useNativeDriver: false,
    }).start();
  }, [value, focused]);

  const labelTop = focused.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 8],
  });

  const labelSize = focused.interpolate({
    inputRange: [0, 1],
    outputRange: [14, 10],
  });

  return (
    <View style={[styles.inputWrap, { borderColor: T.border, backgroundColor: T.surf }]}>
      <Animated.Text
        style={[
          styles.floatingLabel,
          {
            color: T.sub,
            top: labelTop,
            fontSize: labelSize,
            opacity: focused.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }),
          },
        ]}
      >
        {label}
      </Animated.Text>
      <TextInput
        style={[styles.input, { color: T.text }]}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => {
          isFocused.current = true;
          Animated.timing(focused, { toValue: 1, duration: 120, useNativeDriver: false }).start();
        }}
        onBlur={() => {
          isFocused.current = false;
          Animated.timing(focused, {
            toValue: value ? 1 : 0,
            duration: 120,
            useNativeDriver: false,
          }).start();
        }}
      />
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          styles.inputFocusRing,
          {
            borderColor: T.primary,
            opacity: focused.interpolate({ inputRange: [0, 1], outputRange: [0, 1] }),
          },
        ]}
      />
    </View>
  );
}

export function SocialBtn({ label, icon, onPress, T }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.socialBtn, { borderColor: T.border, backgroundColor: T.card }]}
      activeOpacity={0.85}
    >
      <Text style={[styles.socialIcon, { color: T.text }]}>{icon}</Text>
      <Text style={[styles.socialText, { color: T.text }]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function OrDivider({ T }) {
  return (
    <View style={styles.orWrap}>
      <View style={[styles.orLine, { backgroundColor: T.border }]} />
      <Text style={[styles.orText, { color: T.sub }]}>or</Text>
      <View style={[styles.orLine, { backgroundColor: T.border }]} />
    </View>
  );
}

export function CupIllustration({ T, width = 140, height = 120 }) {
  const cup = T.dark ? '#6F4B32' : '#E8D3BE';
  const saucer = T.dark ? '#5A3C29' : '#E0C4AA';
  const coffee = T.dark ? '#2A1A12' : '#6B3F2A';
  const steam = T.dark ? '#C8A46A88' : '#A23B2544';
  const foam = T.dark ? '#E9D8C1' : '#FFF2E2';

  return (
    <Svg width={width} height={height} viewBox="0 0 140 120">
      <Ellipse cx="70" cy="95" rx="45" ry="8" fill={saucer} opacity={0.9} />
      <Path d="M35 35 H105 L98 86 H42 Z" fill={cup} />
      <Ellipse cx="70" cy="35" rx="35" ry="8" fill={cup} />
      <Ellipse cx="70" cy="35" rx="29" ry="6.5" fill={coffee} />
      <Path d="M60 35c4-4 12-4 16 0-2 5-6 8-8 10-2-2-6-5-8-10z" fill={foam} />
      <Path d="M106 44c10 0 12 13 2 16" fill="none" stroke={cup} strokeWidth="5" strokeLinecap="round" />
      <Path d="M50 24 C44 16 52 10 48 2" fill="none" stroke={steam} strokeWidth="3" strokeLinecap="round" />
      <Path d="M70 21 C63 13 73 8 68 1" fill="none" stroke={steam} strokeWidth="3" strokeLinecap="round" />
      <Path d="M90 24 C84 16 92 10 88 2" fill="none" stroke={steam} strokeWidth="3" strokeLinecap="round" />
      <Circle cx="70" cy="35" r="1.5" fill={foam} />
    </Svg>
  );
}

export function SpinGlyph({ spinning = false, color = '#fff' }) {
  const rot = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!spinning) {
      rot.setValue(0);
      return undefined;
    }
    const loop = Animated.loop(
      Animated.timing(rot, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [spinning, rot]);

  const spin = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <Animated.View style={{ transform: [{ rotate: spin }] }}>
      <Text style={{ color, fontSize: 14 }}>◌</Text>
    </Animated.View>
  );
}

export function TermsCheckbox({ checked, onToggle, T }) {
  return (
    <Pressable onPress={onToggle} style={styles.checkboxRow}>
      <View style={[styles.checkbox, { borderColor: T.border, backgroundColor: checked ? T.primary : 'transparent' }]}>
        {checked ? <Text style={styles.checkboxTick}>✓</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inputWrap: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  floatingLabel: {
    position: 'absolute',
    left: 14,
    fontFamily: 'DMSans_500Medium',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    marginTop: 10,
    fontFamily: 'DMSans_400Regular',
    fontSize: 14,
    paddingVertical: 4,
  },
  inputFocusRing: {
    borderRadius: 12,
    borderWidth: 1.3,
  },
  socialBtn: {
    height: 46,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  socialIcon: {
    fontSize: 15,
  },
  socialText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  orWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 14,
  },
  orLine: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
  },
  checkboxRow: {
    paddingVertical: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxTick: {
    color: '#fff',
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    lineHeight: 11,
  },
});
