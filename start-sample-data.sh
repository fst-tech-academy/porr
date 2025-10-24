#!/bin/bash

echo "📝 Creating Sample Audit Data..."
echo "📍 Current directory: $(pwd)"

# Navigate to server directory
cd server

# Check if sample script exists
if [ ! -f "create-sample-audit.js" ]; then
    echo "❌ Error: create-sample-audit.js not found"
    exit 1
fi

echo "🔄 Running sample data creation script..."
node create-sample-audit.js
