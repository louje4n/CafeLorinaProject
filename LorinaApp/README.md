# Lorina — React Native Expo App

> Your café, your community. A production-ready mobile translation of the Lorina web prototype.

## Quick Start

```bash
# 1. Navigate to the app directory
cd /Users/louissarmiento/CafeLorinaProject/LorinaApp

# 2. Install all dependencies (REQUIRED — run this once)
npm install react-native-svg react-native-safe-area-context react-native-screens \
  react-native-gesture-handler \
  @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack \
  expo-font \
  @expo-google-fonts/dm-sans @expo-google-fonts/playfair-display \
  --legacy-peer-deps

# 3. Start the dev server
npx expo start

# Then press 'i' for iOS simulator, 'a' for Android, or scan the QR code with Expo Go
```

---

## Project Structure

```
LorinaApp/
├── App.js                        ← Entry point: fonts, SafeAreaProvider, ThemeProvider
├── app.json                      ← Expo config (splash, icons, orientation)
├── src/
│   ├── context/
│   │   └── ThemeContext.js       ← Theme state: Oat / Parchment / Dusk / Dark mode
│   ├── data/
│   │   ├── themes.js             ← THEMES object + getT() resolver
│   │   └── cafes.js              ← CAFES, REVIEWS, COMMUNITY_POSTS data
│   ├── components/
│   │   ├── Icons.js              ← All custom SVG icons (react-native-svg)
│   │   └── SharedUI.js           ← BusynessChip, Stars, Avi, SeatBar, Tag
│   ├── screens/
│   │   ├── HomeScreen.js         ← Nearby list + Trending card swipe
│   │   ├── MapScreen.js          ← SVG street map with heatmap + pins
│   │   ├── CommunityScreen.js    ← Live updates feed + report form
│   │   ├── SearchScreen.js       ← Search + filter chips
│   │   ├── ProfileScreen.js      ← Profile + theme switcher + saved cafés
│   │   ├── CafeProfileScreen.js  ← Full café detail view
│   │   └── ReviewsScreen.js      ← Review list + write review form
│   └── navigation/
│       └── AppNavigator.js       ← Bottom tabs + per-tab stack navigators
```

## Key Design Decisions

### ✅ Phase 3 Safe Area Fix (Critical)
All screens use `useSafeAreaInsets()` from `react-native-safe-area-context`:
```js
const insets = useSafeAreaInsets();
// Applied to headers:
<View style={{ paddingTop: insets.top + 14 }}>
```
This replaces **all hardcoded `paddingTop: 70px`** from the web prototype, ensuring the UI correctly clears iOS Dynamic Island, notch, and status bar.

### Theme System
The `ThemeContext` exposes a flat `T` token object:
- `T.bg`, `T.surf`, `T.card`, `T.text`, `T.sub`, `T.border`, `T.chip`
- `T.primary`, `T.secondary`, `T.accent`
- Switch themes live from the Profile screen

### Navigation Architecture
```
Bottom Tabs (5 tabs)
├── Home Stack
│   ├── HomeScreen (Nearby / Trending)
│   ├── CafeProfileScreen ← navigated to from any cafe card
│   └── ReviewsScreen
├── Map Stack
│   ├── MapScreen (SVG map with heatmap)
│   └── CafeProfileScreen
├── Live (CommunityScreen)
├── Search Stack
│   ├── SearchScreen
│   └── CafeProfileScreen
└── Profile (ProfileScreen + theme switcher)
```

### Custom SVG Icons
No external icon library — all icons use `react-native-svg` primitives translated exactly from `lorina-ui.jsx`:
- `LorinaLogo` — the coffee cup brand mark
- `HomeIco`, `MapIco`, `CommIco`, `SearchIco`, `ProfileIco` — bottom nav
- `HeartIco`, `ThumbsUpIco` — inline action icons
