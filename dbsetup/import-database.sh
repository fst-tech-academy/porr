#!/bin/bash

# Database import script for PORR
# This script imports the PORR database dump

echo "🗄️  Starting database import for PORR..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "❌ MongoDB is not running. Please start MongoDB first."
    echo "   On macOS: brew services start mongodb/brew/mongodb-community"
    echo "   On Linux: sudo systemctl start mongod"
    exit 1
fi

# Check if dump file exists
if [ ! -f "porr_dump.tar.gz" ]; then
    echo "❌ Database dump file not found: porr_dump.tar.gz"
    echo "   Please ensure the dump file is in the dbsetup directory"
    exit 1
fi

echo "📦 Extracting database dump..."
tar -xzf porr_dump.tar.gz

echo "🔄 Importing database..."
mongorestore --db porr porr/

echo "🧹 Cleaning up extracted files..."
rm -rf porr/

echo "✅ Database import completed successfully!"
echo "🌐 Database: porr"
echo "🔗 Connection: mongodb://localhost:27017/porr"