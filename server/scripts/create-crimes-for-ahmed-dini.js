const mongoose = require('mongoose');
require('dotenv').config();
const OffenderOffence = require('../models/OffenderOffence');
const Offender = require('../models/Offender');
const OffenceCatalogue = require('../models/OffenceCatalogue');
const User = require('../models/User');

const cities = ['Bosaso', 'Garowe', 'Galkayo', 'Qardho', 'Burtinle', 'Eyl', 'Las Khorey'];
const states = ['Bari', 'Nugaal', 'Mudug', 'Sanaag', 'Sool'];

// Specific crimes for Ahmed Dini
const crimesForAhmedDini = [
  {
    title: 'Armed Robbery',
    description: 'Armed robbery of a local shop in Bosaso',
    category: 'violent_crime',
    severity: 'felony',
    status: 'convicted',
    dateOffset: -730, // 2 years ago
    location: { city: 'Bosaso', state: 'Bari' },
  },
  {
    title: 'Assault with Deadly Weapon',
    description: 'Assault causing serious bodily harm',
    category: 'violent_crime',
    severity: 'felony',
    status: 'convicted',
    dateOffset: -365, // 1 year ago
    location: { city: 'Garowe', state: 'Nugaal' },
  },
  {
    title: 'Drug Trafficking',
    description: 'Possession and distribution of illegal narcotics',
    category: 'drug_crime',
    severity: 'felony',
    status: 'under_investigation',
    dateOffset: -90, // 3 months ago
    location: { city: 'Bosaso', state: 'Bari' },
  },
  {
    title: 'Theft',
    description: 'Stole valuable items from residential property',
    category: 'property_crime',
    severity: 'serious',
    status: 'charged',
    dateOffset: -45, // 1.5 months ago
    location: { city: 'Galkayo', state: 'Mudug' },
  },
  {
    title: 'Vandalism',
    description: 'Damaged public infrastructure',
    category: 'property_crime',
    severity: 'moderate',
    status: 'dismissed',
    dateOffset: -1095, // 3 years ago
    location: { city: 'Bosaso', state: 'Bari' },
  },
];

async function createCrimesForAhmedDini() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/porr';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Find Ahmed Dini by ID or name
    let offender = await Offender.findOne({ 
      offenderId: '67887654'
    }).lean();

    if (!offender) {
      // Try to find by name
      offender = await Offender.findOne({ 
        'personalInfo.firstName': { $regex: /ahmed/i },
        'personalInfo.lastName': { $regex: /dini/i }
      }).lean();
    }

    // If still not found, try MongoDB ObjectId if it's a valid format
    if (!offender && mongoose.Types.ObjectId.isValid('67887654')) {
      offender = await Offender.findById('67887654').lean();
    }

    if (!offender) {
      console.error('Ahmed Dini not found. Searching all offenders...');
      const allOffenders = await Offender.find({}, 'personalInfo.firstName personalInfo.lastName offenderId _id').limit(10).lean();
      console.log('Available offenders:');
      allOffenders.forEach(off => {
        console.log(`- ${off.personalInfo?.firstName} ${off.personalInfo?.lastName} (ID: ${off.offenderId || off._id})`);
      });
      process.exit(1);
    }

    console.log(`Found offender: ${offender.personalInfo?.firstName} ${offender.personalInfo?.lastName}`);
    console.log(`Offender ID: ${offender._id}`);
    console.log(`Offender Number: ${offender.offenderId || 'N/A'}`);

    // Get a default user (super admin or first admin)
    const defaultUser = await User.findOne({
      $or: [
        { role: 'super_admin' },
        { role: 'admin' }
      ]
    }).lean();

    if (!defaultUser) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    // Get organisation ID from offender
    const organisationId = offender.organisationId;
    if (!organisationId) {
      console.error('No organisation ID found for offender.');
      process.exit(1);
    }

    console.log(`Using organisation ID: ${organisationId}`);
    console.log(`Using user ID: ${defaultUser._id}`);

    // Get all offence catalogues
    const offenceCatalogues = await OffenceCatalogue.find({ organisationId }).lean();
    console.log(`Found ${offenceCatalogues.length} offence catalogues`);

    if (offenceCatalogues.length === 0) {
      console.error('No offence catalogues found. Please create offence catalogues first.');
      process.exit(1);
    }

    // Group offence catalogues by category
    const cataloguesByCategory = {};
    offenceCatalogues.forEach(cat => {
      if (!cataloguesByCategory[cat.category]) {
        cataloguesByCategory[cat.category] = [];
      }
      cataloguesByCategory[cat.category].push(cat);
    });

    let totalCrimesCreated = 0;

    // Create crimes for Ahmed Dini
    for (const crimeTemplate of crimesForAhmedDini) {
      // Find a matching offence catalogue
      const matchingCatalogues = cataloguesByCategory[crimeTemplate.category] || [];
      
      let selectedCatalogue;
      if (matchingCatalogues.length === 0) {
        // If no matching catalogue, use any random one
        selectedCatalogue = offenceCatalogues[Math.floor(Math.random() * offenceCatalogues.length)];
      } else {
        // Prefer one that matches severity
        const severityMatch = matchingCatalogues.find(cat => cat.severity === crimeTemplate.severity);
        selectedCatalogue = severityMatch || matchingCatalogues[Math.floor(Math.random() * matchingCatalogues.length)];
      }

      // Calculate dates
      const dateCommitted = new Date();
      dateCommitted.setDate(dateCommitted.getDate() + crimeTemplate.dateOffset);
      
      const dateReported = new Date(dateCommitted);
      dateReported.setDate(dateReported.getDate() + Math.floor(Math.random() * 7)); // Reported within 7 days

      // Generate case number
      const existingCrimes = await OffenderOffence.countDocuments({ organisationId });
      const caseNumber = String(existingCrimes + totalCrimesCreated + 1).padStart(7, '0');

      // Create crime
      const crimeData = {
        crimeInfo: {
          crimeId: `CRIME-${String(existingCrimes + totalCrimesCreated + 1).padStart(6, '0')}`,
          caseNumber: caseNumber,
          title: crimeTemplate.title,
          description: crimeTemplate.description,
          category: crimeTemplate.category,
        },
        dateTime: {
          dateCommitted: dateCommitted,
          dateReported: dateReported,
          dateArrested: crimeTemplate.status !== 'reported' ? new Date(dateReported.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
          dateCharged: ['charged', 'trial', 'convicted'].includes(crimeTemplate.status) ? new Date(dateReported.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : undefined,
          dateConvicted: crimeTemplate.status === 'convicted' ? new Date(dateReported.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000) : undefined,
        },
        location: {
          city: crimeTemplate.location.city,
          state: crimeTemplate.location.state,
          country: 'Somalia',
          locationType: 'public',
        },
        offender: offender._id,
        offenceCatalogue: selectedCatalogue._id,
        legal: {
          status: crimeTemplate.status,
          severity: selectedCatalogue.severity || crimeTemplate.severity,
          charges: [{
            charge: selectedCatalogue.name,
            statute: selectedCatalogue.code,
          }],
        },
        organisationId: organisationId,
        createdBy: defaultUser._id,
        isActive: true,
      };

      try {
        const crime = new OffenderOffence(crimeData);
        await crime.save();
        totalCrimesCreated++;
        console.log(`✅ Created crime: "${crimeTemplate.title}" (Case: ${caseNumber})`);
        console.log(`   - Status: ${crimeTemplate.status}`);
        console.log(`   - Date: ${dateCommitted.toLocaleDateString()}`);
        console.log(`   - Location: ${crimeTemplate.location.city}, ${crimeTemplate.location.state}`);
      } catch (error) {
        console.error(`❌ Error creating crime "${crimeTemplate.title}":`, error.message);
      }
    }

    console.log(`\n✅ Successfully created ${totalCrimesCreated} crimes for Ahmed Dini`);
    console.log(`\nOffender: ${offender.personalInfo?.firstName} ${offender.personalInfo?.lastName}`);
    console.log(`Offender ID: ${offender._id}`);

  } catch (error) {
    console.error('Error creating crimes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
createCrimesForAhmedDini();

