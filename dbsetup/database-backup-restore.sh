#!/bin/bash

# NPST Database Backup and Restore Script
# This script provides comprehensive backup and restore functionality for the remote NPST database

# Database configuration
DB_HOST="localhost"
DB_PORT="27017"
DB_NAME="new_project_stater_template"
DB_USER=""
DB_PASSWORD=""
DB_AUTH_SOURCE=""
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if MongoDB tools are installed
check_mongodb_tools() {
    print_status "Checking MongoDB tools installation..."
    
    if ! command -v mongodump &> /dev/null; then
        print_error "mongodump is not installed!"
        echo "Please install MongoDB Database Tools:"
        echo "  macOS: brew install mongodb/brew/mongodb-database-tools"
        echo "  Ubuntu: sudo apt-get install mongodb-database-tools"
        echo "  CentOS: sudo yum install mongodb-database-tools"
        exit 1
    fi
    
    if ! command -v mongorestore &> /dev/null; then
        print_error "mongorestore is not installed!"
        echo "Please install MongoDB Database Tools:"
        echo "  macOS: brew install mongodb/brew/mongodb-database-tools"
        echo "  Ubuntu: sudo apt-get install mongodb-database-tools"
        echo "  CentOS: sudo yum install mongodb-database-tools"
        exit 1
    fi
    
    print_success "MongoDB tools are installed"
}

# Function to test database connection
test_connection() {
    print_status "Testing database connection..."
    
    if mongosh "mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}" --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
        print_success "Database connection successful"
        return 0
    else
        print_error "Failed to connect to database"
        print_error "Please check your network connection and database credentials"
        return 1
    fi
}

# Function to create backup
backup_database() {
    print_status "Starting database backup..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create backup filename with timestamp
    BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}"
    
    print_status "Creating backup: ${BACKUP_FILE}"
    
    # Perform the backup
    if mongodump \
        --host "$DB_HOST" \
        --port "$DB_PORT" \
        --db "$DB_NAME" \
        --out "$BACKUP_FILE"; then
        
        print_success "Database backup completed successfully"
        
        # Compress the backup
        print_status "Compressing backup..."
        if tar -czf "${BACKUP_FILE}.tar.gz" --exclude='._*' -C "$BACKUP_DIR" "$(basename "$BACKUP_FILE")" 2>/dev/null; then
            print_success "Backup compressed: ${BACKUP_FILE}.tar.gz"
            
            # Remove uncompressed backup
            rm -rf "$BACKUP_FILE"
            print_status "Cleaned up uncompressed backup"
        else
            print_warning "Failed to compress backup, trying alternative method..."
            # Try without extended attributes
            if tar -czf "${BACKUP_FILE}.tar.gz" --no-xattrs -C "$BACKUP_DIR" "$(basename "$BACKUP_FILE")" 2>/dev/null; then
                print_success "Backup compressed: ${BACKUP_FILE}.tar.gz"
                rm -rf "$BACKUP_FILE"
                print_status "Cleaned up uncompressed backup"
            else
                print_warning "Failed to compress backup, keeping uncompressed version"
            fi
        fi
        
        # Show backup size
        BACKUP_SIZE=$(du -h "${BACKUP_FILE}.tar.gz" 2>/dev/null | cut -f1 || echo "Unknown")
        print_success "Backup size: $BACKUP_SIZE"
        
        return 0
    else
        print_error "Database backup failed"
        return 1
    fi
}

# Function to restore database
restore_database() {
    print_status "Starting database restore..."
    
    # Check if backup file exists
    if [ $# -eq 0 ]; then
        print_error "No backup file specified"
        echo "Usage: $0 restore <backup_file.tar.gz>"
        echo "Available backups:"
        ls -la "$BACKUP_DIR"/*.tar.gz 2>/dev/null || echo "No backups found"
        return 1
    fi
    
    BACKUP_FILE="$1"
    
    if [ ! -f "$BACKUP_FILE" ]; then
        print_error "Backup file not found: $BACKUP_FILE"
        return 1
    fi
    
    print_warning "This will REPLACE the current database with the backup!"
    print_warning "All current data will be lost!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        print_status "Restore cancelled"
        return 1
    fi
    
    # Extract backup if it's compressed
    if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
        print_status "Extracting backup file..."
        EXTRACT_DIR="/tmp/NPST_restore_$$"
        mkdir -p "$EXTRACT_DIR"
        
        if tar -xzf "$BACKUP_FILE" -C "$EXTRACT_DIR"; then
            EXTRACTED_BACKUP="$EXTRACT_DIR/$(basename "$BACKUP_FILE" .tar.gz)"
        else
            print_error "Failed to extract backup file"
            rm -rf "$EXTRACT_DIR"
            return 1
        fi
    else
        EXTRACTED_BACKUP="$BACKUP_FILE"
    fi
    
    # Perform the restore
    print_status "Restoring database from: $EXTRACTED_BACKUP"
    
    # Check if there's a subdirectory with the original database name
    # mongodump creates: backup_dir/db_name/collections.bson
    # We need to find the actual database directory inside
    DB_BACKUP_DIR="$EXTRACTED_BACKUP"
    if [ -d "$EXTRACTED_BACKUP" ]; then
        # Look for the first subdirectory (should be the database name)
        SUBDIRS=($(find "$EXTRACTED_BACKUP" -mindepth 1 -maxdepth 1 -type d))
        if [ ${#SUBDIRS[@]} -gt 0 ]; then
            DB_BACKUP_DIR="${SUBDIRS[0]}"
            print_status "Found database backup in: $DB_BACKUP_DIR"
        fi
    fi
    
    if mongorestore \
        --host "$DB_HOST" \
        --port "$DB_PORT" \
        --db "$DB_NAME" \
        --drop \
        "$DB_BACKUP_DIR"; then
        
        print_success "Database restore completed successfully"
        
        # Clean up extracted files if they were created
        if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
            rm -rf "$EXTRACT_DIR"
            print_status "Cleaned up extracted files"
        fi
        
        return 0
    else
        print_error "Database restore failed"
        
        # Clean up extracted files if they were created
        if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
            rm -rf "$EXTRACT_DIR"
        fi
        
        return 1
    fi
}

# Function to list available backups
list_backups() {
    print_status "Available database backups:"
    
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]; then
        ls -lah "$BACKUP_DIR"/*.tar.gz 2>/dev/null | while read -r line; do
            echo "  $line"
        done
    else
        print_warning "No backups found in $BACKUP_DIR"
    fi
}

# Function to show database status
show_status() {
    print_status "Database Status:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: $DB_USER"
    echo "  Auth Source: $DB_AUTH_SOURCE"
    echo ""
    
    if test_connection; then
        print_status "Getting database statistics..."
        mongosh "mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}" --eval "
            print('Collections:');
            db.getCollectionNames().forEach(function(name) {
                var count = db.getCollection(name).countDocuments();
                print('  ' + name + ': ' + count + ' documents');
            });
        " --quiet
    fi
}

# Function to show help
show_help() {
    echo "NPST Database Backup and Restore Script"
    echo ""
    echo "Usage: $0 <command> [options]"
    echo ""
    echo "Commands:"
    echo "  backup                    Create a new database backup"
    echo "  restore <backup_file>    Restore database from backup file"
    echo "  list                     List available backups"
    echo "  status                   Show database status and statistics"
    echo "  test                     Test database connection"
    echo "  help                     Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backup"
    echo "  $0 restore ./backups/NPST_backup_20241223_143022.tar.gz"
    echo "  $0 list"
    echo "  $0 status"
    echo ""
    echo "Configuration:"
    echo "  Database Host: $DB_HOST"
    echo "  Database Port: $DB_PORT"
    echo "  Database Name: $DB_NAME"
    echo "  Backup Directory: $BACKUP_DIR"
}

# Main script logic
case "$1" in
    "backup")
        check_mongodb_tools
        if test_connection; then
            backup_database
        else
            print_error "Cannot proceed with backup due to connection failure"
            exit 1
        fi
        ;;
    "restore")
        check_mongodb_tools
        if test_connection; then
            restore_database "$2"
        else
            print_error "Cannot proceed with restore due to connection failure"
            exit 1
        fi
        ;;
    "list")
        list_backups
        ;;
    "status")
        show_status
        ;;
    "test")
        check_mongodb_tools
        test_connection
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac