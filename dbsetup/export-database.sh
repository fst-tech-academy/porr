#!/bin/bash

# Database export script for PORR
# This script exports the PORR database to a dump file

echo "🗄️  Starting database export for PORR..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb/brew/mongodb-community"
    echo "   On Linux: sudo systemctl start mongod"
    exit 1
fi

# Check if database exists
echo "🔍 Checking if PORR database exists..."
DB_EXISTS=$(mongosh --eval "db.getName()" porr --quiet 2>/dev/null | grep -c "porr" || echo "0")

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "❌ PORR database does not exist!"
    echo "   Please create the database first or check your connection."
    exit 1
fi

echo "📦 Creating database dump..."
mongodump --db porr --out ./porr_dump

echo "🗜️  Compressing dump file..."
tar -czf porr_dump.tar.gz porr/

echo "🧹 Cleaning up temporary files..."
rm -rf porr/

echo "✅ Database export completed successfully!"
echo "📁 Dump file: porr_dump.tar.gz"
echo "🌐 Database: porr"