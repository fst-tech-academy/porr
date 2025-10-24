# Remote PORR Database Setup

This document provides information about the remote PORR database setup and configuration.

## Database Details

- **Host**: 130.255.30.153
- **Port**: 27017
- **Database Name**: porr
- **Authentication**: Required
- **Username**: porr_user
- **Password**: Friday14=
- **Auth Source**: admin

## Connection String

```
mongodb://porr_user:Friday14=@130.255.30.153:27017/porr?authSource=admin
```

## Database Status

✅ **Database Created**: The PORR database has been successfully created on the remote server.

✅ **Collections Created**:
- `users` - User accounts and authentication
- `auditevents` - System audit logs

✅ **Indexes Created**:
- Users: email (unique), username (unique)
- Audit Events: userId, timestamp, action

✅ **Initial Admin User Created**:
- Username: `admin`
- Email: `admin@porr.gov`
- Password: `admin123`
- Role: `admin`

⚠️ **Important**: Change the admin password after first login!

## Environment Configuration

The server environment file (`.env`) has been configured with the remote database connection:

```env
MONGODB_URI=mongodb://porr_user:Friday14=@130.255.30.153:27017/porr?authSource=admin
```

## Testing Connection

### Test Scripts Available

1. **Setup Script**: `dbsetup/setup-remote-database.js`
   - Creates database and collections
   - Sets up indexes
   - Creates initial admin user

2. **Connection Test**: `dbsetup/test-remote-connection.js`
   - Tests database connectivity
   - Verifies collections exist
   - Checks user count

3. **Server Test**: `server/test-connection.js`
   - Tests connection from server context
   - Verifies User model works

### Running Tests

```bash
# Test remote database connection
node dbsetup/test-remote-connection.js

# Test server connection
cd server && node test-connection.js
```

## Database Management

### Backup Database
```bash
mongodump --host 130.255.30.153 --port 27017 --db porr --username porr_user --password Friday14= --authenticationDatabase admin --out ./backup
```

### Restore Database
```bash
mongorestore --host 130.255.30.153 --port 27017 --db porr --username porr_user --password Friday14= --authenticationDatabase admin ./backup/porr
```

### Connect with MongoDB Shell
```bash
mongosh "mongodb://porr_user:Friday14=@130.255.30.153:27017/porr?authSource=admin"
```

## Security Considerations

1. **Change Default Password**: The initial admin password should be changed immediately
2. **Network Security**: Ensure the remote server is properly secured
3. **Access Control**: Monitor database access and user permissions
4. **Regular Backups**: Implement automated backup procedures
5. **SSL/TLS**: Consider enabling SSL for production use

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Check if the remote server is accessible
   - Verify firewall settings
   - Test network connectivity

2. **Authentication Failed**
   - Verify username and password
   - Check authSource parameter
   - Ensure user has proper permissions

3. **Database Not Found**
   - Run the setup script to create the database
   - Verify the database name in connection string

### Connection Test Commands

```bash
# Test network connectivity
ping 130.255.30.153

# Test MongoDB port
telnet 130.255.30.153 27017

# Test MongoDB connection
mongosh "mongodb://porr_user:Friday14=@130.255.30.153:27017/porr?authSource=admin"
```

## Next Steps

1. ✅ Database created and configured
2. ✅ Environment variables set
3. ✅ Initial admin user created
4. 🚀 Ready to start the PORR application

To start the application:
```bash
npm run dev
```

The application will connect to the remote PORR database and be ready for development.
