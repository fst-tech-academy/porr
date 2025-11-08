const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/porr');

// Import models
const Department = require('../models/Department');
const Organisation = require('../models/Organisation');
const User = require('../models/User');

// Comprehensive list of Puntland districts with coordinates
const puntlandDistricts = [
  // Nugaal Region
  { city: 'Garowe', state: 'Nugaal', coordinates: { latitude: 8.4000, longitude: 48.4844 } },
  { city: 'Eyl', state: 'Nugaal', coordinates: { latitude: 7.9833, longitude: 49.8167 } },
  { city: 'Dangorayo', state: 'Nugaal', coordinates: { latitude: 7.9167, longitude: 48.8333 } },
  { city: 'Burtinle', state: 'Nugaal', coordinates: { latitude: 8.2500, longitude: 48.5000 } },
  
  // Bari Region
  { city: 'Bosaso', state: 'Bari', coordinates: { latitude: 11.2802, longitude: 49.1830 } },
  { city: 'Qardho', state: 'Bari', coordinates: { latitude: 9.5000, longitude: 49.0833 } },
  { city: 'Iskushuban', state: 'Bari', coordinates: { latitude: 10.2833, longitude: 50.2333 } },
  { city: 'Qandala', state: 'Bari', coordinates: { latitude: 11.4667, longitude: 49.8667 } },
  { city: 'Alula', state: 'Bari', coordinates: { latitude: 11.9667, longitude: 50.7500 } },
  { city: 'Bandarbeyla', state: 'Bari', coordinates: { latitude: 9.4833, longitude: 50.8167 } },
  { city: 'Bereeda', state: 'Bari', coordinates: { latitude: 10.1833, longitude: 50.1833 } },
  { city: 'Bargal', state: 'Bari', coordinates: { latitude: 11.2833, longitude: 51.0833 } },
  
  // Sanaag Region
  { city: 'Ceerigaabo', state: 'Sanaag', coordinates: { latitude: 10.6167, longitude: 47.3667 } },
  { city: 'Laasqoray', state: 'Sanaag', coordinates: { latitude: 11.1667, longitude: 48.2167 } },
  { city: 'Ceel Afweyn', state: 'Sanaag', coordinates: { latitude: 10.0833, longitude: 47.8333 } },
  { city: 'Ceel Buh', state: 'Sanaag', coordinates: { latitude: 10.2833, longitude: 47.1833 } },
  
  // Mudug Region
  { city: 'Galkayo', state: 'Mudug', coordinates: { latitude: 6.7697, longitude: 47.4308 } },
  { city: 'Hobyo', state: 'Mudug', coordinates: { latitude: 5.3505, longitude: 48.5268 } },
  { city: 'Jariban', state: 'Mudug', coordinates: { latitude: 7.3667, longitude: 48.4167 } },
  { city: 'Goldogob', state: 'Mudug', coordinates: { latitude: 6.9167, longitude: 47.3333 } },
  
  // Sool Region
  { city: 'Laas Caanood', state: 'Sool', coordinates: { latitude: 8.4774, longitude: 47.3597 } },
  { city: 'Caynabo', state: 'Sool', coordinates: { latitude: 8.0333, longitude: 47.3667 } },
  { city: 'Taleex', state: 'Sool', coordinates: { latitude: 8.4167, longitude: 47.4167 } },
  { city: 'Xudun', state: 'Sool', coordinates: { latitude: 9.0333, longitude: 47.2500 } },
  
  // Ayn Region
  { city: 'Buuhoodle', state: 'Ayn', coordinates: { latitude: 8.2167, longitude: 46.3167 } },
  
  // Karkaar Region
  { city: 'Qardho', state: 'Karkaar', coordinates: { latitude: 9.5000, longitude: 49.0833 } },
  
  // Haylaan Region
  { city: 'Dhuusamarreeb', state: 'Haylaan', coordinates: { latitude: 5.5353, longitude: 46.3869 } },
  
  // Gardafuu Region
  { city: 'Dharoor', state: 'Gardafuu', coordinates: { latitude: 10.0833, longitude: 48.8333 } },
  { city: 'Bareeda', state: 'Gardafuu', coordinates: { latitude: 10.1833, longitude: 50.1833 } }
];

// Department types to create for each district
const departmentTypes = [
  { type: 'investigation', suffix: 'Investigation Unit', weight: 3 }, // More investigation units
  { type: 'operations', suffix: 'Operations Unit', weight: 2 },
  { type: 'intelligence', suffix: 'Intelligence Unit', weight: 1 },
  { type: 'forensics', suffix: 'Forensics Lab', weight: 1 },
  { type: 'support', suffix: 'Support Services', weight: 1 }
];

async function createDepartments() {
  try {
    console.log('🏛️  Starting Puntland CID Departments Database Population...');
    console.log('='.repeat(60));

    // Get existing organisation and user IDs
    const organisation = await Organisation.findOne();
    const user = await User.findOne();

    if (!organisation || !user) {
      console.error('❌ Error: No organisation or user found. Please ensure the database is properly seeded.');
      process.exit(1);
    }

    console.log(`📋 Using Organisation: ${organisation.name} (${organisation._id})`);
    console.log(`👤 Using User: ${user.firstName} ${user.lastName} (${user._id})`);
    console.log('');

    // Clear existing departments
    await Department.deleteMany({});
    console.log('🗑️  Cleared existing departments from database');
    console.log('');

    const departments = [];
    let departmentCounter = 1;

    // Create departments for each district
    for (const district of puntlandDistricts) {
      // Create multiple department types for each district based on weight
      for (const deptType of departmentTypes) {
        for (let i = 0; i < deptType.weight; i++) {
          const deptName = deptType.weight > 1 && i > 0 
            ? `CID ${district.city} ${deptType.suffix} ${i + 1}`
            : `CID ${district.city} ${deptType.suffix}`;
          
          // Generate unique code with counter
          const cityCode = district.city.substring(0, 3).toUpperCase().replace(/\s+/g, '');
          const stateCode = district.state.substring(0, 3).toUpperCase().replace(/\s+/g, '');
          const typeCode = deptType.type.substring(0, 3).toUpperCase();
          const deptCode = `CID-${stateCode}-${cityCode}-${typeCode}${deptType.weight > 1 ? (i + 1) : ''}-${departmentCounter}`;

          const department = {
            name: deptName,
            code: deptCode,
            description: `${deptType.suffix} for ${district.city} district in ${district.state} region, Puntland`,
            type: deptType.type,
            location: {
              address: {
                street: `Main Street`,
                city: district.city,
                state: district.state,
                country: 'Somalia',
                postalCode: `${10000 + departmentCounter}`
              },
              coordinates: {
                latitude: district.coordinates.latitude + (Math.random() * 0.01 - 0.005), // Slight variation
                longitude: district.coordinates.longitude + (Math.random() * 0.01 - 0.005)
              },
              phone: `+252${Math.floor(Math.random() * 90000000) + 10000000}`,
              email: `cid.${district.city.toLowerCase().replace(/\s+/g, '.')}.${deptType.type}@puntland-cid.so`,
              fax: `+252${Math.floor(Math.random() * 90000000) + 10000000}`
            },
            contactInfo: {
              phone: `+252${Math.floor(Math.random() * 90000000) + 10000000}`,
              email: `contact.${district.city.toLowerCase().replace(/\s+/g, '.')}.${deptType.type}@puntland-cid.so`,
              emergencyContact: `+252${Math.floor(Math.random() * 90000000) + 10000000}`
            },
            status: {
              isActive: true,
              establishedDate: new Date(2020 + Math.floor(Math.random() * 4), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1)
            },
            operatingHours: {
              monday: { open: '08:00', close: '18:00', closed: false },
              tuesday: { open: '08:00', close: '18:00', closed: false },
              wednesday: { open: '08:00', close: '18:00', closed: false },
              thursday: { open: '08:00', close: '18:00', closed: false },
              friday: { open: '08:00', close: '18:00', closed: false },
              saturday: { open: '08:00', close: '14:00', closed: false },
              sunday: { closed: true }
            },
            resources: {
              budget: {
                annual: Math.floor(Math.random() * 500000) + 100000,
                currency: 'USD'
              }
            },
            organisationId: organisation._id,
            createdBy: user._id,
            lastModifiedBy: user._id,
            metadata: {
              createdAt: new Date(),
              updatedAt: new Date(),
              version: 1
            }
          };

          departments.push(department);
          departmentCounter++;
        }
      }
    }

    // Insert departments
    const createdDepartments = await Department.insertMany(departments);
    
    console.log('✅ Successfully created departments:');
    console.log('-'.repeat(60));
    
    // Group by state
    const byState = {};
    createdDepartments.forEach(dept => {
      const state = dept.location.address.state;
      if (!byState[state]) byState[state] = [];
      byState[state].push(dept);
    });

    Object.keys(byState).sort().forEach(state => {
      console.log(`\n📍 ${state} Region (${byState[state].length} departments):`);
      byState[state].forEach(dept => {
        console.log(`   • ${dept.name} (${dept.code}) - ${dept.type}`);
      });
    });

    // Display summary statistics
    const totalDepartments = createdDepartments.length;
    const byType = {};
    createdDepartments.forEach(dept => {
      byType[dept.type] = (byType[dept.type] || 0) + 1;
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary Statistics:');
    console.log('-'.repeat(60));
    console.log(`Total Departments Created: ${totalDepartments}`);
    console.log(`Total Districts Covered: ${puntlandDistricts.length}`);
    console.log('\nDepartments by Type:');
    Object.keys(byType).sort().forEach(type => {
      console.log(`  ${type}: ${byType[type]}`);
    });
    console.log('='.repeat(60));

    await mongoose.connection.close();
    console.log('\n✅ Database population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating departments:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createDepartments();

