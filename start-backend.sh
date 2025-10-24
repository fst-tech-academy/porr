#!/bin/bash

echo "🚀 Starting PORR Backend Server..."
echo "📍 Current directory: $(pwd)"

# Navigate to server directory
cd server

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found in server directory"
    echo "Current directory contents:"
    ls -la
    exit 1
fi

echo "📦 Installing dependencies if needed..."
npm install

echo "🔄 Starting backend server..."
npm start
