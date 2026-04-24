import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { CupIllustration } from '../components/AuthUI';

export default function WelcomeScreen({ navigation }) {
  const { T } = useTheme();
  const insets = useSafeAreaInsets();
  const canGoBack = navigation.canGoBack();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: T.dark ? '#100A04' : '#FAF6F0' }]}>
      <View style={[styles.bgCircle, { backgroundColor: T.dark ? '#1C1008' : '#F2EAE0' }]} />
      <View style={[styles.glow, { backgroundColor: `${T.primary}1F` }]} />
      <View style={styles.topBar}>
        {canGoBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={[
              styles.backBtn,
              {
                borderColor: T.border,
                backgroundColor: T.card,
                marginTop: Math.max(6, insets.top * 0.35),
              },
            ]}
          >
            <Text style={[styles.backBtnText, { color: T.text }]}>← Back</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.center}>
        <CupIllustration T={T} />
        <Text style={[styles.brand, { color: T.text }]}>Lorina</Text>
        <Text style={[styles.tagline, { color: T.sub }]}>
          Your community cafe, always one sip away
        </Text>
        <View style={styles.dotRow}>
          <View style={[styles.dot, { backgroundColor: T.primary }]} />
          <View style={[styles.dot, { backgroundColor: T.accent || '#C8A46A' }]} />
          <View style={[styles.dot, { backgroundColor: `${T.border}80` }]} />
        </View>
      </View>

      <View style={styles.ctaWrap}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Signup')}
          style={[styles.primaryBtn, { backgroundColor: T.primary, shadowColor: T.primary }]}
          activeOpacity={0.9}
        >
          <Text style={styles.primaryBtnText}>Create account</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => navigation.navigate('Login')}
          style={[styles.ghostBtn, { borderColor: T.border, backgroundColor: T.card }]}
          activeOpacity={0.9}
        >
          <Text style={[styles.ghostBtnText, { color: T.text }]}>Log in</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.terms, { color: T.sub }]}>
        By continuing you agree to our <Text style={{ color: T.primary }}>Terms</Text> and{' '}
        <Text style={{ color: T.primary }}>Privacy</Text>.
      </Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  bgCircle: {
    position: 'absolute',
    width: 520,
    height: 520,
    borderRadius: 260,
    top: -160,
    left: -80,
    opacity: 0.9,
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    alignSelf: 'center',
    top: 70,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  brand: {
    marginTop: 10,
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 34,
    letterSpacing: -1,
  },
  tagline: {
    marginTop: 8,
    maxWidth: 220,
    textAlign: 'center',
    fontFamily: 'PlayfairDisplay_400Regular',
    fontStyle: 'italic',
    fontSize: 15,
    lineHeight: 22,
  },
  dotRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
    marginBottom: 48,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  ctaWrap: {
    paddingHorizontal: 24,
    gap: 10,
  },
  primaryBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 4,
  },
  primaryBtnText: {
    color: '#fff',
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
  ghostBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  ghostBtnText: {
    fontFamily: 'DMSans_600SemiBold',
    fontSize: 14,
  },
  terms: {
    textAlign: 'center',
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
    marginTop: 14,
    marginBottom: 32,
    paddingHorizontal: 24,
  },
  topBar: {
    paddingHorizontal: 18,
    zIndex: 10,
  },
  backBtn: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  backBtnText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
});
