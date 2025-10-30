const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/NPST";

async function migrateOffenceToOffenceCatalogue() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');

    const db = mongoose.connection.db;

    // Check if offences collection exists
    const collections = await db.listCollections().toArray();
    const offencesExists = collections.some(col => col.name === 'offences');
    
    if (!offencesExists) {
      console.log('❌ Offences collection does not exist. Nothing to migrate.');
      return;
    }

    console.log('📊 Starting migration from offences to offencecatalogues...');

    // 1. Rename the collection
    console.log('🔄 Step 1: Renaming offences collection to offencecatalogues...');
    await db.collection('offences').rename('offencecatalogues');
    console.log('✅ Collection renamed successfully');

    // 2. Update all references in OffenderOffence documents
    console.log('🔄 Step 2: Updating references in OffenderOffence documents...');
    const offenderOffencesCollection = db.collection('offenderoffences');
    
    // Update offence field to offenceCatalogue
    const updateResult = await offenderOffencesCollection.updateMany(
      { offence: { $exists: true } },
      { $rename: { offence: 'offenceCatalogue' } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} OffenderOffence documents`);

    // 3. Update references in Case documents
    console.log('🔄 Step 3: Updating references in Case documents...');
    const casesCollection = db.collection('cases');
    
    // Update offences array references using aggregation pipeline
    const caseUpdateResult = await casesCollection.updateMany(
      { 'offences.offenceId': { $exists: true } },
      [
        {
          $set: {
            offences: {
              $map: {
                input: '$offences',
                as: 'offence',
                in: {
                  $mergeObjects: [
                    '$$offence',
                    {
                      offenceCatalogueId: '$$offence.offenceId'
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $unset: 'offences.offenceId'
        }
      ]
    );
    console.log(`✅ Updated ${caseUpdateResult.modifiedCount} Case documents`);

    // 4. Update references in Offender criminal history
    console.log('🔄 Step 4: Updating references in Offender criminal history...');
    const offendersCollection = db.collection('offenders');
    
    const offenderUpdateResult = await offendersCollection.updateMany(
      { 'criminalHistory.offences.offenceId': { $exists: true } },
      [
        {
          $set: {
            'criminalHistory.offences': {
              $map: {
                input: '$criminalHistory.offences',
                as: 'offence',
                in: {
                  $mergeObjects: [
                    '$$offence',
                    {
                      offenceCatalogueId: '$$offence.offenceId'
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $unset: 'criminalHistory.offences.offenceId'
        }
      ]
    );
    console.log(`✅ Updated ${offenderUpdateResult.modifiedCount} Offender documents`);

    // 5. Update any other references that might exist
    console.log('🔄 Step 5: Checking for other references...');
    
    // Check if there are any other collections that might reference offences
    const allCollections = await db.listCollections().toArray();
    let totalOtherUpdates = 0;
    
    for (const collection of allCollections) {
      if (collection.name !== 'offencecatalogues' && collection.name !== 'offenderoffences' && collection.name !== 'cases' && collection.name !== 'offenders') {
        try {
          const otherUpdateResult = await db.collection(collection.name).updateMany(
            { offence: { $exists: true } },
            { $rename: { offence: 'offenceCatalogue' } }
          );
          if (otherUpdateResult.modifiedCount > 0) {
            console.log(`✅ Updated ${otherUpdateResult.modifiedCount} documents in ${collection.name}`);
            totalOtherUpdates += otherUpdateResult.modifiedCount;
          }
        } catch (error) {
          // Some collections might not have the offence field, that's okay
          console.log(`ℹ️  Skipped ${collection.name} (no offence field or error)`);
        }
      }
    }

    console.log(`✅ Updated ${totalOtherUpdates} other documents`);

    // 6. Create indexes on the new collection
    console.log('🔄 Step 6: Creating indexes on offencecatalogues collection...');
    const offenceCataloguesCollection = db.collection('offencecatalogues');
    
    await offenceCataloguesCollection.createIndex({ code: 1, organisationId: 1 });
    await offenceCataloguesCollection.createIndex({ name: 1, organisationId: 1 });
    await offenceCataloguesCollection.createIndex({ category: 1, organisationId: 1 });
    await offenceCataloguesCollection.createIndex({ severity: 1, organisationId: 1 });
    await offenceCataloguesCollection.createIndex({ isActive: 1, organisationId: 1 });
    
    console.log('✅ Indexes created successfully');

    // 7. Verify the migration
    console.log('🔄 Step 7: Verifying migration...');
    
    const offenceCataloguesCount = await offenceCataloguesCollection.countDocuments();
    console.log(`📊 Total offence catalogues: ${offenceCataloguesCount}`);
    
    const offenderOffencesWithOffenceCatalogue = await offenderOffencesCollection.countDocuments({
      offenceCatalogue: { $exists: true }
    });
    console.log(`📊 OffenderOffence documents with offenceCatalogue: ${offenderOffencesWithOffenceCatalogue}`);
    
    const casesWithOffenceCatalogueId = await casesCollection.countDocuments({
      'offences.offenceCatalogueId': { $exists: true }
    });
    console.log(`📊 Case documents with offenceCatalogueId: ${casesWithOffenceCatalogueId}`);
    
    const offendersWithOffenceCatalogueId = await offendersCollection.countDocuments({
      'criminalHistory.offences.offenceCatalogueId': { $exists: true }
    });
    console.log(`📊 Offender documents with offenceCatalogueId: ${offendersWithOffenceCatalogueId}`);

    console.log('🎉 Migration completed successfully!');
    console.log('📝 Summary:');
    console.log(`   - Renamed offences collection to offencecatalogues`);
    console.log(`   - Updated ${updateResult.modifiedCount} OffenderOffence documents`);
    console.log(`   - Updated ${caseUpdateResult.modifiedCount} Case documents`);
    console.log(`   - Updated ${offenderUpdateResult.modifiedCount} Offender documents`);
    console.log(`   - Updated ${totalOtherUpdates} other documents`);
    console.log(`   - Created indexes on offencecatalogues collection`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the migration
if (require.main === module) {
  migrateOffenceToOffenceCatalogue()
    .then(() => {
      console.log('✅ Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateOffenceToOffenceCatalogue;
