# PORR Database Backup and Restore

This directory contains comprehensive scripts for backing up and restoring the PORR remote database.

## 🗄️ Available Scripts

### Main Script
- **`database-backup-restore.sh`** - Full-featured backup and restore script with all options

### Simple Wrappers
- **`backup.sh`** - Simple backup script
- **`restore.sh`** - Simple restore script

## 🚀 Quick Start

### Create a Backup
```bash
# Simple backup
./backup.sh

# Or use the main script
./database-backup-restore.sh backup
```

### Restore from Backup
```bash
# List available backups first
./database-backup-restore.sh list

# Restore from a specific backup
./restore.sh ./backups/porr_backup_20241223_143022.tar.gz

# Or use the main script
./database-backup-restore.sh restore ./backups/porr_backup_20241223_143022.tar.gz
```

## 📋 Full Command Reference

### Main Script Commands

```bash
# Create a new backup
./database-backup-restore.sh backup

# Restore from backup
./database-backup-restore.sh restore <backup_file>

# List available backups
./database-backup-restore.sh list

# Show database status and statistics
./database-backup-restore.sh status

# Test database connection
./database-backup-restore.sh test

# Show help
./database-backup-restore.sh help
```

## 🔧 Configuration

The script is pre-configured for the PORR remote database:

- **Host**: 130.255.30.153
- **Port**: 27017
- **Database**: porr
- **Username**: cscs_user
- **Password**: Friday14=
- **Auth Source**: admin
- **Backup Directory**: ./backups/

## 📁 Backup Structure

Backups are stored in the `./backups/` directory with the following naming convention:
```
porr_backup_YYYYMMDD_HHMMSS.tar.gz
```

Example: `porr_backup_20241223_143022.tar.gz`

## ⚠️ Important Notes

### Before Restoring
- **WARNING**: Restore operations will **REPLACE** the current database
- All existing data will be **LOST**
- Always create a backup before restoring
- The script will ask for confirmation before proceeding

### Prerequisites
- MongoDB Database Tools must be installed
- Network access to the remote database (130.255.30.153:27017)
- Valid database credentials

### Installing MongoDB Tools

**macOS:**
```bash
brew install mongodb/brew/mongodb-database-tools
```

**Ubuntu/Debian:**
```bash
sudo apt-get install mongodb-database-tools
```

**CentOS/RHEL:**
```bash
sudo yum install mongodb-database-tools
```

## 🔍 Monitoring and Status

### Check Database Status
```bash
./database-backup-restore.sh status
```

This will show:
- Database connection status
- Collection names and document counts
- Database configuration

### Test Connection
```bash
./database-backup-restore.sh test
```

### List Available Backups
```bash
./database-backup-restore.sh list
```

## 🛠️ Troubleshooting

### Common Issues

1. **"mongodump is not installed"**
   - Install MongoDB Database Tools (see Prerequisites)

2. **"Failed to connect to database"**
   - Check network connectivity: `ping 130.255.30.153`
   - Verify database credentials
   - Check if the remote server is accessible

3. **"Backup file not found"**
   - Use `./database-backup-restore.sh list` to see available backups
   - Check the file path is correct

4. **"Permission denied"**
   - Make sure scripts are executable: `chmod +x *.sh`

### Network Testing
```bash
# Test network connectivity
ping 130.255.30.153

# Test MongoDB port
telnet 130.255.30.153 27017

# Test MongoDB connection directly
mongosh "mongodb://porr_user:Friday14=@130.255.30.153:27017/porr?authSource=admin"
```

## 📊 Backup Best Practices

1. **Regular Backups**: Create backups before major changes
2. **Test Restores**: Periodically test restore procedures
3. **Secure Storage**: Keep backups in a secure location
4. **Retention Policy**: Implement a backup retention policy
5. **Documentation**: Keep track of backup dates and purposes

## 🔒 Security Considerations

- Database credentials are embedded in the script
- Backups may contain sensitive data
- Store backups securely
- Consider encrypting backup files for long-term storage
- Regularly rotate database passwords

## 📈 Example Workflow

### Daily Backup Routine
```bash
# 1. Create backup
./backup.sh

# 2. Verify backup was created
./database-backup-restore.sh list

# 3. Check database status
./database-backup-restore.sh status
```

### Before Major Changes
```bash
# 1. Create backup
./backup.sh

# 2. Make your changes
# ... your development work ...

# 3. If something goes wrong, restore
./restore.sh ./backups/porr_backup_20241223_143022.tar.gz
```

### Testing Restore
```bash
# 1. Create backup
./backup.sh

# 2. Test restore to a different database (if needed)
# Note: This script restores to the same database

# 3. Verify data integrity
./database-backup-restore.sh status
```

## 🆘 Emergency Recovery

In case of data loss:

1. **Stop the application** to prevent further data corruption
2. **Identify the latest good backup** using `./database-backup-restore.sh list`
3. **Restore from backup** using `./restore.sh <backup_file>`
4. **Verify the restore** using `./database-backup-restore.sh status`
5. **Restart the application**

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Verify network connectivity to the remote database
3. Ensure MongoDB Database Tools are properly installed
4. Check database credentials and permissions
5. Review the script output for specific error messages

---

**Remember**: Always test your backup and restore procedures in a safe environment before relying on them in production!