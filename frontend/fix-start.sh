#!/bin/bash

# Fix for frozen npm start
echo "Clearing Metro bundler cache..."

# Clear watchman watches
watchman watch-del-all 2>/dev/null || echo "Watchman not installed (optional)"

# Clear Metro bundler cache
rm -rf node_modules/.cache
rm -rf .expo

# Clear npm cache
npm cache clean --force 2>/dev/null || echo "Skipping npm cache clean"

# Reinstall dependencies (optional, uncomment if needed)
# rm -rf node_modules
# npm install

echo "Cache cleared! Now try: npm start"
