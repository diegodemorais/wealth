#!/bin/bash
# Production build with version increment ONLY on success
# Runs: tests → Next.js → post-build → validation → version increment

set -e  # Exit on any error

echo "🚀 Starting production build..."

cd react-app

echo "✓ Step 1: Running test suite..."
npm run test:ci

echo "✓ Step 2: Building Next.js..."
npm run build:no-test

echo "✓ Step 3: Post-build processing..."
node scripts/post-build.js

echo "✓ Step 4: Validating pages..."
node scripts/validate-pages.mjs

echo "✓ Step 5: Incrementing version (build successful)..."
node scripts/increment-version.js

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║              ✅ BUILD COMPLETED SUCCESSFULLY                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
exit 0
