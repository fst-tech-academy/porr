#!/bin/bash

echo "🚀 Starting PORR Frontend Server..."
echo "📍 Current directory: $(pwd)"

# Navigate to client directory
cd client

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in client directory"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

echo "📦 Installing dependencies if needed..."
npm install

echo "🔄 Starting frontend development server..."
npm run dev
