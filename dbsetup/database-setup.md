# Database Setup for PORR

This document provides instructions for setting up the MongoDB database for the Puntland Offence Records Registry (PORR) system.

## Prerequisites

- MongoDB installed and running
- Node.js and npm installed
- Access to the project directory

## Database Configuration

The PORR system uses MongoDB as its primary database. The default database name is `porr`.

### Environment Configuration

Update your `.env` file in the server directory:

```env
MONGODB_URI=mongodb://localhost:27017/porr
```

## Database Collections

The PORR system uses the following main collections:

### Core Collections
- **users** - System users and authentication data
- **auditevents** - System audit logs and activity tracking

### Collection Schemas

#### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  password: String (hashed),
  role: String, // 'admin', 'manager', 'officer', 'viewer'
  isActive: Boolean,
  profile: {
    firstName: String,
    lastName: String,
    phone: String,
    department: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Audit Events Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  action: String,
  resource: String,
  resourceId: String,
  details: Object,
  ipAddress: String,
  userAgent: String,
  timestamp: Date
}
```

## Database Setup Commands

### 1. Start MongoDB
```bash
# On macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# On Linux
sudo systemctl start mongod

# On Windows
net start MongoDB
```

### 2. Create Database
```bash
# Connect to MongoDB
mongosh

# Create and use the PORR database
use porr

# Create initial collections (optional - they will be created automatically)
db.createCollection("users")
db.createCollection("auditevents")
```

### 3. Create Initial Admin User
```bash
# Run the server to create initial admin user
cd server
npm run dev
```

The system will automatically create an admin user on first startup if no users exist.

## Database Backup and Restore

### Backup Database
```bash
# Create backup
mongodump --db porr --out ./backup

# Create compressed backup
mongodump --db porr --archive=porr_backup.gz --gzip
```

### Restore Database
```bash
# Restore from backup
mongorestore --db porr ./backup/porr

# Restore from compressed backup
mongorestore --db porr --archive=porr_backup.gz --gzip
```

## Database Maintenance

### Index Creation
```javascript
// Connect to MongoDB
use porr

// Create indexes for better performance
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })
db.auditevents.createIndex({ "userId": 1 })
db.auditevents.createIndex({ "timestamp": -1 })
db.auditevents.createIndex({ "action": 1 })
```

### Database Statistics
```javascript
// Get database stats
db.stats()

// Get collection stats
db.users.stats()
db.auditevents.stats()
```

## Security Considerations

1. **Authentication**: Ensure MongoDB authentication is enabled in production
2. **Network Security**: Restrict MongoDB access to authorized IP addresses
3. **Data Encryption**: Consider encrypting sensitive data at rest
4. **Regular Backups**: Implement automated backup procedures
5. **Access Control**: Use MongoDB's built-in role-based access control

## Troubleshooting

### Common Issues

1. **Connection Refused**
   - Ensure MongoDB is running
   - Check if the port (27017) is accessible
   - Verify firewall settings

2. **Authentication Failed**
   - Check username and password
   - Verify database permissions
   - Ensure authentication is properly configured

3. **Database Not Found**
   - Verify the database name in MONGODB_URI
   - Check if the database exists
   - Ensure proper connection string format

### Log Files
- MongoDB logs: `/var/log/mongodb/mongod.log` (Linux)
- MongoDB logs: `/usr/local/var/log/mongodb/mongo.log` (macOS)

## Production Considerations

1. **Replica Sets**: Consider using MongoDB replica sets for high availability
2. **Sharding**: Implement sharding for large-scale deployments
3. **Monitoring**: Set up MongoDB monitoring and alerting
4. **Performance**: Optimize queries and indexes for production workloads
5. **Backup Strategy**: Implement comprehensive backup and disaster recovery procedures