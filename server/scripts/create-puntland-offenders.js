const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/porr');

// Import models
const Offender = require('../models/Offender');
const Organisation = require('../models/Organisation');
const User = require('../models/User');

// Comprehensive list of Somali names from Puntland
const somaliNames = {
  male: [
    'Ahmed', 'Mohamed', 'Hassan', 'Ali', 'Omar', 'Ibrahim', 'Abdi', 'Abdullahi', 'Mahamed', 'Hussein',
    'Ismail', 'Yusuf', 'Abdirizak', 'Abdirashid', 'Abdiwahab', 'Abdiqadir', 'Abdirahman', 'Abdinasir',
    'Abdulkadir', 'Abdulahi', 'Abdulaziz', 'Abdulkarim', 'Abdulrahman', 'Abdulwahab', 'Abdulahi',
    'Abukar', 'Adan', 'Aden', 'Ahmad', 'Amin', 'Anwar', 'Asad', 'Ayan', 'Bashir', 'Dahir',
    'Daud', 'Farah', 'Farid', 'Gedi', 'Haji', 'Hamza', 'Hassan', 'Hussein', 'Idris', 'Jama',
    'Khalid', 'Mahad', 'Mahamed', 'Mahdi', 'Mahmud', 'Mansur', 'Mukhtar', 'Mustafa', 'Nur',
    'Osman', 'Qasim', 'Rashid', 'Said', 'Salim', 'Sharif', 'Suleiman', 'Tahir', 'Umar', 'Yasin',
    'Zakaria', 'Zubair', 'Abdirahman', 'Abdirizak', 'Abdiwahab', 'Abdulkadir', 'Abdulahi',
    'Abdulaziz', 'Abdulkarim', 'Abdulrahman', 'Abdulwahab', 'Abukar', 'Adan', 'Aden',
    'Ahmad', 'Amin', 'Anwar', 'Asad', 'Ayan', 'Bashir', 'Dahir', 'Daud', 'Farah', 'Farid',
    'Gedi', 'Haji', 'Hamza', 'Hassan', 'Hussein', 'Idris', 'Jama', 'Khalid', 'Mahad',
    'Mahamed', 'Mahdi', 'Mahmud', 'Mansur', 'Mukhtar', 'Mustafa', 'Nur', 'Osman', 'Qasim',
    'Rashid', 'Said', 'Salim', 'Sharif', 'Suleiman', 'Tahir', 'Umar', 'Yasin', 'Zakaria', 'Zubair'
  ],
  female: [
    'Amina', 'Fatima', 'Khadija', 'Maryam', 'Hawa', 'Zainab', 'Aisha', 'Halima', 'Safiya', 'Asha',
    'Faduma', 'Hibo', 'Iman', 'Khadra', 'Layla', 'Mariam', 'Naima', 'Ruqiya', 'Sahra', 'Ubax',
    'Warsan', 'Yasmin', 'Zahra', 'Abdiya', 'Adan', 'Ayan', 'Bilan', 'Dahabo', 'Fadumo', 'Guled',
    'Habiba', 'Ifrah', 'Jawahir', 'Kulthum', 'Lul', 'Muna', 'Nimo', 'Qamar', 'Rahma', 'Sahra',
    'Tahira', 'Ubah', 'Verdi', 'Warsan', 'Xalima', 'Yasmin', 'Zahra', 'Abdiya', 'Adan', 'Ayan',
    'Bilan', 'Dahabo', 'Fadumo', 'Guled', 'Habiba', 'Ifrah', 'Jawahir', 'Kulthum', 'Lul',
    'Muna', 'Nimo', 'Qamar', 'Rahma', 'Sahra', 'Tahira', 'Ubah', 'Verdi', 'Warsan', 'Xalima',
    'Yasmin', 'Zahra', 'Abdiya', 'Adan', 'Ayan', 'Bilan', 'Dahabo', 'Fadumo', 'Guled',
    'Habiba', 'Ifrah', 'Jawahir', 'Kulthum', 'Lul', 'Muna', 'Nimo', 'Qamar', 'Rahma',
    'Sahra', 'Tahira', 'Ubah', 'Verdi', 'Warsan', 'Xalima', 'Yasmin', 'Zahra', 'Abdiya',
    'Adan', 'Ayan', 'Bilan', 'Dahabo', 'Fadumo', 'Guled', 'Habiba', 'Ifrah', 'Jawahir',
    'Kulthum', 'Lul', 'Muna', 'Nimo', 'Qamar', 'Rahma', 'Sahra', 'Tahira', 'Ubah', 'Verdi'
  ],
  surnames: [
    'Hassan', 'Ali', 'Mohamed', 'Ahmed', 'Omar', 'Ibrahim', 'Abdi', 'Abdullahi', 'Mahamed', 'Hussein',
    'Ismail', 'Yusuf', 'Abdirizak', 'Abdirashid', 'Abdiwahab', 'Abdiqadir', 'Abdirahman', 'Abdinasir',
    'Abdulkadir', 'Abdulahi', 'Abdulaziz', 'Abdulkarim', 'Abdulrahman', 'Abdulwahab', 'Abdulahi',
    'Abukar', 'Adan', 'Aden', 'Ahmad', 'Amin', 'Anwar', 'Asad', 'Ayan', 'Bashir', 'Dahir',
    'Daud', 'Farah', 'Farid', 'Gedi', 'Haji', 'Hamza', 'Hassan', 'Hussein', 'Idris', 'Jama',
    'Khalid', 'Mahad', 'Mahamed', 'Mahdi', 'Mahmud', 'Mansur', 'Mukhtar', 'Mustafa', 'Nur',
    'Osman', 'Qasim', 'Rashid', 'Said', 'Salim', 'Sharif', 'Suleiman', 'Tahir', 'Umar', 'Yasin',
    'Zakaria', 'Zubair', 'Abdirahman', 'Abdirizak', 'Abdiwahab', 'Abdulkadir', 'Abdulahi',
    'Abdulaziz', 'Abdulkarim', 'Abdulrahman', 'Abdulwahab', 'Abukar', 'Adan', 'Aden',
    'Ahmad', 'Amin', 'Anwar', 'Asad', 'Ayan', 'Bashir', 'Dahir', 'Daud', 'Farah', 'Farid',
    'Gedi', 'Haji', 'Hamza', 'Hassan', 'Hussein', 'Idris', 'Jama', 'Khalid', 'Mahad',
    'Mahamed', 'Mahdi', 'Mahmud', 'Mansur', 'Mukhtar', 'Mustafa', 'Nur', 'Osman', 'Qasim',
    'Rashid', 'Said', 'Salim', 'Sharif', 'Suleiman', 'Tahir', 'Umar', 'Yasin', 'Zakaria', 'Zubair'
  ]
};

// Puntland cities and regions
const puntlandLocations = [
  { city: 'Garowe', state: 'Nugaal', coordinates: { latitude: 8.4000, longitude: 48.4844 } },
  { city: 'Bosaso', state: 'Bari', coordinates: { latitude: 11.2802, longitude: 49.1830 } },
  { city: 'Qardho', state: 'Bari', coordinates: { latitude: 9.5000, longitude: 49.0833 } },
  { city: 'Ceerigaabo', state: 'Sanaag', coordinates: { latitude: 10.6167, longitude: 47.3667 } },
  { city: 'Galkayo', state: 'Mudug', coordinates: { latitude: 6.7697, longitude: 47.4308 } },
  { city: 'Laas Caanood', state: 'Sool', coordinates: { latitude: 8.4774, longitude: 47.3597 } },
  { city: 'Caynabo', state: 'Sool', coordinates: { latitude: 8.0333, longitude: 47.3667 } },
  { city: 'Dhuusamarreeb', state: 'Galgaduud', coordinates: { latitude: 5.5353, longitude: 46.3869 } },
  { city: 'Hobyo', state: 'Mudug', coordinates: { latitude: 5.3505, longitude: 48.5268 } },
  { city: 'Eyl', state: 'Nugaal', coordinates: { latitude: 7.9833, longitude: 49.8167 } }
];

// Offence types and descriptions
const offenceTypes = [
  { type: 'Theft', description: 'Stealing property or money' },
  { type: 'Robbery', description: 'Taking property by force or threat' },
  { type: 'Assault', description: 'Physical attack on another person' },
  { type: 'Drug Possession', description: 'Possession of illegal substances' },
  { type: 'Drug Trafficking', description: 'Distribution of illegal drugs' },
  { type: 'Fraud', description: 'Deception for financial gain' },
  { type: 'Forgery', description: 'Creating false documents' },
  { type: 'Burglary', description: 'Breaking into buildings to steal' },
  { type: 'Vandalism', description: 'Destruction of property' },
  { type: 'Public Disorder', description: 'Disturbing public peace' },
  { type: 'Traffic Violation', description: 'Violating traffic laws' },
  { type: 'Domestic Violence', description: 'Violence within family relationships' },
  { type: 'Sexual Assault', description: 'Non-consensual sexual contact' },
  { type: 'Murder', description: 'Unlawful killing of another person' },
  { type: 'Manslaughter', description: 'Unintentional killing' },
  { type: 'Kidnapping', description: 'Unlawful taking of a person' },
  { type: 'Extortion', description: 'Obtaining money through threats' },
  { type: 'Money Laundering', description: 'Concealing illegal money sources' },
  { type: 'Terrorism', description: 'Acts of terror or violence' },
  { type: 'Corruption', description: 'Abuse of power for personal gain' }
];

// Status options
const statuses = ['active', 'inactive', 'pending', 'suspended', 'completed'];

// Risk levels
const riskLevels = ['low', 'medium', 'high', 'critical'];

// Generate random date within last 5 years
function getRandomDate() {
  const now = new Date();
  const fiveYearsAgo = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
  const randomTime = fiveYearsAgo.getTime() + Math.random() * (now.getTime() - fiveYearsAgo.getTime());
  return new Date(randomTime);
}

// Generate random phone number
function generatePhoneNumber() {
  const prefixes = ['+25261', '+25262', '+25263', '+25264', '+25265', '+25266', '+25267', '+25268', '+25269'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  return prefix + number;
}

// Generate random ID number
function generateIdNumber() {
  const prefix = Math.floor(Math.random() * 9000) + 1000;
  const suffix = Math.floor(Math.random() * 900000) + 100000;
  return `${prefix}-${suffix}`;
}

// Generate random offender
function generateOffender(index) {
  const isMale = Math.random() > 0.3; // 70% male, 30% female
  const firstName = isMale 
    ? somaliNames.male[Math.floor(Math.random() * somaliNames.male.length)]
    : somaliNames.female[Math.floor(Math.random() * somaliNames.female.length)];
  const lastName = somaliNames.surnames[Math.floor(Math.random() * somaliNames.surnames.length)];
  
  const location = puntlandLocations[Math.floor(Math.random() * puntlandLocations.length)];
  const offence = offenceTypes[Math.floor(Math.random() * offenceTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const riskLevel = riskLevels[Math.floor(Math.random() * riskLevels.length)];
  
  const birthDate = getRandomDate();
  const registrationDate = getRandomDate();
  const lastOffenceDate = getRandomDate();
  
  // Calculate age
  const age = new Date().getFullYear() - birthDate.getFullYear();
  
  // Generate multiple offences for some offenders
  const numOffences = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 1;
  const offences = [];
  
  for (let i = 0; i < numOffences; i++) {
    const offenceType = offenceTypes[Math.floor(Math.random() * offenceTypes.length)];
    offences.push({
      type: offenceType.type,
      description: offenceType.description,
      date: getRandomDate(),
      status: Math.random() > 0.5 ? 'convicted' : 'pending',
      severity: Math.random() > 0.5 ? 'minor' : 'major'
    });
  }
  
  return {
    // Personal Information
    personalInfo: {
      firstName: firstName,
      lastName: lastName,
      dateOfBirth: birthDate,
      gender: isMale ? 'male' : 'female',
      nationality: 'Somali',
      nationalId: generateIdNumber(),
      passportNumber: Math.random() > 0.5 ? `SO${Math.floor(Math.random() * 900000) + 100000}` : null,
      phoneNumber: generatePhoneNumber(),
      email: Math.random() > 0.7 ? `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com` : null
    },
    
    // Physical Description
    physicalDescription: {
      height: Math.floor(Math.random() * 30) + 150, // 150-180 cm
      weight: Math.floor(Math.random() * 40) + 50, // 50-90 kg
      eyeColor: ['brown', 'blue', 'green', 'hazel', 'gray', 'amber'][Math.floor(Math.random() * 6)],
      hairColor: ['black', 'brown', 'blonde', 'red', 'gray', 'white'][Math.floor(Math.random() * 6)],
      skinTone: ['light', 'medium', 'dark', 'very dark'][Math.floor(Math.random() * 4)],
      distinguishingMarks: Math.random() > 0.7 ? `Scar on ${['left arm', 'right arm', 'face', 'leg'][Math.floor(Math.random() * 4)]}` : null
    },
    
    // Address Information
    address: {
      current: {
        street: `${Math.floor(Math.random() * 999) + 1} ${isMale ? 'Ahmed' : 'Amina'} St.`,
        city: location.city,
        state: location.state,
        country: 'Somalia',
        postalCode: Math.floor(Math.random() * 90000) + 10000,
        coordinates: {
          latitude: location.coordinates.latitude + (Math.random() - 0.5) * 0.1,
          longitude: location.coordinates.longitude + (Math.random() - 0.5) * 0.1
        }
      }
    },
    
    // Criminal History
    criminalHistory: {
      totalOffences: numOffences,
      firstOffenceDate: getRandomDate(),
      lastOffenceDate: lastOffenceDate,
      offences: offences.map((off, idx) => ({
        dateCommitted: off.date,
        dateArrested: new Date(off.date.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000), // Within a week
        status: off.status,
        sentence: off.status === 'convicted' ? `${Math.floor(Math.random() * 24) + 1} months` : null,
        fine: off.status === 'convicted' && Math.random() > 0.5 ? Math.floor(Math.random() * 5000) + 100 : null,
        notes: `${off.description} committed in ${location.city}`
      }))
    },
    
    // Risk Assessment
    riskAssessment: {
      level: riskLevel,
      factors: [
        { factor: 'Previous convictions', weight: Math.floor(Math.random() * 5) + 3 },
        { factor: 'Age at first offence', weight: Math.floor(Math.random() * 3) + 2 },
        { factor: 'Substance abuse', weight: Math.random() > 0.7 ? Math.floor(Math.random() * 4) + 2 : 1 }
      ],
      lastAssessment: new Date(),
      nextAssessment: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      notes: `Risk assessment based on ${numOffences} previous offences`
    },
    
    // Status and Tracking
    status: {
      isActive: status === 'active',
      isInCustody: Math.random() > 0.8,
      custodyLocation: Math.random() > 0.8 ? `${location.city} Prison` : null,
      custodyStartDate: Math.random() > 0.8 ? getRandomDate() : null,
      paroleStatus: Math.random() > 0.7 ? ['none', 'eligible', 'on_parole'][Math.floor(Math.random() * 3)] : 'none',
      probationStatus: Math.random() > 0.6 ? ['none', 'active', 'completed'][Math.floor(Math.random() * 3)] : 'none'
    },
    
    // Family Information
    familyInfo: {
      maritalStatus: ['single', 'married', 'divorced', 'widowed'][Math.floor(Math.random() * 4)],
      emergencyContact: {
        name: `${somaliNames.male[Math.floor(Math.random() * somaliNames.male.length)]} ${somaliNames.surnames[Math.floor(Math.random() * somaliNames.surnames.length)]}`,
        relationship: ['brother', 'sister', 'father', 'mother', 'cousin'][Math.floor(Math.random() * 5)],
        phone: generatePhoneNumber(),
        address: `${location.city}, ${location.state}`
      }
    },
    
    // Additional Information
    notes: Math.random() > 0.5 ? `Offender from ${location.city}, ${location.state}. ${offence.description.toLowerCase()}.` : null,
    tags: [offence.type.toLowerCase(), location.state.toLowerCase(), riskLevel],
    
    // System Information
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date(),
      version: 1
    }
  };
}

async function createOffenders() {
  try {
    console.log('👥 Starting Puntland Offenders Database Population...');
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

    // Clear existing offenders
    await Offender.deleteMany({});
    console.log('🗑️  Cleared existing offenders from database');

    // Generate 100 offenders
    const offenders = [];
    for (let i = 0; i < 100; i++) {
      const offenderData = generateOffender(i);
      offenders.push({
        ...offenderData,
        organisationId: organisation._id,
        createdBy: user._id,
        lastModifiedBy: user._id
      });
    }

    // Insert offenders
    const createdOffenders = await Offender.insertMany(offenders);
    
    console.log('✅ Successfully created offenders:');
    console.log('-'.repeat(40));
    
    // Display first 10 offenders as examples
    createdOffenders.slice(0, 10).forEach((offender, index) => {
      console.log(`${index + 1}. ${offender.personalInfo.firstName} ${offender.personalInfo.lastName} (${offender.personalInfo.nationalId})`);
      console.log(`   Age: ${offender.age} | Gender: ${offender.personalInfo.gender} | Status: ${offender.status.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Location: ${offender.address.current.city}, ${offender.address.current.state}`);
      console.log(`   Risk Level: ${offender.riskAssessment.level} | Custody: ${offender.status.isInCustody ? 'Yes' : 'No'}`);
      console.log(`   Offences: ${offender.criminalHistory.totalOffences} | Last Offence: ${offender.criminalHistory.lastOffenceDate.toLocaleDateString()}`);
      console.log('');
    });

    if (createdOffenders.length > 10) {
      console.log(`... and ${createdOffenders.length - 10} more offenders`);
      console.log('');
    }

    // Display summary statistics
    const totalOffenders = createdOffenders.length;
    const maleOffenders = createdOffenders.filter(o => o.personalInfo.gender === 'male').length;
    const femaleOffenders = createdOffenders.filter(o => o.personalInfo.gender === 'female').length;
    const activeOffenders = createdOffenders.filter(o => o.status.isActive).length;
    const highRiskOffenders = createdOffenders.filter(o => o.riskAssessment.level === 'high' || o.riskAssessment.level === 'critical').length;
    const inCustodyOffenders = createdOffenders.filter(o => o.status.isInCustody).length;

    console.log('📊 SUMMARY STATISTICS:');
    console.log('='.repeat(60));
    console.log(`Total Offenders Created: ${totalOffenders}`);
    console.log(`Male Offenders: ${maleOffenders} (${Math.round(maleOffenders/totalOffenders*100)}%)`);
    console.log(`Female Offenders: ${femaleOffenders} (${Math.round(femaleOffenders/totalOffenders*100)}%)`);
    console.log(`Active Offenders: ${activeOffenders} (${Math.round(activeOffenders/totalOffenders*100)}%)`);
    console.log(`High Risk Offenders: ${highRiskOffenders} (${Math.round(highRiskOffenders/totalOffenders*100)}%)`);
    console.log(`In Custody: ${inCustodyOffenders} (${Math.round(inCustodyOffenders/totalOffenders*100)}%)`);
    console.log('');

    // Group by status
    const offendersByStatus = createdOffenders.reduce((acc, offender) => {
      const status = offender.status.isActive ? 'active' : 'inactive';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    console.log('📋 OFFENDERS BY STATUS:');
    console.log('-'.repeat(40));
    Object.entries(offendersByStatus).forEach(([status, count]) => {
      const statusName = status.toUpperCase();
      console.log(`${statusName.padEnd(15)}: ${count} offenders`);
    });
    console.log('');

    // Group by risk level
    const offendersByRisk = createdOffenders.reduce((acc, offender) => {
      acc[offender.riskAssessment.level] = (acc[offender.riskAssessment.level] || 0) + 1;
      return acc;
    }, {});

    console.log('⚠️  OFFENDERS BY RISK LEVEL:');
    console.log('-'.repeat(40));
    Object.entries(offendersByRisk).forEach(([risk, count]) => {
      const riskName = risk.toUpperCase();
      console.log(`${riskName.padEnd(15)}: ${count} offenders`);
    });
    console.log('');

    // Group by location
    const offendersByLocation = createdOffenders.reduce((acc, offender) => {
      const city = offender.address.current.city;
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    console.log('🌍 OFFENDERS BY LOCATION:');
    console.log('-'.repeat(40));
    Object.entries(offendersByLocation).forEach(([city, count]) => {
      console.log(`${city.padEnd(20)}: ${count} offenders`);
    });
    console.log('');

    // Group by offence count
    const offendersByOffenceCount = createdOffenders.reduce((acc, offender) => {
      const count = offender.criminalHistory.totalOffences;
      const range = count === 1 ? '1 offence' : count <= 3 ? '2-3 offences' : '4+ offences';
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    }, {});

    console.log('⚖️  OFFENDERS BY OFFENCE COUNT:');
    console.log('-'.repeat(40));
    Object.entries(offendersByOffenceCount).forEach(([range, count]) => {
      console.log(`${range.padEnd(20)}: ${count} offenders`);
    });
    console.log('');

    console.log('🎉 PUNTLAND OFFENDERS DATABASE POPULATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('Successfully created 100 offenders with:');
    console.log('• Authentic Somali names from Puntland');
    console.log('• Realistic Puntland locations and addresses');
    console.log('• Comprehensive offence information');
    console.log('• Detailed physical descriptions');
    console.log('• Risk assessments and status tracking');
    console.log('• Contact information and identification');
    console.log('• Multiple offences for repeat offenders');

  } catch (error) {
    console.error('❌ Error creating offenders:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
createOffenders();
