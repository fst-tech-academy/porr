#!/usr/bin/env node

const { removeBrokerRelationships } = require('./server/migrations/remove_broker_relationships');

console.log('Running database migration to remove broker relationships...');
console.log('This will remove the broker field from all properties and leases in the database.');
console.log('');

// Ask for confirmation
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Are you sure you want to proceed? (yes/no): ', async (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    try {
      await removeBrokerRelationships();
      console.log('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  } else {
    console.log('Migration cancelled.');
  }
  
  rl.close();
});
