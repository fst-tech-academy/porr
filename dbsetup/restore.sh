#!/bin/bash

# Simple wrapper script for PORR database restore
# Usage: ./restore.sh [backup_file]

echo "🔄 PORR Database Restore"
echo "========================"

# Change to the dbsetup directory
cd "$(dirname "$0")"

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "❌ No backup file specified"
    echo ""
    echo "Usage: ./restore.sh <backup_file>"
    echo ""
    echo "Available backups:"
    ./database-backup-restore.sh list
    echo ""
    echo "Example:"
    echo "  ./restore.sh ./backups/porr_backup_20241223_143022.tar.gz"
    exit 1
fi

# Run the restore
./database-backup-restore.sh restore "$1"

# Check if restore was successful
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Restore completed!"
else
    echo ""
    echo "❌ Restore failed!"
    echo "Please check the error messages above and try again."
    exit 1
fi