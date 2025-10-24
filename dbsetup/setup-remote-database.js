#!/usr/bin/env node

/**
 * Setup Remote Database for PORR
 * This script connects to the remote MongoDB server and creates the PORR database
 */

const { MongoClient } = require('mongodb');

// Remote database configuration
const REMOTE_HOST = '130.255.30.153';
const REMOTE_PORT = '27017';
const REMOTE_DB = 'porr';
const USERNAME = 'porr_user';
const PASSWORD = 'Friday14=';

// Connection strings
const CONNECTION_STRING_WITH_AUTH = `mongodb://${USERNAME}:${PASSWORD}@${REMOTE_HOST}:${REMOTE_PORT}/${REMOTE_DB}?authSource=admin`;
const CONNECTION_STRING_WITHOUT_AUTH = `mongodb://${REMOTE_HOST}:${REMOTE_PORT}/${REMOTE_DB}`;

async function setupRemoteDatabase() {
    let client;
    
    console.log('🗄️  Setting up remote PORR database...');
    console.log(`📍 Remote server: ${REMOTE_HOST}:${REMOTE_PORT}`);
    console.log(`🗃️  Target database: ${REMOTE_DB}`);
    
    try {
        // Try connecting with authentication first
        console.log('🔐 Attempting connection with authentication...');
        client = new MongoClient(CONNECTION_STRING_WITH_AUTH, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        
        await client.connect();
        console.log('✅ Connected to remote MongoDB with authentication');
        
    } catch (authError) {
        console.log('⚠️  Authentication failed, trying without auth...');
        
        try {
            // Try connecting without authentication
            client = new MongoClient(CONNECTION_STRING_WITHOUT_AUTH, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                serverSelectionTimeoutMS: 10000,
            });
            
            await client.connect();
            console.log('✅ Connected to remote MongoDB without authentication');
            
        } catch (noAuthError) {
            console.error('❌ Failed to connect to remote MongoDB');
            console.error('   Authentication error:', authError.message);
            console.error('   No auth error:', noAuthError.message);
            console.log('\n🔧 Troubleshooting steps:');
            console.log('   1. Verify MongoDB is running on the remote server');
            console.log('   2. Check if the server is accessible from your network');
            console.log('   3. Verify firewall settings');
            console.log('   4. Test connection manually: mongosh --host 130.255.30.153 --port 27017');
            process.exit(1);
        }
    }
    
    try {
        const db = client.db(REMOTE_DB);
        
        // Check if database exists
        console.log('🔍 Checking if PORR database exists...');
        const adminDb = client.db().admin();
        const databases = await adminDb.listDatabases();
        const dbExists = databases.databases.some(db => db.name === REMOTE_DB);
        
        if (dbExists) {
            console.log('✅ PORR database already exists');
        } else {
            console.log('📝 Creating PORR database...');
            // Create database by creating a collection
            await db.createCollection('users');
            console.log('✅ PORR database created successfully');
        }
        
        // Create initial collections and indexes
        console.log('📋 Setting up collections and indexes...');
        
        // Users collection
        const usersCollection = db.collection('users');
        await usersCollection.createIndex({ email: 1 }, { unique: true });
        await usersCollection.createIndex({ username: 1 }, { unique: true });
        console.log('✅ Users collection and indexes created');
        
        // Audit events collection
        const auditCollection = db.collection('auditevents');
        await auditCollection.createIndex({ userId: 1 });
        await auditCollection.createIndex({ timestamp: -1 });
        await auditCollection.createIndex({ action: 1 });
        console.log('✅ Audit events collection and indexes created');
        
        // Create initial admin user if no users exist
        const userCount = await usersCollection.countDocuments();
        if (userCount === 0) {
            console.log('👤 Creating initial admin user...');
            
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('admin123', 12);
            
            const adminUser = {
                username: 'admin',
                email: 'admin@porr.gov',
                password: hashedPassword,
                role: 'admin',
                isActive: true,
                profile: {
                    firstName: 'System',
                    lastName: 'Administrator',
                    phone: '',
                    department: 'IT'
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            await usersCollection.insertOne(adminUser);
            console.log('✅ Initial admin user created');
            console.log('   Username: admin');
            console.log('   Email: admin@porr.gov');
            console.log('   Password: admin123');
            console.log('   ⚠️  Please change the password after first login!');
        } else {
            console.log(`✅ Database already contains ${userCount} users`);
        }
        
        // Test database connection
        console.log('🧪 Testing database connection...');
        const stats = await db.stats();
        console.log('✅ Database connection test successful');
        console.log(`📊 Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
        
        console.log('\n🎉 Remote PORR database setup completed successfully!');
        console.log('\n📋 Database Details:');
        console.log(`   Host: ${REMOTE_HOST}`);
        console.log(`   Port: ${REMOTE_PORT}`);
        console.log(`   Database: ${REMOTE_DB}`);
        console.log(`   Connection String: ${CONNECTION_STRING_WITH_AUTH}`);
        
        console.log('\n🚀 Next steps:');
        console.log('   1. Copy server/env.example to server/.env');
        console.log('   2. Update MONGODB_URI in .env file');
        console.log('   3. Start the application: npm run dev');
        
    } catch (error) {
        console.error('❌ Error setting up database:', error.message);
        process.exit(1);
    } finally {
        if (client) {
            await client.close();
            console.log('🔌 Database connection closed');
        }
    }
}

// Run the setup
setupRemoteDatabase().catch(console.error);
