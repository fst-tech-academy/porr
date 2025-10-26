const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { generateEmployeeId } = require('../utils/generateId');

// Import models
const Organisation = require('../models/Organisation');
const User = require('../models/User');
const AuditEvent = require('../models/AuditEvent');

// Connect to MongoDB
const connectDB = async () => {
  try {
    // Load environment variables
    require('dotenv').config();
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/new_project_starter_template';
    console.log('🔗 Connecting to:', mongoUri.replace(/:[^:@]+@/, ':****@')); // Hide password in logs
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create default organisation
const createDefaultOrganisation = async () => {
  try {
    console.log('🏢 Creating Default Organisation...');
    
    // Check if default organisation already exists
    const existingOrg = await Organisation.findOne({ name: 'Default Organisation' });
    if (existingOrg) {
      console.log('⚠️  Default Organisation already exists:', existingOrg._id);
      return existingOrg;
    }

    const defaultOrg = await Organisation.create({
      name: 'Default Organisation',
      description: 'Default organisation for the New Project Starter Template system',
      email: 'admin@default-org.com',
      phone: '252611234567',
      address: {
        street: 'Main Street',
        city: 'Garowe',
        state: 'Nugaal',
        country: 'Somalia',
        postalCode: '00000'
      },
      settings: {
        isActive: true,
        maxUsers: 1000,
        features: {
          userManagement: true,
          caseManagement: true,
          offenceRecords: true,
          fileUploads: true,
          emailNotifications: true,
          auditLogging: true,
          dashboardAnalytics: true
        }
      },
      subscription: {
        plan: 'enterprise',
        startDate: new Date(),
        isActive: true
      },
      metadata: {
        createdBy: new mongoose.Types.ObjectId(),
        tags: ['default', 'system', 'initial']
      }
    });

    console.log('✅ Default Organisation created:', defaultOrg._id);
    return defaultOrg;
  } catch (error) {
    console.error('❌ Error creating default organisation:', error);
    throw error;
  }
};

// Create super admin user
const createSuperAdmin = async (organisationId) => {
  try {
    console.log('👑 Creating Super Admin User...');
    
    // Check if super admin already exists
    const existingSuperAdmin = await User.findOne({ 
      role: 'super_admin',
      organisationId: organisationId 
    });
    
    if (existingSuperAdmin) {
      console.log('⚠️  Super Admin already exists:', existingSuperAdmin.email);
      return existingSuperAdmin;
    }

    // Generate credentials
    const username = 'superadmin';
    const password = 'SuperAdmin@2024!';
    const email = 'superadmin@default-org.com';
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const superAdmin = await User.create({
      firstName: 'Super',
      lastName: 'Administrator',
      username: username,
      email: email,
      password: hashedPassword,
      nationalId: 'SUPER001',
      role: 'super_admin',
      phone: '+252-61-999-0000',
      gender: 'male',
      employeeId: generateEmployeeId(),
      organisationId: organisationId,
      isActive: true,
      emailVerified: true
    });

    console.log('✅ Super Admin created successfully!');
    console.log('📧 Email:', email);
    console.log('👤 Username:', username);
    console.log('🔑 Password:', password);
    console.log('🆔 User ID:', superAdmin._id);
    
    return superAdmin;
  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  }
};

// Assign all existing documents to the default organisation
const assignDocumentsToOrganisation = async (organisationId) => {
  try {
    console.log('📄 Assigning existing documents to Default Organisation...');
    
    // Update all users without organisationId
    const userUpdateResult = await User.updateMany(
      { organisationId: { $exists: false } },
      { $set: { organisationId: organisationId } }
    );
    console.log(`👥 Updated ${userUpdateResult.modifiedCount} users with organisationId`);

    // Update all audit events without organisationId
    const auditUpdateResult = await AuditEvent.updateMany(
      { organisationId: { $exists: false } },
      { $set: { organisationId: organisationId } }
    );
    console.log(`📊 Updated ${auditUpdateResult.modifiedCount} audit events with organisationId`);

    // Note: Other collections (Property, Tenant, etc.) were removed as per requirements
    console.log('✅ All existing documents assigned to Default Organisation');
  } catch (error) {
    console.error('❌ Error assigning documents to organisation:', error);
    throw error;
  }
};

// Main setup function
const setupDefaultOrganisation = async () => {
  try {
    console.log('🚀 Starting Default Organisation Setup...\n');
    
    // Connect to database
    await connectDB();
    
    // Create default organisation
    const defaultOrg = await createDefaultOrganisation();
    
    // Create super admin user
    const superAdmin = await createSuperAdmin(defaultOrg._id);
    
    // Assign all existing documents to the organisation
    await assignDocumentsToOrganisation(defaultOrg._id);
    
    console.log('\n🎉 Default Organisation Setup Complete!');
    console.log('='.repeat(50));
    console.log('📋 SUMMARY:');
    console.log(`🏢 Organisation ID: ${defaultOrg._id}`);
    console.log(`👑 Super Admin ID: ${superAdmin._id}`);
    console.log('📧 Email: superadmin@default-org.com');
    console.log('👤 Username: superadmin');
    console.log('🔑 Password: SuperAdmin@2024!');
    console.log('='.repeat(50));
    
  } catch (error) {
    console.error('❌ Setup failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the setup
if (require.main === module) {
  setupDefaultOrganisation();
}

module.exports = {
  setupDefaultOrganisation,
  createDefaultOrganisation,
  createSuperAdmin,
  assignDocumentsToOrganisation
};
