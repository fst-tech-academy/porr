#!/usr/bin/env node

/**
 * Test Remote Database Connection for PORR
 * This script tests the connection to the remote PORR database
 */

const mongoose = require('mongoose');

// Remote database configuration
const REMOTE_HOST = '130.255.30.153';
const REMOTE_PORT = '27017';
const REMOTE_DB = 'porr';
const USERNAME = 'porr_user';
const PASSWORD = 'Friday14=';

const CONNECTION_STRING = `mongodb://${USERNAME}:${PASSWORD}@${REMOTE_HOST}:${REMOTE_PORT}/${REMOTE_DB}?authSource=admin`;

async function testConnection() {
    console.log('🧪 Testing remote PORR database connection...');
    console.log(`📍 Server: ${REMOTE_HOST}:${REMOTE_PORT}`);
    console.log(`🗃️  Database: ${REMOTE_DB}`);
    
    try {
        // Connect to MongoDB
        await mongoose.connect(CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 10000,
        });
        
        console.log('✅ Successfully connected to remote PORR database');
        
        // Test database operations
        const db = mongoose.connection.db;
        
        // Check collections
        const collections = await db.listCollections().toArray();
        console.log(`📋 Collections found: ${collections.length}`);
        collections.forEach(col => console.log(`   - ${col.name}`));
        
        // Check users collection
        const usersCollection = db.collection('users');
        const userCount = await usersCollection.countDocuments();
        console.log(`👤 Users in database: ${userCount}`);
        
        if (userCount > 0) {
            const adminUser = await usersCollection.findOne({ role: 'admin' });
            if (adminUser) {
                console.log(`✅ Admin user found: ${adminUser.username} (${adminUser.email})`);
            }
        }
        
        // Check audit events collection
        const auditCollection = db.collection('auditevents');
        const auditCount = await auditCollection.countDocuments();
        console.log(`📝 Audit events: ${auditCount}`);
        
        console.log('\n🎉 Remote database connection test successful!');
        console.log('✅ Database is ready for PORR application');
        
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check if the remote server is accessible');
        console.log('   2. Verify authentication credentials');
        console.log('   3. Ensure the PORR database exists');
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Connection closed');
    }
}

// Run the test
testConnection().catch(console.error);
