# Property Management System Scripts

This directory contains utility scripts for the property management system.

## Tenant Generator

The `tenant-generator.js` script generates realistic Somali tenant data for testing and development purposes.

### Usage

```bash
# Generate 10 tenants and save to JSON file
node scripts/tenant-generator.js 10

# Generate 50 tenants and import to database
node scripts/tenant-generator.js 50 --import

# Generate 100 tenants and save to JSON file
node scripts/tenant-generator.js 100
```

### Features

- **Realistic Data**: Generates authentic Somali names, UK addresses, and occupations
- **Complete Profiles**: Includes documents, references, contact information, and income data
- **Flexible Output**: Can save to JSON file or import directly to database
- **Comprehensive Summary**: Shows statistics and sample data
- **Unique Data**: Ensures no duplicate emails or phone numbers

### Generated Data Includes

- **Personal Information**: Name, date of birth, nationality, occupation, employer, income
- **Contact Information**: Email, phone, alternate phone, complete UK address
- **Documents**: ID, passport, driving license, employment letter, bank statement
- **References**: Community references with relationships and contact details
- **Status Information**: Active/inactive status, risk level, notes

### Output

- **JSON Files**: Saved to `generated-data/` directory with timestamp
- **Database Import**: Direct import to MongoDB with connection validation
- **Summary Reports**: Detailed statistics and sample data display

### Configuration

The script uses the following configuration:
- **Database**: Remote MongoDB connection
- **Output Directory**: `generated-data/`
- **Default Count**: 10 tenants
- **Data Sources**: Curated lists of Somali names, UK locations, and occupations

### Examples

```bash
# Quick test with 5 tenants
node scripts/tenant-generator.js 5

# Generate test data for development
node scripts/tenant-generator.js 25

# Create production test data
node scripts/tenant-generator.js 100 --import
```

## File Structure

```
scripts/
├── README.md              # This file
├── tenant-generator.js    # Main tenant generation script
└── generated-data/        # Output directory for JSON files
    ├── tenants-10-2024-01-15T10-30-00-000Z.json
    ├── tenants-50-2024-01-15T11-45-00-000Z.json
    └── ...
```

## Dependencies

- `mongoose`: MongoDB connection and models
- `fs`: File system operations
- `path`: File path utilities
- `../models/Tenant`: Tenant model definition
- `../utils/generateId`: ID generation utilities

## Notes

- All generated data is realistic and suitable for testing
- Email addresses and phone numbers are guaranteed unique
- Income ranges are based on occupation categories
- Addresses use real UK postal codes and street names
- Document expiry dates are set to realistic future dates
