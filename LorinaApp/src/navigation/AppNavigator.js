/**
 * AppNavigator
 *
 * Architecture:
 *   Bottom Tab (5 tabs) — each tab with its own Stack so screens like
 *   CafeProfile and Reviews can be pushed without leaving the tab context.
 *
 *   Home  → CafeProfile → Reviews
 *   Map   → CafeProfile → Reviews
 *   Live  (single screen)
 *   Search → CafeProfile → Reviews
 *   Profile (single screen)
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useTheme } from '../context/ThemeContext';
import { HomeIco, MapIco, CommIco, SearchIco, ProfileIco } from '../components/Icons';

import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import CommunityScreen from '../screens/CommunityScreen';
import SearchScreen from '../screens/SearchScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CafeProfileScreen from '../screens/CafeProfileScreen';
import ReviewsScreen from '../screens/ReviewsScreen';
import LiveChatScreen from '../screens/LiveChatScreen';
import { ProfileProvider } from '../context/ProfileContext';

const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const MapStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

// ─── Stacks (tabs that support drilling into CafeProfile / Reviews) ──

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="CafeProfile" component={CafeProfileScreen} />
      <HomeStack.Screen name="Reviews" component={ReviewsScreen} />
      <HomeStack.Screen name="LiveChat" component={LiveChatScreen} />
      <HomeStack.Screen name="Community" component={CommunityScreen} />
    </HomeStack.Navigator>
  );
}

function MapStackNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="MapMain" component={MapScreen} />
      <MapStack.Screen name="CafeProfile" component={CafeProfileScreen} />
      <MapStack.Screen name="Reviews" component={ReviewsScreen} />
      <MapStack.Screen name="LiveChat" component={LiveChatScreen} />
    </MapStack.Navigator>
  );
}

function SearchStackNavigator() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="SearchMain" component={SearchScreen} />
      <SearchStack.Screen name="CafeProfile" component={CafeProfileScreen} />
      <SearchStack.Screen name="Reviews" component={ReviewsScreen} />
      <SearchStack.Screen name="LiveChat" component={LiveChatScreen} />
    </SearchStack.Navigator>
  );
}

function ProfileStackNavigator() {
  return (
    <ProfileProvider>
      <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
        <ProfileStack.Screen name="ProfileMain" component={ProfileScreen} />
        <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      </ProfileStack.Navigator>
    </ProfileProvider>
  );
}

// ─── Tab Bar Icon renderer ─────────────────────────────────────────

function TabIcon({ name, focused, color }) {
  const props = { color, active: focused };
  switch (name) {
    case 'Home':    return <HomeIco    {...props} />;
    case 'Map':     return <MapIco     {...props} />;
    case 'Live':    return <CommIco    {...props} />;
    case 'Search':  return <SearchIco  {...props} />;
    case 'Profile': return <ProfileIco {...props} />;
    default:        return null;
  }
}

// ─── Main Tab Navigator ───────────────────────────────────────────

function LorinaTabNavigator() {
  const { T } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: T.card,
          borderTopColor: T.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height: 76,
          paddingTop: 10,
          paddingBottom: 0,
        },
        tabBarActiveTintColor: T.primary,
        tabBarInactiveTintColor: T.sub,
        tabBarLabelStyle: {
          fontFamily: 'DMSans_400Regular',
          fontSize: 9,
          letterSpacing: 0.3,
          marginTop: 4,
        },
        tabBarActiveLabelStyle: {
          fontFamily: 'DMSans_700Bold',
        },
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarShowLabel: true,
      })}
    >
      <Tab.Screen name="Home"    component={HomeStackNavigator} />
      <Tab.Screen name="Map"     component={MapStackNavigator} />
      <Tab.Screen name="Live"    component={CommunityScreen} />
      <Tab.Screen name="Search"  component={SearchStackNavigator} />
      <Tab.Screen name="Profile" component={ProfileStackNavigator} />
    </Tab.Navigator>
  );
}

// ─── Root Navigator ───────────────────────────────────────────────

export default function AppNavigator() {
  const { T } = useTheme();
  return (
    <NavigationContainer
      theme={{
        dark: T.dark,
        colors: {
          primary: T.primary,
          background: T.bg,
          card: T.card,
          text: T.text,
          border: T.border,
          notification: T.primary,
        },
        // Required by React Navigation v7 — must include all four weights
        fonts: {
          regular: { fontFamily: 'DMSans_400Regular', fontWeight: '400' },
          medium:  { fontFamily: 'DMSans_500Medium',  fontWeight: '500' },
          bold:    { fontFamily: 'DMSans_700Bold',     fontWeight: '700' },
          heavy:   { fontFamily: 'DMSans_700Bold',     fontWeight: '900' },
        },
      }}
    >
      <LorinaTabNavigator />
    </NavigationContainer>
  );
}
