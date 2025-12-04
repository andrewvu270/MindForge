#!/bin/bash

echo "🧹 Cleaning Metro bundler cache..."

# Kill any existing Metro processes
pkill -f metro-bundler 2>/dev/null
pkill -f metro 2>/dev/null

# Clear caches
rm -rf node_modules/.cache 2>/dev/null
rm -rf .expo 2>/dev/null
rm -rf /tmp/metro-* 2>/dev/null
rm -rf /tmp/haste-* 2>/dev/null

# Clear watchman if available
if command -v watchman &> /dev/null; then
    echo "🔍 Clearing watchman..."
    watchman watch-del-all 2>/dev/null
fi

echo "✅ Cache cleared!"
echo ""
echo "🚀 Starting Expo with clean cache..."
echo ""

# Start with clear cache
npx expo start --clear
