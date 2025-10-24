# System Scripts

This directory contains utility scripts for the system.

## Setup Default Organisation

The `setup-default-organisation.js` script sets up a default organisation for the system.

### Usage

```bash
node scripts/setup-default-organisation.js
```

### Features

- Creates a default organisation if none exists
- Sets up initial system configuration
- Validates database connection

## File Structure

```
scripts/
├── README.md                    # This file
└── setup-default-organisation.js  # Organisation setup script
```

## Dependencies

- `mongoose`: MongoDB connection and models
- Organisation and User models
