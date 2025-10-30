const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Victim = require('../models/Victim');
const OffenderOffence = require('../models/OffenderOffence');
const Offender = require('../models/Offender');
const Offence = require('../models/Offence');
const Organisation = require('../models/Organisation');

const testNewEntities = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://cscs_user:Friday14=@130.255.30.153:27017/porr?authSource=admin');
    console.log('✅ Connected to MongoDB');

    // Get the first organisation
    const organisation = await Organisation.findOne();
    if (!organisation) {
      console.log('❌ No organisation found. Please create an organisation first.');
      return;
    }

    console.log(`📋 Using organisation: ${organisation.name} (${organisation._id})`);

    // Get the first offender and offence
    const offender = await Offender.findOne({ organisationId: organisation._id });
    const offence = await Offence.findOne({ organisationId: organisation._id });

    if (!offender) {
      console.log('❌ No offender found. Please create an offender first.');
      return;
    }

    if (!offence) {
      console.log('❌ No offence found. Please create an offence first.');
      return;
    }

    console.log(`👤 Using offender: ${offender.personalInfo.firstName} ${offender.personalInfo.lastName} (${offender._id})`);
    console.log(`⚖️ Using offence: ${offence.name} (${offence._id})`);

    // Create a test victim
    console.log('\n🔍 Creating test victim...');
    const victimData = {
      personalInfo: {
        firstName: 'Ahmed',
        lastName: 'Hassan',
        dateOfBirth: new Date('1990-05-15'),
        gender: 'male',
        nationality: 'Somali',
        nationalId: 'VIC001234',
        phoneNumber: '+252123456789',
        email: 'ahmed.hassan@example.com'
      },
      address: {
        current: {
          street: 'Main Street 123',
          city: 'Garowe',
          state: 'Nugaal',
          country: 'Somalia',
          postalCode: '12345'
        }
      },
      status: {
        isActive: true,
        isDeceased: false,
        isMinor: false
      },
      impactAssessment: {
        physicalInjuries: [{
          type: 'Bruising',
          severity: 'minor',
          description: 'Minor bruising on left arm',
          recoveryStatus: 'recovered'
        }],
        psychologicalImpact: {
          traumaLevel: 'mild',
          counselingRequired: false,
          notes: 'Victim is coping well'
        },
        financialImpact: {
          medicalExpenses: 50,
          lostWages: 200,
          propertyDamage: 0
        }
      },
      emergencyContact: {
        name: 'Fatima Hassan',
        relationship: 'Sister',
        phone: '+252987654321',
        email: 'fatima.hassan@example.com'
      },
      caseInfo: {
        caseNumbers: ['CASE-001', 'CASE-002']
      },
      notes: 'Test victim for system validation',
      tags: ['test', 'validation'],
      organisationId: organisation._id,
      createdBy: offender.createdBy
    };

    const victim = new Victim(victimData);
    await victim.save();
    console.log(`✅ Victim created: ${victim.caseInfo.victimId} (${victim._id})`);

    // Create a test crime (OffenderOffence)
    console.log('\n🔍 Creating test crime...');
    const crimeData = {
      crimeInfo: {
        caseNumber: 'CRIME-2024-001',
        title: 'Theft and Assault',
        description: 'Robbery with physical assault on victim',
        category: 'Violent Crime',
        subcategory: 'Robbery'
      },
      dateTime: {
        dateCommitted: new Date('2024-01-15'),
        timeCommitted: '14:30',
        dateReported: new Date('2024-01-15'),
        dateArrested: new Date('2024-01-16'),
        dateCharged: new Date('2024-01-17')
      },
      location: {
        street: 'Main Street 123',
        city: 'Garowe',
        state: 'Nugaal',
        country: 'Somalia',
        postalCode: '12345',
        locationType: 'commercial',
        specificLocation: 'Main Street Mall, Shop #5'
      },
      offender: offender._id,
      offence: offence._id,
      victims: [{
        victim: victim._id,
        relationshipToOffender: 'stranger',
        victimImpact: {
          physicalInjury: true,
          psychologicalImpact: 'mild',
          financialLoss: 250
        }
      }],
      legal: {
        status: 'charged',
        severity: 'serious',
        charges: [{
          charge: 'Theft',
          statute: 'Penal Code Section 123',
          penalty: 'Up to 5 years imprisonment'
        }, {
          charge: 'Assault',
          statute: 'Penal Code Section 456',
          penalty: 'Up to 3 years imprisonment'
        }],
        prosecutor: {
          name: 'Prosecutor Ali Mohamed',
          id: 'PROS-001'
        }
      },
      investigation: {
        assignedOfficer: 'Officer Ahmed Ali',
        assignedDetective: 'Detective Fatima Omar',
        evidence: [{
          type: 'physical',
          description: 'Security camera footage',
          collectedDate: new Date('2024-01-15'),
          location: 'Main Street Mall',
          status: 'analyzed'
        }, {
          type: 'witness',
          description: 'Eyewitness testimony',
          collectedDate: new Date('2024-01-15'),
          location: 'Crime scene',
          status: 'collected'
        }],
        witnesses: [{
          name: 'Hassan Mohamed',
          contactInfo: '+252123456789',
          statement: 'Saw the incident from across the street',
          credibility: 'high'
        }],
        motive: 'Financial gain',
        method: 'Physical confrontation and theft'
      },
      financialImpact: {
        propertyDamage: 0,
        stolenValue: 500,
        investigationCost: 200,
        courtCosts: 100,
        victimCompensation: 250
      },
      media: {
        isPublic: true,
        mediaCoverage: 'local'
      },
      riskAssessment: {
        threatLevel: 'medium',
        recidivismRisk: 'medium',
        publicSafetyRisk: 'low'
      },
      notes: 'Test crime for system validation',
      tags: ['test', 'theft', 'assault'],
      organisationId: organisation._id,
      createdBy: offender.createdBy
    };

    const crime = new OffenderOffence(crimeData);
    await crime.save();
    console.log(`✅ Crime created: ${crime.crimeInfo.crimeId} (${crime._id})`);

    // Test population
    console.log('\n🔍 Testing population...');
    const populatedCrime = await OffenderOffence.findById(crime._id)
      .populate('offender', 'personalInfo.firstName personalInfo.lastName offenderId')
      .populate('offence', 'name code category')
      .populate('victims.victim', 'personalInfo.firstName personalInfo.lastName caseInfo.victimId');

    console.log('📋 Populated crime data:');
    console.log(`   - Offender: ${populatedCrime.offender.personalInfo.firstName} ${populatedCrime.offender.personalInfo.lastName}`);
    console.log(`   - Offence: ${populatedCrime.offence.name} (${populatedCrime.offence.code})`);
    console.log(`   - Victim: ${populatedCrime.victims[0].victim.personalInfo.firstName} ${populatedCrime.victims[0].victim.personalInfo.lastName}`);

    // Test statistics
    console.log('\n📊 Entity Statistics:');
    const victimCount = await Victim.countDocuments({ organisationId: organisation._id });
    const crimeCount = await OffenderOffence.countDocuments({ organisationId: organisation._id });
    
    console.log(`   - Total Victims: ${victimCount}`);
    console.log(`   - Total Crimes: ${crimeCount}`);

    // Test queries
    console.log('\n🔍 Testing queries...');
    
    // Find crimes by offender
    const offenderCrimes = await OffenderOffence.find({ offender: offender._id });
    console.log(`   - Crimes by offender: ${offenderCrimes.length}`);

    // Find crimes by status
    const chargedCrimes = await OffenderOffence.find({ 'legal.status': 'charged' });
    console.log(`   - Charged crimes: ${chargedCrimes.length}`);

    // Find victims by impact
    const injuredVictims = await Victim.find({ 'impactAssessment.physicalInjuries': { $exists: true, $ne: [] } });
    console.log(`   - Injured victims: ${injuredVictims.length}`);

    console.log('\n✅ All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`   - Victim ID: ${victim.caseInfo.victimId}`);
    console.log(`   - Crime ID: ${crime.crimeInfo.crimeId}`);
    console.log(`   - Case Number: ${crime.crimeInfo.caseNumber}`);

  } catch (error) {
    console.error('❌ Error testing new entities:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Run the test
testNewEntities();
