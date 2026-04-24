import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { AuthInput, OrDivider, SocialBtn, SpinGlyph } from '../components/AuthUI';

export default function LoginScreen({ navigation }) {
  const { T } = useTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [state, setState] = useState('idle'); // idle | loading | success
  const [error, setError] = useState('');

  const canSubmit = useMemo(() => email.trim() && password.trim(), [email, password]);

  async function handleSubmit() {
    if (!canSubmit || state === 'loading') return;
    setError('');
    setState('loading');
    await wait(1400);
    const { error: signInError } = await signIn(email.trim().toLowerCase(), password);
    if (signInError) {
      setState('idle');
      setError(signInError.message);
      return;
    }
    setState('success');
    await wait(900);
    navigation.goBack();
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: T.bg }]}>
      <View style={[styles.header, { backgroundColor: T.surf, borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <Text style={[styles.back, { color: T.sub }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: T.text }]}>Welcome back</Text>
        <Text style={[styles.sub, { color: T.sub }]}>Sign in to your Lorina account</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.socialRow}>
          <SocialBtn label="Apple" icon="" T={T} onPress={() => {}} />
          <SocialBtn label="Google" icon="G" T={T} onPress={() => {}} />
        </View>
        <OrDivider T={T} />

        <AuthInput label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" T={T} />
        <AuthInput label="Password" value={password} onChangeText={setPassword} secureTextEntry T={T} />
        <TouchableOpacity style={styles.forgotWrap}>
          <Text style={[styles.forgot, { color: T.primary }]}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!canSubmit || state === 'loading'}
          style={[
            styles.submitBtn,
            { backgroundColor: state === 'success' ? '#4A9E6A' : T.primary, opacity: canSubmit ? 1 : 0.5 },
          ]}
        >
          {state === 'loading' ? (
            <SpinGlyph spinning color="#fff" />
          ) : (
            <Text style={styles.submitText}>{state === 'success' ? '✓  Signed in' : 'Log in'}</Text>
          )}
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={[styles.switchCopy, { color: T.sub }]}>
          Don&apos;t have an account?{' '}
          <Text style={{ color: T.primary }} onPress={() => navigation.navigate('Signup')}>
            Sign up
          </Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    paddingTop: 12,
    paddingBottom: 24,
    paddingHorizontal: 24,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  back: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 13,
    marginBottom: 12,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    marginBottom: 4,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
  },
  body: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 40,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 8,
  },
  forgotWrap: {
    alignItems: 'flex-end',
    marginTop: 2,
    marginBottom: 14,
  },
  forgot: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  submitText: {
    color: '#fff',
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
  },
  switchCopy: {
    textAlign: 'center',
    fontFamily: 'DMSans_400Regular',
    fontSize: 12,
    marginTop: 16,
  },
  error: {
    marginTop: 8,
    color: '#B84848',
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
  },
});

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
