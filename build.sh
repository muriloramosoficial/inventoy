#!/bin/bash
# Build script for WSL workaround
# Copies 404/500 pages after static generation to avoid EPERM

set -e

echo "Building with webpack..."
node node_modules/next/dist/bin/next build --webpack

# Workaround for WSL EPERM issue
if [ -f ".next/server/app/_not-found.html" ]; then
  echo "Copying 404/500 pages..."
  cp .next/server/app/_not-found.html .next/server/pages/404.html
  cp .next/server/app/_global-error.html .next/server/pages/500.html
  echo "Copy complete"
fi

echo "Build finished successfully"