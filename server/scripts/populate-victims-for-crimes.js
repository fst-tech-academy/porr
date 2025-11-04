const mongoose = require('mongoose');
require('dotenv').config();

const Victim = require('../models/Victim');
const OffenderOffence = require('../models/OffenderOffence');
const User = require('../models/User');

// Somali names for victims
const somaliFirstNames = {
  male: ['Ahmed', 'Mohamed', 'Hassan', 'Ali', 'Omar', 'Abdullahi', 'Ibrahim', 'Abdi', 'Yusuf', 'Ismail', 'Farah', 'Dahir', 'Abdirahman', 'Said', 'Mahad'],
  female: ['Amina', 'Fatima', 'Khadija', 'Halima', 'Aisha', 'Maryam', 'Zainab', 'Sahra', 'Faduma', 'Hawa', 'Asha', 'Nimo', 'Hibo', 'Hamdi', 'Leyla']
};

const somaliLastNames = ['Ali', 'Hassan', 'Mohamed', 'Ahmed', 'Ibrahim', 'Abdi', 'Farah', 'Dahir', 'Ismail', 'Omar', 'Yusuf', 'Abdullahi', 'Mahad', 'Said', 'Abdirahman'];

const cities = ['Bosaso', 'Garowe', 'Galkayo', 'Qardho', 'Burtinle', 'Las Anod', 'Eyl', 'Dangorayo'];
const states = ['Bari', 'Nugaal', 'Mudug', 'Sool', 'Sanaag', 'Cayn'];

const relationships = ['stranger', 'acquaintance', 'family', 'friend', 'colleague', 'neighbor', 'romantic', 'other'];

const psychologicalImpacts = ['none', 'mild', 'moderate', 'severe'];

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/porr';
    await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${mongoose.connection.host || 'localhost'}`);
    // Wait a bit to ensure connection is fully established
    await new Promise(resolve => setTimeout(resolve, 500));
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Generate random date between two dates
const randomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Create a victim
const createVictim = async (organisationId, createdBy, crimeData) => {
  const gender = Math.random() > 0.5 ? 'male' : 'female';
  const firstName = getRandomItem(somaliFirstNames[gender]);
  const lastName = getRandomItem(somaliLastNames);
  const city = getRandomItem(cities);
  const state = getRandomItem(states);
  
  // Generate date of birth (between 18-70 years old)
  const minAge = 18;
  const maxAge = 70;
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate());
  const minDate = new Date(today.getFullYear() - maxAge, today.getMonth(), today.getDate());
  const dateOfBirth = randomDate(minDate, maxDate);

  // Generate national ID (8 digits)
  const nationalId = String(Math.floor(Math.random() * 90000000) + 10000000);

  const victim = new Victim({
    personalInfo: {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      nationality: 'Somali',
      nationalId,
      phoneNumber: `+252${Math.floor(Math.random() * 900000000) + 100000000}`,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`
    },
    physicalDescription: {
      height: Math.floor(Math.random() * 50) + 150, // 150-200 cm
      weight: Math.floor(Math.random() * 40) + 50, // 50-90 kg
      eyeColor: getRandomItem(['brown', 'black', 'hazel', 'green']),
      hairColor: getRandomItem(['black', 'brown', 'dark brown']),
      skinTone: getRandomItem(['light', 'medium', 'dark', 'maariin', 'jecel'])
    },
    address: {
      current: {
        street: `Street ${Math.floor(Math.random() * 100) + 1}`,
        city,
        state,
        country: 'Somalia',
        postalCode: String(Math.floor(Math.random() * 90000) + 10000)
      },
      permanent: {
        street: `Street ${Math.floor(Math.random() * 100) + 1}`,
        city,
        state,
        country: 'Somalia',
        postalCode: String(Math.floor(Math.random() * 90000) + 10000)
      }
    },
    status: {
      isActive: true,
      isDeceased: Math.random() < 0.05, // 5% chance of being deceased
      isMinor: dateOfBirth > new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    },
    impactAssessment: {
      physicalInjuries: Math.random() < 0.4 ? [{
        type: getRandomItem(['bruise', 'cut', 'fracture', 'laceration', 'internal injury']),
        severity: getRandomItem(['minor', 'moderate', 'severe', 'critical']),
        description: 'Injury sustained during the crime',
        recoveryStatus: getRandomItem(['recovered', 'ongoing', 'permanent'])
      }] : [],
      psychologicalImpact: {
        traumaLevel: getRandomItem(psychologicalImpacts),
        counselingRequired: Math.random() < 0.3
      },
      financialImpact: {
        medicalExpenses: Math.random() < 0.5 ? Math.floor(Math.random() * 5000) + 100 : 0,
        lostWages: Math.random() < 0.3 ? Math.floor(Math.random() * 3000) + 500 : 0,
        propertyDamage: Math.random() < 0.4 ? Math.floor(Math.random() * 10000) + 500 : 0
      }
    },
    emergencyContact: {
      name: `${getRandomItem(somaliFirstNames.male)} ${lastName}`,
      relationship: getRandomItem(['family', 'friend', 'neighbor']),
      phone: `+252${Math.floor(Math.random() * 900000000) + 100000000}`
    },
    caseInfo: {
      victimId: `VIC-${String(Date.now()).slice(-6)}-${Math.floor(Math.random() * 1000)}`, // Temporary ID, will be overwritten by pre-save hook
      caseNumbers: [crimeData.crimeInfo.caseNumber],
      assignedOfficer: `Officer ${getRandomItem(['A', 'B', 'C', 'D'])}`
    },
    organisationId,
    createdBy,
    notes: `Victim of crime ${crimeData.crimeInfo.caseNumber}`
  });

  return await victim.save();
};

// Main function
const populateVictims = async () => {
  try {
    await connectDB();

    // Wait a moment for indexes to be ready
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get all existing crimes first to find organisation
    const crimeCount = await OffenderOffence.countDocuments();
    console.log(`Total crimes in database: ${crimeCount}`);
    
    if (crimeCount === 0) {
      console.log('No crimes found in the database. Please create some crimes first.');
      process.exit(0);
    }

    const allCrimes = await OffenderOffence.find().limit(1);

    // Get organisation ID from the first crime
    const firstCrime = allCrimes[0];
    const userOrgId = firstCrime.organisationId?._id || firstCrime.organisationId;
    
    if (!userOrgId) {
      throw new Error('No organisation found in crimes.');
    }

    // Get a default user for createdBy - try to find user from same organisation
    let defaultUser = await User.findOne({ 
      organisationId: userOrgId,
      role: { $in: ['admin', 'super_admin'] } 
    });
    
    if (!defaultUser) {
      defaultUser = await User.findOne({ organisationId: userOrgId });
    }
    
    if (!defaultUser) {
      // If no user found, try any user
      defaultUser = await User.findOne({ role: { $in: ['admin', 'super_admin'] } });
      if (!defaultUser) {
        defaultUser = await User.findOne();
      }
    }

    if (!defaultUser) {
      console.log('Warning: No user found. Using first crime creator as fallback.');
      // Use the createdBy from the first crime as fallback
      defaultUser = { _id: firstCrime.createdBy };
    }
    
    console.log(`Using organisation: ${userOrgId}`);
    if (defaultUser.email || defaultUser.username) {
      console.log(`Using user: ${defaultUser.email || defaultUser.username}`);
    }

    // Get all existing crimes for this organisation
    const crimes = await OffenderOffence.find({ organisationId: userOrgId }).limit(100); // Limit to first 100 crimes
    
    if (crimes.length === 0) {
      console.log(`No crimes found for organisation ${userOrgId}.`);
      process.exit(0);
    }

    console.log(`Found ${crimes.length} crimes. Starting to create victims...`);

    let totalVictimsCreated = 0;
    let crimesUpdated = 0;

    for (const crime of crimes) {
      // Skip if crime already has victims
      if (crime.victims && crime.victims.length > 0) {
        console.log(`Crime ${crime.crimeInfo.caseNumber} already has victims. Skipping...`);
        continue;
      }

      // Create 1-3 victims per crime
      const numVictims = Math.floor(Math.random() * 3) + 1; // 1-3 victims
      const victims = [];
      const victimIds = [];

      for (let i = 0; i < numVictims; i++) {
        try {
          const victim = await createVictim(userOrgId, defaultUser._id, crime);
          victims.push(victim);
          victimIds.push(victim._id);
          totalVictimsCreated++;
        } catch (error) {
          console.error(`Error creating victim ${i + 1} for crime ${crime.crimeInfo.caseNumber}:`, error.message);
        }
      }

      if (victims.length > 0) {
        // Update crime with victims
        const victimEntries = victims.map((victim, index) => {
          const relationship = getRandomItem(relationships);
          const hasPhysicalInjury = Math.random() < 0.4;
          const psychologicalImpact = getRandomItem(psychologicalImpacts);

          return {
            victim: victim._id,
            relationshipToOffender: relationship,
            victimImpact: {
              physicalInjury: hasPhysicalInjury,
              psychologicalImpact: psychologicalImpact !== 'none' ? psychologicalImpact : undefined,
              financialLoss: Math.random() < 0.5 ? Math.floor(Math.random() * 5000) + 100 : 0
            }
          };
        });

        crime.victims = victimEntries;
        await crime.save();
        crimesUpdated++;

        // Update victim caseNumbers
        for (const victim of victims) {
          if (!victim.caseInfo.caseNumbers.includes(crime.crimeInfo.caseNumber)) {
            victim.caseInfo.caseNumbers.push(crime.crimeInfo.caseNumber);
            await victim.save();
          }
        }

        console.log(`✓ Created ${victims.length} victim(s) for crime ${crime.crimeInfo.caseNumber}`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total victims created: ${totalVictimsCreated}`);
    console.log(`Crimes updated: ${crimesUpdated}`);
    console.log('Victims population completed!');

    process.exit(0);
  } catch (error) {
    console.error('Error populating victims:', error);
    process.exit(1);
  }
};

populateVictims();

