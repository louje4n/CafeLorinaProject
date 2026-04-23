#!/bin/bash
# Lorina App — Install missing dependencies
# Run this script once from the LorinaApp directory:
#   chmod +x install_deps.sh && ./install_deps.sh

set -e
echo "📦 Installing Lorina app dependencies..."

npm install \
  react-native-svg@15.11.2 \
  react-native-safe-area-context@5.4.0 \
  react-native-screens@~4.5.0 \
  react-native-gesture-handler@~2.22.0 \
  @react-navigation/native@^7.1.6 \
  @react-navigation/bottom-tabs@^7.3.10 \
  @react-navigation/native-stack@^7.3.10 \
  expo-font@~13.3.1 \
  @expo-google-fonts/dm-sans@^0.2.3 \
  @expo-google-fonts/playfair-display@^0.2.3 \
  --legacy-peer-deps

echo "✅ All dependencies installed successfully!"
echo ""
echo "To start the app run:"
echo "  npx expo start"
