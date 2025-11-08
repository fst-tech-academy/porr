const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/porr');

// Import models
const Agent = require('../models/Agent');
const Department = require('../models/Department');
const Organisation = require('../models/Organisation');
const User = require('../models/User');

// Comprehensive list of Somali names for pseudonyms
const somaliNames = {
  firstNames: [
    'Ahmed', 'Mohamed', 'Hassan', 'Ali', 'Omar', 'Ibrahim', 'Abdi', 'Abdullahi', 'Mahamed', 'Hussein',
    'Ismail', 'Yusuf', 'Abdirizak', 'Abdirashid', 'Abdiwahab', 'Abdiqadir', 'Abdirahman', 'Abdinasir',
    'Abdulkadir', 'Abdulahi', 'Abdulaziz', 'Abdulkarim', 'Abdulrahman', 'Abdulwahab', 'Abukar',
    'Adan', 'Aden', 'Ahmad', 'Amin', 'Anwar', 'Asad', 'Ayan', 'Bashir', 'Dahir', 'Daud',
    'Farah', 'Farid', 'Gedi', 'Haji', 'Hamza', 'Idris', 'Jama', 'Khalid', 'Mahad', 'Mahdi',
    'Mahmud', 'Mansur', 'Mukhtar', 'Mustafa', 'Nur', 'Osman', 'Qasim', 'Rashid', 'Said',
    'Salim', 'Sharif', 'Suleiman', 'Tahir', 'Umar', 'Yasin', 'Zakaria', 'Zubair', 'Mahamud',
    'Ibraahim', 'Xasan', 'Cali', 'Cumar', 'Cabdullahi', 'Maxamed', 'Xuseen', 'Ismaaciil',
    'Yuusuf', 'Cabdiraxmaan', 'Cabdikariim', 'Cabdulwahaab', 'Cabuukar', 'Aadan', 'Ahmad',
    'Amiin', 'Anwaar', 'Asad', 'Bashiir', 'Daahir', 'Daaud', 'Faraax', 'Gedi', 'Xaaji',
    'Xamza', 'Idriis', 'Jama', 'Khaalid', 'Mahad', 'Mahdi', 'Mahmuud', 'Mansuur', 'Mukhtaar',
    'Mustafaa', 'Nuur', 'Cismaan', 'Qaasim', 'Rashiid', 'Saciid', 'Saliim', 'Shariif',
    'Sulaymaan', 'Tahiir', 'Cumar', 'Yaasiin', 'Zakariya', 'Zubayr'
  ],
  lastNames: [
    'Hassan', 'Ali', 'Mohamed', 'Ahmed', 'Omar', 'Ibrahim', 'Abdi', 'Abdullahi', 'Mahamed', 'Hussein',
    'Ismail', 'Yusuf', 'Abdirizak', 'Abdirashid', 'Abdiwahab', 'Abdiqadir', 'Abdirahman', 'Abdinasir',
    'Abdulkadir', 'Abdulahi', 'Abdulaziz', 'Abdulkarim', 'Abdulrahman', 'Abdulwahab', 'Abukar',
    'Adan', 'Aden', 'Ahmad', 'Amin', 'Anwar', 'Asad', 'Ayan', 'Bashir', 'Dahir', 'Daud',
    'Farah', 'Farid', 'Gedi', 'Haji', 'Hamza', 'Idris', 'Jama', 'Khalid', 'Mahad', 'Mahdi',
    'Mahmud', 'Mansur', 'Mukhtar', 'Mustafa', 'Nur', 'Osman', 'Qasim', 'Rashid', 'Said',
    'Salim', 'Sharif', 'Suleiman', 'Tahir', 'Umar', 'Yasin', 'Zakaria', 'Zubair', 'Warsame',
    'Diriye', 'Hersi', 'Guled', 'Duale', 'Hassan', 'Xasan', 'Cali', 'Maxamed', 'Axmed',
    'Cumar', 'Ibraahim', 'Cabdullahi', 'Xuseen', 'Ismaaciil', 'Yuusuf', 'Cabdiraxmaan',
    'Cabdikariim', 'Cabdulwahaab', 'Cabuukar', 'Aadan', 'Ahmad', 'Amiin', 'Anwaar', 'Asad',
    'Bashiir', 'Daahir', 'Daaud', 'Faraax', 'Gedi', 'Xaaji', 'Xamza', 'Idriis', 'Jama',
    'Khaalid', 'Mahad', 'Mahdi', 'Mahmuud', 'Mansuur', 'Mukhtaar', 'Mustafaa', 'Nuur',
    'Cismaan', 'Qaasim', 'Rashiid', 'Saciid', 'Saliim', 'Shariif', 'Sulaymaan', 'Tahiir',
    'Cumar', 'Yaasiin', 'Zakariya', 'Zubayr', 'Warsame', 'Dirir', 'Hersi', 'Guuleed', 'Duale'
  ],
  codeNames: [
    'Shadow', 'Phoenix', 'Raven', 'Falcon', 'Wolf', 'Eagle', 'Tiger', 'Lion', 'Panther', 'Cobra',
    'Viper', 'Hawk', 'Bear', 'Fox', 'Jaguar', 'Leopard', 'Cheetah', 'Rhino', 'Buffalo', 'Elephant',
    'Storm', 'Thunder', 'Lightning', 'Blaze', 'Flame', 'Fire', 'Ice', 'Frost', 'Wind', 'River',
    'Ocean', 'Mountain', 'Valley', 'Desert', 'Forest', 'Jungle', 'Canyon', 'Cliff', 'Peak', 'Summit',
    'Guardian', 'Sentinel', 'Protector', 'Defender', 'Warrior', 'Knight', 'Ranger', 'Scout', 'Hunter', 'Tracker',
    'Ghost', 'Phantom', 'Specter', 'Wraith', 'Spirit', 'Soul', 'Shadow', 'Dark', 'Night', 'Midnight',
    'Steel', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Crystal', 'Gem', 'Stone',
    'Arrow', 'Spear', 'Sword', 'Shield', 'Blade', 'Dagger', 'Axe', 'Hammer', 'Mace', 'Bow'
  ]
};

// Ranks with distribution weights
const ranks = [
  { value: 'detective', weight: 50 },
  { value: 'senior_detective', weight: 25 },
  { value: 'supervisor', weight: 15 },
  { value: 'commander', weight: 8 },
  { value: 'director', weight: 2 }
];

// Specializations with distribution weights
const specializations = [
  { value: 'general', weight: 30 },
  { value: 'homicide', weight: 15 },
  { value: 'narcotics', weight: 15 },
  { value: 'fraud', weight: 10 },
  { value: 'cybercrime', weight: 10 },
  { value: 'terrorism', weight: 8 },
  { value: 'organized_crime', weight: 7 },
  { value: 'other', weight: 5 }
];

// Statuses with distribution weights
const statuses = [
  { value: 'active', weight: 85 },
  { value: 'on_leave', weight: 8 },
  { value: 'suspended', weight: 2 },
  { value: 'retired', weight: 3 },
  { value: 'transferred', weight: 2 }
];

// Clearance levels with distribution weights
const clearanceLevels = [
  { value: 'confidential', weight: 60 },
  { value: 'secret', weight: 30 },
  { value: 'top_secret', weight: 10 }
];

// Eye colors
const eyeColors = ['brown', 'black', 'hazel', 'amber', 'gray', 'green', 'blue'];
const hairColors = ['black', 'brown', 'gray', 'white'];

// Helper function to get weighted random item
function getWeightedRandom(items) {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    random -= item.weight;
    if (random <= 0) return item.value;
  }
  return items[0].value;
}

// Helper function to get random item from array
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Helper function to generate random date between two dates
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate phone number
function generatePhone() {
  return `+252${Math.floor(Math.random() * 90000000) + 10000000}`;
}

// Helper function to generate email
function generateEmail(firstName, lastName) {
  const domains = ['puntland-cid.so', 'cid-puntland.so', 'puntland-police.so'];
  return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${getRandomItem(domains)}`;
}

async function createAgents() {
  try {
    console.log('👮 Starting Puntland CID Agents Database Population...');
    console.log('='.repeat(60));

    // Get existing organisation, user, and departments
    const organisation = await Organisation.findOne();
    const user = await User.findOne();
    const departments = await Department.find({ 'status.isActive': true });

    if (!organisation || !user) {
      console.error('❌ Error: No organisation or user found. Please ensure the database is properly seeded.');
      process.exit(1);
    }

    if (departments.length === 0) {
      console.error('❌ Error: No departments found. Please run create-puntland-cid-departments.js first.');
      process.exit(1);
    }

    console.log(`📋 Using Organisation: ${organisation.name} (${organisation._id})`);
    console.log(`👤 Using User: ${user.firstName} ${user.lastName} (${user._id})`);
    console.log(`🏛️  Found ${departments.length} active departments`);
    console.log('');

    // Clear existing agents
    await Agent.deleteMany({});
    console.log('🗑️  Cleared existing agents from database');
    console.log('');

    // Get the highest agentId to continue from
    const lastAgent = await Agent.findOne().sort({ agentId: -1 });
    let nextAgentId = 1;
    if (lastAgent && lastAgent.agentId) {
      const lastId = parseInt(lastAgent.agentId, 10);
      if (!isNaN(lastId)) {
        nextAgentId = lastId + 1;
      }
    }

    const agents = [];
    const totalAgents = 1000;

    console.log(`📝 Creating ${totalAgents} agents...`);
    console.log('');

    // Create agents
    for (let i = 0; i < totalAgents; i++) {
      const firstName = getRandomItem(somaliNames.firstNames);
      const lastName = getRandomItem(somaliNames.lastNames);
      const codeName = getRandomItem(somaliNames.codeNames);
      const department = getRandomItem(departments);
      
      const rank = getWeightedRandom(ranks);
      const specialization = getWeightedRandom(specializations);
      const status = getWeightedRandom(statuses);
      const clearanceLevel = getWeightedRandom(clearanceLevels);

      // Employment date (between 2015 and 2024)
      const employmentDate = randomDate(new Date(2015, 0, 1), new Date(2024, 11, 31));

      // Physical description
      const height = Math.floor(Math.random() * 30) + 160; // 160-190 cm
      const weight = Math.floor(Math.random() * 30) + 60; // 60-90 kg
      const eyeColor = getRandomItem(eyeColors);
      const hairColor = getRandomItem(hairColors);

      // Status info
      const isActive = status === 'active';
      const onDuty = isActive && Math.random() > 0.3;
      const availability = isActive 
        ? (onDuty ? (Math.random() > 0.5 ? 'available' : 'on_case') : 'off_duty')
        : 'off_duty';

      // Contact info
      const phone = generatePhone();
      const email = generateEmail(firstName, lastName);

      // Agent ID with leading zeros (5 digits)
      const agentId = String(nextAgentId++).padStart(5, '0');

      const agent = {
        agentId: agentId,
        pseudonym: {
          firstName: firstName,
          lastName: lastName,
          codeName: codeName
        },
        // Real identity (optional, some agents have it)
        realIdentity: Math.random() > 0.7 ? {
          firstName: getRandomItem(somaliNames.firstNames),
          lastName: getRandomItem(somaliNames.lastNames),
          dateOfBirth: randomDate(new Date(1970, 0, 1), new Date(2000, 11, 31)),
          placeOfBirth: getRandomItem(['Garowe', 'Bosaso', 'Galkayo', 'Qardho', 'Ceerigaabo'])
        } : undefined,
        department: department._id,
        rank: rank,
        specialization: specialization,
        employmentDate: employmentDate,
        status: status,
        clearanceLevel: clearanceLevel,
        contactInfo: {
          phone: phone,
          email: email,
          emergencyContact: {
            name: `${getRandomItem(somaliNames.firstNames)} ${getRandomItem(somaliNames.lastNames)}`,
            relationship: getRandomItem(['Spouse', 'Parent', 'Sibling', 'Relative', 'Friend']),
            phone: generatePhone()
          }
        },
        physicalDescription: {
          height: height,
          weight: weight,
          eyeColor: eyeColor,
          hairColor: hairColor,
          distinguishingMarks: Math.random() > 0.7 ? getRandomItem(['Scar on left arm', 'Tattoo on right hand', 'Birthmark on face', 'None']) : undefined
        },
        statusInfo: {
          isActive: isActive,
          lastActiveDate: isActive ? randomDate(new Date(2024, 0, 1), new Date()) : undefined,
          onDuty: onDuty,
          availability: availability,
          currentLocation: onDuty ? department.location.address.city : undefined
        },
        performance: {
          totalCases: Math.floor(Math.random() * 200),
          solvedCases: Math.floor(Math.random() * 150),
          averageRating: Math.floor(Math.random() * 2) + 4, // 4-5
          lastEvaluationDate: randomDate(new Date(2023, 0, 1), new Date())
        },
        medicalInfo: {
          mentalHealthStatus: Math.random() > 0.9 ? getRandomItem(['stable', 'treatment_required', 'medication_required']) : 'stable',
          physicalHealthStatus: getRandomItem(['good', 'fair', 'poor']),
          medications: Math.random() > 0.9 ? [{ name: getRandomItem(['Blood pressure medication', 'Aspirin', 'Vitamin D']), dosage: 'As prescribed', frequency: 'Daily' }] : [],
          allergies: Math.random() > 0.8 ? [getRandomItem(['Peanuts', 'Dust', 'Pollen'])] : [],
          fitnessForDuty: Math.random() > 0.95 ? false : true,
          lastFitnessTest: randomDate(new Date(2023, 0, 1), new Date())
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

      agents.push(agent);

      if ((i + 1) % 100 === 0) {
        console.log(`   Created ${i + 1}/${totalAgents} agents...`);
      }
    }

    // Insert agents in batches
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);
      await Agent.insertMany(batch);
      inserted += batch.length;
      console.log(`   Inserted ${inserted}/${totalAgents} agents...`);
    }

    // Update department statistics
    console.log('\n📊 Updating department statistics...');
    for (const department of departments) {
      const agentCount = await Agent.countDocuments({ department: department._id, 'statusInfo.isActive': true });
      const totalAgentCount = await Agent.countDocuments({ department: department._id });
      
      await Department.updateOne(
        { _id: department._id },
        {
          $set: {
            'statistics.totalAgents': totalAgentCount,
            'statistics.activeAgents': agentCount
          }
        }
      );
    }

    // Display summary statistics
    const totalAgentsCreated = await Agent.countDocuments();
    const activeAgents = await Agent.countDocuments({ 'statusInfo.isActive': true });
    const byRank = {};
    const bySpecialization = {};
    const byStatus = {};
    const byDepartment = {};

    const allAgents = await Agent.find().select('rank specialization status department');
    
    allAgents.forEach(agent => {
      byRank[agent.rank] = (byRank[agent.rank] || 0) + 1;
      bySpecialization[agent.specialization] = (bySpecialization[agent.specialization] || 0) + 1;
      byStatus[agent.status] = (byStatus[agent.status] || 0) + 1;
      const deptId = agent.department.toString();
      byDepartment[deptId] = (byDepartment[deptId] || 0) + 1;
    });

    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary Statistics:');
    console.log('-'.repeat(60));
    console.log(`Total Agents Created: ${totalAgentsCreated}`);
    console.log(`Active Agents: ${activeAgents}`);
    console.log(`Inactive Agents: ${totalAgentsCreated - activeAgents}`);
    console.log('\nAgents by Rank:');
    Object.keys(byRank).sort().forEach(rank => {
      console.log(`  ${rank}: ${byRank[rank]}`);
    });
    console.log('\nAgents by Specialization:');
    Object.keys(bySpecialization).sort().forEach(spec => {
      console.log(`  ${spec}: ${bySpecialization[spec]}`);
    });
    console.log('\nAgents by Status:');
    Object.keys(byStatus).sort().forEach(status => {
      console.log(`  ${status}: ${byStatus[status]}`);
    });
    console.log('\nAgents by Department:');
    const deptStats = await Department.find().select('name statistics');
    deptStats.forEach(dept => {
      console.log(`  ${dept.name}: ${dept.statistics.totalAgents} total, ${dept.statistics.activeAgents} active`);
    });
    console.log('='.repeat(60));

    await mongoose.connection.close();
    console.log('\n✅ Database population completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating agents:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

createAgents();

