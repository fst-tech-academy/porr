const mongoose = require('mongoose');
require('dotenv').config();

const Organisation = require('../models/Organisation');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('❌ MONGODB_URI is not set in environment');
      process.exit(1);
    }
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

const ensureDefaultOrganisation = async () => {
  // Tries common default organisation names
  const candidates = [
    { name: 'Default Organisation' },
    { name: 'Default Organization' },
    { name: 'Default Org' }
  ];

  let org = await Organisation.findOne({ name: { $in: candidates.map(c => c.name) } });
  if (org) return org;

  // Fallback: create a minimal default org
  console.log('ℹ️ Default Organisation not found. Creating one...');
  org = await Organisation.create({
    name: 'Default Organisation',
    code: 'DEFAULT-ORG',
    isActive: true
  });
  console.log('✅ Created Default Organisation:', org._id.toString());
  return org;
};

const migrateAllUsersToDefaultOrg = async () => {
  const defaultOrg = await ensureDefaultOrganisation();
  const defaultOrgId = defaultOrg._id;

  console.log('👥 Migrating all users to Default Organisation:', defaultOrg.name);

  // Set organisationId for ALL users (including super_admin) to Default Organisation
  const result = await User.updateMany(
    {},
    { $set: { organisationId: defaultOrgId } }
  );

  console.log(`   ✅ Matched: ${result.matchedCount || result.n} | Modified: ${result.modifiedCount || result.nModified}`);

  const totalUsers = await User.countDocuments({ organisationId: defaultOrgId });
  console.log(`   📊 Users now under Default Organisation: ${totalUsers}`);
};

const run = async () => {
  try {
    await connectDB();
    await migrateAllUsersToDefaultOrg();
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

if (require.main === module) {
  run();
}


