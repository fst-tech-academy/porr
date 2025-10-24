#!/bin/bash

# Simple wrapper script for NPST database backup
# Usage: ./backup.sh

echo "🗄️  NPST Database Backup"
echo "========================="

# Change to the dbsetup directory
cd "$(dirname "$0")"

# Run the backup
./database-backup-restore.sh backup

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Backup completed!"
    echo "📁 Check the ./backups/ directory for your backup file"
else
    echo ""
    echo "❌ Backup failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi