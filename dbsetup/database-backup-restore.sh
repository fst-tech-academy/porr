#!/bin/bash

# Puntland Offenders Registry and Records (PORR) Database Backup and Restore Script
# This script provides comprehensive backup and restore functionality for the PORR database

# Database configuration - will be loaded from server/.env
DB_HOST=""
DB_PORT=""
DB_NAME=""
DB_USER=""
DB_PASSWORD=""
DB_AUTH_SOURCE=""
MONGODB_URI=""
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Path to server .env file
SERVER_ENV_FILE="../server/.env"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to load environment variables from server/.env file
load_env_config() {
    print_status "Loading database configuration from $SERVER_ENV_FILE..."
    
    if [ ! -f "$SERVER_ENV_FILE" ]; then
        print_error "Environment file not found: $SERVER_ENV_FILE"
        print_error "Please create a .env file in the server directory with your MongoDB configuration"
        print_error "Example .env file content:"
        echo "  MONGODB_URI=mongodb://username:password@host:port/database_name"
        echo "  # or separate variables:"
        echo "  DB_HOST=your_host"
        echo "  DB_PORT=27017"
        echo "  DB_NAME=your_database"
        echo "  DB_USER=your_username"
        echo "  DB_PASSWORD=your_password"
        echo "  DB_AUTH_SOURCE=admin"
        exit 1
    fi
    
    # Source the .env file
    set -a  # automatically export all variables
    source "$SERVER_ENV_FILE"
    set +a  # stop automatically exporting
    
    # Parse MONGODB_URI if it exists
    if [ -n "$MONGODB_URI" ]; then
        print_status "Parsing MONGODB_URI: $MONGODB_URI"
        
        # Extract components from MongoDB URI
        # Format: mongodb://[username:password@]host[:port]/database[?options]
        if [[ $MONGODB_URI =~ mongodb://(.*) ]]; then
            URI_PART="${BASH_REMATCH[1]}"
            
            # Check if credentials are present
            if [[ $URI_PART =~ ^([^:]+):([^@]+)@(.*)$ ]]; then
                DB_USER="${BASH_REMATCH[1]}"
                DB_PASSWORD="${BASH_REMATCH[2]}"
                URI_PART="${BASH_REMATCH[3]}"
            fi
            
            # Extract host, port, database, and query parameters
            if [[ $URI_PART =~ ^([^:/]+)(:([0-9]+))?/(.*)$ ]]; then
                DB_HOST="${BASH_REMATCH[1]}"
                DB_PORT="${BASH_REMATCH[3]:-27017}"  # Default to 27017 if not specified
                DB_NAME_WITH_PARAMS="${BASH_REMATCH[4]}"
                
                # Separate database name from query parameters
                if [[ $DB_NAME_WITH_PARAMS =~ ^([^?]+)(\?(.*))?$ ]]; then
                    DB_NAME="${BASH_REMATCH[1]}"
                    QUERY_PARAMS="${BASH_REMATCH[3]}"
                    
                    # Parse query parameters
                    if [ -n "$QUERY_PARAMS" ]; then
                        # Extract authSource parameter
                        if [[ $QUERY_PARAMS =~ authSource=([^&]+) ]]; then
                            DB_AUTH_SOURCE="${BASH_REMATCH[1]}"
                        fi
                    fi
                else
                    DB_NAME="$DB_NAME_WITH_PARAMS"
                fi
            fi
        fi
    fi
    
    # Use individual variables if MONGODB_URI is not set or incomplete
    if [ -z "$DB_HOST" ] && [ -n "$DB_HOST_ENV" ]; then
        DB_HOST="$DB_HOST_ENV"
    fi
    if [ -z "$DB_PORT" ] && [ -n "$DB_PORT_ENV" ]; then
        DB_PORT="$DB_PORT_ENV"
    fi
    if [ -z "$DB_NAME" ] && [ -n "$DB_NAME_ENV" ]; then
        DB_NAME="$DB_NAME_ENV"
    fi
    if [ -z "$DB_USER" ] && [ -n "$DB_USER_ENV" ]; then
        DB_USER="$DB_USER_ENV"
    fi
    if [ -z "$DB_PASSWORD" ] && [ -n "$DB_PASSWORD_ENV" ]; then
        DB_PASSWORD="$DB_PASSWORD_ENV"
    fi
    if [ -z "$DB_AUTH_SOURCE" ] && [ -n "$DB_AUTH_SOURCE_ENV" ]; then
        DB_AUTH_SOURCE="$DB_AUTH_SOURCE_ENV"
    fi
    
    # Set defaults if still empty
    DB_HOST="${DB_HOST:-localhost}"
    DB_PORT="${DB_PORT:-27017}"
    DB_NAME="${DB_NAME:-new_project_starter_template}"
    
    print_success "Database configuration loaded:"
    echo "  Host: $DB_HOST"
    echo "  Port: $DB_PORT"
    echo "  Database: $DB_NAME"
    echo "  User: ${DB_USER:-'<not set>'}"
    echo "  Auth Source: ${DB_AUTH_SOURCE:-'<not set>'}"
}

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
    
    # Build connection string
    if [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ]; then
        # With authentication
        if [ -n "$DB_AUTH_SOURCE" ]; then
            CONNECTION_STRING="mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTH_SOURCE}"
        else
            CONNECTION_STRING="mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
        fi
    else
        # Without authentication
        CONNECTION_STRING="mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}"
    fi
    
    print_status "Testing connection to: ${CONNECTION_STRING//:${DB_PASSWORD}@/:***@}"
    
    if mongosh "$CONNECTION_STRING" --eval "db.runCommand('ping')" --quiet > /dev/null 2>&1; then
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
    
    # Build mongodump arguments
    DUMP_ARGS=(
        --host "$DB_HOST"
        --port "$DB_PORT"
        --db "$DB_NAME"
        --out "$BACKUP_FILE"
    )
    
    # Add authentication if credentials are provided
    if [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ]; then
        DUMP_ARGS+=(
            --username "$DB_USER"
            --password "$DB_PASSWORD"
        )
        if [ -n "$DB_AUTH_SOURCE" ]; then
            DUMP_ARGS+=(--authenticationDatabase "$DB_AUTH_SOURCE")
        fi
    fi
    
    # Perform the backup
    if mongodump "${DUMP_ARGS[@]}"; then
        
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
            # Find the actual extracted directory (handle different naming conventions)
            EXTRACTED_DIRS=($(find "$EXTRACT_DIR" -mindepth 1 -maxdepth 1 -type d))
            if [ ${#EXTRACTED_DIRS[@]} -gt 0 ]; then
                EXTRACTED_BACKUP="${EXTRACTED_DIRS[0]}"
                print_status "Found extracted backup directory: $EXTRACTED_BACKUP"
            else
                print_error "No directory found in extracted backup"
                rm -rf "$EXTRACT_DIR"
                return 1
            fi
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
    # mongorestore expects: backup_dir (containing db_name subdirectory)
    DB_BACKUP_DIR="$EXTRACTED_BACKUP"
    ORIGINAL_DB_NAME=""
    
    if [ -d "$EXTRACTED_BACKUP" ]; then
        # Look for the first subdirectory (should be the database name)
        SUBDIRS=($(find "$EXTRACTED_BACKUP" -mindepth 1 -maxdepth 1 -type d))
        if [ ${#SUBDIRS[@]} -gt 0 ]; then
            ORIGINAL_DB_NAME=$(basename "${SUBDIRS[0]}")
            print_status "Found database backup in: ${SUBDIRS[0]}"
            print_status "Original database name: $ORIGINAL_DB_NAME"
            # mongorestore expects the parent directory, not the database directory itself
            DB_BACKUP_DIR="$EXTRACTED_BACKUP"
        fi
    fi
    
    # Verify the backup directory exists and contains .bson files
    if [ ! -d "$DB_BACKUP_DIR" ]; then
        print_error "Backup directory not found: $DB_BACKUP_DIR"
        if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
            rm -rf "$EXTRACT_DIR"
        fi
        return 1
    fi
    
    # Check for .bson files in the database subdirectory
    DATABASE_SUBDIR="$DB_BACKUP_DIR/$ORIGINAL_DB_NAME"
    if [ ! -d "$DATABASE_SUBDIR" ]; then
        print_error "Database subdirectory not found: $DATABASE_SUBDIR"
        if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
            rm -rf "$EXTRACT_DIR"
        fi
        return 1
    fi
    
    BSON_COUNT=$(find "$DATABASE_SUBDIR" -name "*.bson" | wc -l | tr -d ' ')
    if [ "$BSON_COUNT" -eq 0 ]; then
        print_error "No .bson files found in database directory: $DATABASE_SUBDIR"
        if [[ "$BACKUP_FILE" == *.tar.gz ]]; then
            rm -rf "$EXTRACT_DIR"
        fi
        return 1
    fi
    print_status "Found $BSON_COUNT collection(s) to restore"
    
    # Build mongorestore arguments
    RESTORE_ARGS=(
        --host "$DB_HOST"
        --port "$DB_PORT"
        --drop
    )
    
    # Add authentication if credentials are provided
    if [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ]; then
        RESTORE_ARGS+=(
            --username "$DB_USER"
            --password "$DB_PASSWORD"
        )
        if [ -n "$DB_AUTH_SOURCE" ]; then
            RESTORE_ARGS+=(--authenticationDatabase "$DB_AUTH_SOURCE")
        fi
    fi
    
    # If database name changed, use namespace remapping
    if [ "$ORIGINAL_DB_NAME" != "$DB_NAME" ]; then
        print_status "Remapping database from '$ORIGINAL_DB_NAME' to '$DB_NAME'"
        RESTORE_ARGS+=(
            --nsFrom="${ORIGINAL_DB_NAME}.*"
            --nsTo="${DB_NAME}.*"
        )
    fi
    
    RESTORE_ARGS+=("$DB_BACKUP_DIR")
    
    print_status "Executing mongorestore..."
    
    if mongorestore "${RESTORE_ARGS[@]}"; then
        
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
        
        # Build connection string for mongosh
        if [ -n "$DB_USER" ] && [ -n "$DB_PASSWORD" ]; then
            if [ -n "$DB_AUTH_SOURCE" ]; then
                CONNECTION_STRING="mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}?authSource=${DB_AUTH_SOURCE}"
            else
                CONNECTION_STRING="mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
            fi
        else
            CONNECTION_STRING="mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}"
        fi
        
        mongosh "$CONNECTION_STRING" --eval "
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
    echo "Puntland Offenders Registry and Records (PORR) Database Backup and Restore Script"
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
    echo "  Environment File: $SERVER_ENV_FILE"
    echo "  Backup Directory: $BACKUP_DIR"
    echo ""
    echo "The script reads database configuration from the server/.env file."
    echo "Required environment variables:"
    echo "  MONGODB_URI=mongodb://username:password@host:port/database_name"
    echo "  # OR separate variables:"
    echo "  DB_HOST=your_host"
    echo "  DB_PORT=27017"
    echo "  DB_NAME=your_database"
    echo "  DB_USER=your_username"
    echo "  DB_PASSWORD=your_password"
    echo "  DB_AUTH_SOURCE=admin"
}

# Main script logic
case "$1" in
    "backup")
        load_env_config
        check_mongodb_tools
        if test_connection; then
            backup_database
        else
            print_error "Cannot proceed with backup due to connection failure"
            exit 1
        fi
        ;;
    "restore")
        load_env_config
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
        load_env_config
        show_status
        ;;
    "test")
        load_env_config
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