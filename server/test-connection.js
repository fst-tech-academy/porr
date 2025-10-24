const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing remote PORR database connection...');
    const connectionString = 'mongodb://porr_user:Friday14=@130.255.30.153:27017/porr?authSource=admin';
    await mongoose.connect(connectionString);
    console.log('✅ Connected to remote PORR database successfully!');
    
    // Test a simple query
    const User = require('./models/User');
    const userCount = await User.countDocuments();
    console.log(`👤 Current user count: ${userCount}`);
    
    if (userCount > 0) {
      const adminUser = await User.findOne({ role: 'admin' });
      if (adminUser) {
        console.log(`✅ Admin user found: ${adminUser.username}`);
      }
    }
    
    await mongoose.disconnect();
    console.log('🔌 Disconnected successfully!');
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();