const mongoose = require('mongoose');
require('dotenv').config();
const OffenderOffence = require('../models/OffenderOffence');
const Offender = require('../models/Offender');
const OffenceCatalogue = require('../models/OffenceCatalogue');
const User = require('../models/User');

const cities = ['Bosaso', 'Garowe', 'Galkayo', 'Qardho', 'Burtinle', 'Eyl', 'Las Khorey'];
const states = ['Bari', 'Nugaal', 'Mudug', 'Sanaag', 'Sool'];

// Sample crime data
const sampleCrimes = [
  {
    title: 'Theft from Shop',
    description: 'Stole merchandise from local store',
    category: 'property_crime',
    severity: 'moderate',
    status: 'convicted',
    dateOffset: -180, // 6 months ago
  },
  {
    title: 'Assault',
    description: 'Physical altercation causing injury',
    category: 'violent_crime',
    severity: 'serious',
    status: 'under_investigation',
    dateOffset: -90, // 3 months ago
  },
  {
    title: 'Drug Possession',
    description: 'Found in possession of illegal substances',
    category: 'drug_crime',
    severity: 'major',
    status: 'charged',
    dateOffset: -30, // 1 month ago
  },
  {
    title: 'Vandalism',
    description: 'Damaged public property',
    category: 'property_crime',
    severity: 'minor',
    status: 'dismissed',
    dateOffset: -365, // 1 year ago
  },
  {
    title: 'Robbery',
    description: 'Armed robbery of a business',
    category: 'violent_crime',
    severity: 'felony',
    status: 'trial',
    dateOffset: -60, // 2 months ago
  },
  {
    title: 'Fraud',
    description: 'Financial fraud scheme',
    category: 'white_collar_crime',
    severity: 'serious',
    status: 'convicted',
    dateOffset: -120, // 4 months ago
  },
  {
    title: 'Trespassing',
    description: 'Unauthorized entry into private property',
    category: 'property_crime',
    severity: 'minor',
    status: 'acquitted',
    dateOffset: -240, // 8 months ago
  },
  {
    title: 'Public Disorder',
    description: 'Disturbing the peace',
    category: 'public_order',
    severity: 'moderate',
    status: 'reported',
    dateOffset: -15, // 2 weeks ago
  },
];

async function populateSampleCrimes() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/porr';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

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

    // Get organisation ID from user
    const organisationId = defaultUser.organisationId;
    if (!organisationId) {
      console.error('No organisation ID found for user. Please ensure users are assigned to organisations.');
      process.exit(1);
    }

    console.log(`Using organisation ID: ${organisationId}`);
    console.log(`Using user ID: ${defaultUser._id}`);

    // Get all offenders
    const offenders = await Offender.find({ organisationId }).limit(20).lean();
    console.log(`Found ${offenders.length} offenders`);

    if (offenders.length === 0) {
      console.error('No offenders found. Please create offenders first.');
      process.exit(1);
    }

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

    // For each offender, create 2-5 random crimes
    for (const offender of offenders) {
      const numCrimes = Math.floor(Math.random() * 4) + 2; // 2-5 crimes per offender
      const selectedCrimes = sampleCrimes
        .sort(() => Math.random() - 0.5)
        .slice(0, numCrimes);

      for (const crimeTemplate of selectedCrimes) {
        // Find a matching offence catalogue
        const matchingCatalogues = cataloguesByCategory[crimeTemplate.category] || [];
        
        if (matchingCatalogues.length === 0) {
          // If no matching catalogue, use any random one
          const randomCatalogue = offenceCatalogues[Math.floor(Math.random() * offenceCatalogues.length)];
          var selectedCatalogue = randomCatalogue;
        } else {
          var selectedCatalogue = matchingCatalogues[Math.floor(Math.random() * matchingCatalogues.length)];
        }

        // Calculate dates
        const dateCommitted = new Date();
        dateCommitted.setDate(dateCommitted.getDate() + crimeTemplate.dateOffset);
        
        const dateReported = new Date(dateCommitted);
        dateReported.setDate(dateReported.getDate() + Math.floor(Math.random() * 7)); // Reported within 7 days

        // Random location
        const city = cities[Math.floor(Math.random() * cities.length)];
        const state = states[Math.floor(Math.random() * states.length)];

        // Generate case number (will be auto-generated by pre-save hook, but we can set it)
        const existingCrimes = await OffenderOffence.countDocuments({ organisationId });
        const caseNumber = String(existingCrimes + 1).padStart(7, '0');

        // Create crime
        const crimeData = {
          crimeInfo: {
            crimeId: `CRIME-${String(existingCrimes + 1).padStart(6, '0')}`,
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
            city: city,
            state: state,
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
          console.log(`Created crime "${crimeTemplate.title}" for offender ${offender.personalInfo?.firstName} ${offender.personalInfo?.lastName}`);
        } catch (error) {
          console.error(`Error creating crime for ${offender.personalInfo?.firstName}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Successfully created ${totalCrimesCreated} crimes for ${offenders.length} offenders`);
    console.log(`\nRelationships established:`);
    console.log(`- Offender → Crime (OffenderOffence)`);
    console.log(`- Crime → OffenceCatalogue`);
    console.log(`- All crimes linked to organisation: ${organisationId}`);

  } catch (error) {
    console.error('Error populating sample crimes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    process.exit(0);
  }
}

// Run the script
populateSampleCrimes();

