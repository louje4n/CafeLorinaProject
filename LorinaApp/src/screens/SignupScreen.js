import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import {
  AuthInput,
  OrDivider,
  SocialBtn,
  SpinGlyph,
  TermsCheckbox,
} from '../components/AuthUI';

export default function SignupScreen({ navigation }) {
  const { T } = useTheme();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [state, setState] = useState('idle');
  const [error, setError] = useState('');

  const mismatch = !!confirmPassword && confirmPassword !== password;
  const valid = useMemo(
    () =>
      !!fullName.trim() &&
      !!email.trim() &&
      !!password.trim() &&
      !!confirmPassword.trim() &&
      !mismatch &&
      acceptedTerms,
    [fullName, email, password, confirmPassword, mismatch, acceptedTerms],
  );

  async function handleSubmit() {
    if (!valid || state === 'loading') return;
    setError('');
    setState('loading');
    await wait(1600);
    const { error: signUpError } = await signUp(email.trim().toLowerCase(), password, fullName.trim());
    if (signUpError) {
      setState('idle');
      setError(signUpError.message);
      return;
    }
    setState('success');
    await wait(900);
    navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: T.bg }]}>
      <View style={[styles.header, { backgroundColor: T.surf, borderBottomColor: T.border }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}>
          <Text style={[styles.back, { color: T.sub }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: T.text }]}>Join Lorina</Text>
        <Text style={[styles.sub, { color: T.sub }]}>Find your next favourite cafe</Text>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.socialRow}>
          <SocialBtn label="Apple" icon="" T={T} onPress={() => {}} />
          <SocialBtn label="Google" icon="G" T={T} onPress={() => {}} />
        </View>
        <OrDivider T={T} />

        <AuthInput label="Full name" value={fullName} onChangeText={setFullName} autoCapitalize="words" T={T} />
        <AuthInput label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" T={T} />
        <AuthInput label="Password" value={password} onChangeText={setPassword} secureTextEntry T={T} />
        <AuthInput
          label="Confirm password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          T={T}
        />
        {mismatch ? <Text style={styles.mismatch}>Passwords don&apos;t match</Text> : null}

        <View style={styles.termsRow}>
          <TermsCheckbox checked={acceptedTerms} onToggle={() => setAcceptedTerms((v) => !v)} T={T} />
          <Text style={[styles.termsText, { color: T.sub }]}>
            I agree to the <Text style={{ color: T.primary, fontFamily: 'DMSans_700Bold' }}>Terms of Service</Text> and{' '}
            <Text style={{ color: T.primary, fontFamily: 'DMSans_700Bold' }}>Privacy Policy</Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!valid || state === 'loading'}
          style={[
            styles.submitBtn,
            { backgroundColor: state === 'success' ? '#4A9E6A' : T.primary, opacity: valid ? 1 : 0.45 },
          ]}
        >
          {state === 'loading' ? (
            <SpinGlyph spinning color="#fff" />
          ) : (
            <Text style={styles.submitText}>{state === 'success' ? '✓  Account created' : 'Create account'}</Text>
          )}
        </TouchableOpacity>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Text style={[styles.switchCopy, { color: T.sub }]}>
          Already have an account?{' '}
          <Text style={{ color: T.primary }} onPress={() => navigation.navigate('Login')}>
            Log in
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
    paddingBottom: 20,
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
    fontSize: 24,
    marginBottom: 3,
  },
  sub: {
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
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
  mismatch: {
    marginTop: -4,
    marginBottom: 8,
    color: '#B84848',
    fontFamily: 'DMSans_400Regular',
    fontSize: 10,
  },
  termsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 2,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  termsText: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 11,
    lineHeight: 17,
  },
  submitBtn: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
