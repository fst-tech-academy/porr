const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Organisation = require('../models/Organisation');
const User = require('../models/User');
const AuditEvent = require('../models/AuditEvent');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/new_project_starter_template';
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Update all collections to use default organisation
const updateAllToDefaultOrg = async () => {
  try {
    console.log('🚀 Starting update of all collections to default organisation...\n');
    
    // Get the default organisation
    const defaultOrg = await Organisation.findOne({ name: 'Default Organisation' });
    if (!defaultOrg) {
      console.error('❌ Default Organisation not found!');
      console.log('💡 Please run: node scripts/setup-default-organisation.js first');
      process.exit(1);
    }
    
    const defaultOrgId = defaultOrg._id;
    console.log('✅ Found Default Organisation:', defaultOrg.name);
    console.log('📋 Organisation ID:', defaultOrgId.toString());
    console.log('');
    
    // Update Users
    console.log('👥 Updating Users...');
    const userUpdateResult = await User.updateMany(
      { 
        organisationId: { $ne: defaultOrgId },
        role: { $ne: 'super_admin' } // Don't update super_admin users
      },
      { $set: { organisationId: defaultOrgId } }
    );
    console.log(`   ✅ Updated ${userUpdateResult.modifiedCount} users`);
    
    // Update Audit Events
    console.log('📊 Updating Audit Events...');
    const auditUpdateResult = await AuditEvent.updateMany(
      { organisationId: { $exists: false } },
      { $set: { organisationId: defaultOrgId } }
    );
    console.log(`   ✅ Updated ${auditUpdateResult.modifiedCount} audit events`);
    
    // Also update audit events that have null organisationId
    const auditUpdateResult2 = await AuditEvent.updateMany(
      { organisationId: null },
      { $set: { organisationId: defaultOrgId } }
    );
    console.log(`   ✅ Updated ${auditUpdateResult2.modifiedCount} audit events with null organisationId`);
    
    // Get counts for summary
    const totalUsers = await User.countDocuments({ organisationId: defaultOrgId });
    const totalAuditEvents = await AuditEvent.countDocuments({ organisationId: defaultOrgId });
    
    console.log('\n🎉 Update Complete!');
    console.log('='.repeat(50));
    console.log('📋 SUMMARY:');
    console.log(`🏢 Default Organisation: ${defaultOrg.name}`);
    console.log(`🆔 Organisation ID: ${defaultOrgId.toString()}`);
    console.log(`👥 Total Users in organisation: ${totalUsers}`);
    console.log(`📊 Total Audit Events in organisation: ${totalAuditEvents}`);
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Update failed:', error);
    throw error;
  }
};

// Main execution
const run = async () => {
  try {
    await connectDB();
    await updateAllToDefaultOrg();
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the script
if (require.main === module) {
  run();
}

module.exports = { updateAllToDefaultOrg };

