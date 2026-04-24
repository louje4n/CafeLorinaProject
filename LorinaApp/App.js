/**
 * App.js — Lorina Café Social App
 *
 * Entry point. Sets up:
 *   1. Font loading via expo-font
 *   2. SafeAreaProvider (wraps the entire app)
 *   3. ThemeProvider (global theme context)
 *   4. GestureHandlerRootView (required by react-navigation)
 *   5. AppNavigator (bottom tab + stack navigation)
 */

/**
 * App.js — Lorina Café Social App
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Google Fonts — DM Sans variants
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

// Google Fonts — Playfair Display
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_700Bold,
} from '@expo-google-fonts/playfair-display';

// Context Providers & Navigation
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

const queryClient = new QueryClient();

// ─── Inner app — wrapped in theme context so StatusBar reads T ────
function InnerApp() {
  const { T } = useTheme();
  return (
    <>
      <StatusBar style={T.dark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

// ─── Root ────────────────────────────────────────────────────────
export default function App() {
  const [fontsLoaded, fontError] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
  });

  // Wait for fonts before rendering (prevents FOUT)
  if (!fontsLoaded && !fontError) {
    return (
      <View style={styles.splash}>
        <ActivityIndicator size="large" color="#7C5230" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ThemeProvider>
              <InnerApp />
            </ThemeProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  splash: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
});