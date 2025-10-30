# New Entity Relationships: Victim and OffenderOffence (Crime)

## Overview

This document describes the new entity relationships implemented to properly track crimes committed by offenders against victims. The system now includes:

1. **Victim Entity** - Tracks crime victims with comprehensive personal and impact information
2. **OffenderOffence Entity** - Records specific crimes committed by offenders, linking them to victims and offences

## Entity Models

### Victim Model (`/models/Victim.js`)

The Victim model tracks individuals who have been affected by crimes:

#### Key Features:
- **Personal Information**: Name, DOB, gender, nationality, contact details
- **Physical Description**: Height, weight, eye/hair color, distinguishing marks
- **Address Information**: Current and permanent addresses with coordinates
- **Status Tracking**: Active/inactive, deceased status, minor status with guardian info
- **Impact Assessment**: Physical injuries, psychological impact, financial losses
- **Emergency Contact**: Guardian or emergency contact information
- **Case Information**: Victim ID, case numbers, assigned personnel

#### Sample Victim Data:
```javascript
{
  personalInfo: {
    firstName: "Ahmed",
    lastName: "Hassan",
    dateOfBirth: "1990-05-15",
    gender: "male",
    nationality: "Somali",
    nationalId: "VIC001234"
  },
  status: {
    isActive: true,
    isDeceased: false,
    isMinor: false
  },
  impactAssessment: {
    physicalInjuries: [{
      type: "Bruising",
      severity: "minor",
      recoveryStatus: "recovered"
    }],
    psychologicalImpact: {
      traumaLevel: "mild",
      counselingRequired: false
    }
  }
}
```

### OffenderOffence Model (`/models/OffenderOffence.js`)

The OffenderOffence model (referred to as "Crime" in the API) records specific criminal acts:

#### Key Features:
- **Crime Information**: Case number, title, description, category
- **Date/Time Tracking**: Committed, reported, arrested, charged, convicted dates
- **Location Details**: Street, city, state, coordinates, location type
- **Relationships**: Links to offender, offence, and victims
- **Legal Information**: Status, severity, charges, court, verdict, sentence
- **Investigation**: Assigned officers, evidence, witnesses, suspects
- **Financial Impact**: Property damage, stolen value, costs
- **Risk Assessment**: Threat level, recidivism risk, public safety risk

#### Sample Crime Data:
```javascript
{
  crimeInfo: {
    caseNumber: "CRIME-2024-001",
    title: "Theft and Assault",
    description: "Robbery with physical assault",
    category: "Violent Crime"
  },
  offender: "offender_id",
  offence: "offence_id",
  victims: [{
    victim: "victim_id",
    relationshipToOffender: "stranger",
    victimImpact: {
      physicalInjury: true,
      psychologicalImpact: "mild"
    }
  }],
  legal: {
    status: "charged",
    severity: "serious"
  }
}
```

## API Endpoints

### Victim Endpoints (`/api/victims`)

- `GET /api/victims` - List all victims with pagination and filters
- `GET /api/victims/:id` - Get specific victim details
- `POST /api/victims` - Create new victim
- `PUT /api/victims/:id` - Update victim information
- `DELETE /api/victims/:id` - Delete victim
- `GET /api/victims/stats/overview` - Get victim statistics

### Crime Endpoints (`/api/crimes`)

- `GET /api/crimes` - List all crimes with pagination and filters
- `GET /api/crimes/:id` - Get specific crime details
- `POST /api/crimes` - Create new crime record
- `PUT /api/crimes/:id` - Update crime information
- `DELETE /api/crimes/:id` - Delete crime record
- `GET /api/crimes/offender/:offenderId` - Get crimes by specific offender
- `GET /api/crimes/stats/overview` - Get crime statistics

## Database Relationships

### One-to-Many Relationships:
- **Organisation → Victims**: One organisation has many victims
- **Organisation → Crimes**: One organisation has many crimes
- **Offender → Crimes**: One offender can commit many crimes
- **Offence → Crimes**: One offence type can be used in many crimes

### Many-to-Many Relationships:
- **Victims ↔ Crimes**: One victim can be affected by multiple crimes, one crime can have multiple victims

### Referenced Relationships:
- **Crime → Offender**: Each crime references one offender
- **Crime → Offence**: Each crime references one offence type
- **Crime → Court**: Each crime can reference one court
- **Crime → Victims**: Each crime can reference multiple victims

## Key Benefits

### 1. **Comprehensive Crime Tracking**
- Complete timeline from crime commission to conviction
- Detailed location and evidence tracking
- Financial impact assessment

### 2. **Victim Support**
- Physical and psychological impact tracking
- Financial loss documentation
- Emergency contact management
- Guardian information for minors

### 3. **Investigation Management**
- Evidence collection and status tracking
- Witness information and credibility assessment
- Assigned personnel tracking
- Motive and method documentation

### 4. **Legal Process Tracking**
- Complete legal status progression
- Charge details with statutes and penalties
- Court and personnel assignments
- Verdict and sentence tracking

### 5. **Risk Assessment**
- Threat level evaluation
- Recidivism risk assessment
- Public safety risk analysis

## Usage Examples

### Creating a Victim
```javascript
const victimData = {
  personalInfo: {
    firstName: "Ahmed",
    lastName: "Hassan",
    dateOfBirth: "1990-05-15",
    gender: "male",
    nationality: "Somali"
  },
  status: {
    isActive: true,
    isDeceased: false,
    isMinor: false
  },
  organisationId: "org_id",
  createdBy: "user_id"
};

const victim = await api.createVictim(victimData);
```

### Creating a Crime
```javascript
const crimeData = {
  crimeInfo: {
    caseNumber: "CRIME-2024-001",
    title: "Theft and Assault",
    description: "Robbery with physical assault"
  },
  dateTime: {
    dateCommitted: "2024-01-15",
    dateReported: "2024-01-15"
  },
  location: {
    city: "Garowe",
    state: "Nugaal",
    country: "Somalia"
  },
  offender: "offender_id",
  offence: "offence_id",
  victims: [{
    victim: "victim_id",
    relationshipToOffender: "stranger"
  }],
  legal: {
    status: "reported",
    severity: "serious"
  },
  organisationId: "org_id",
  createdBy: "user_id"
};

const crime = await api.createCrime(crimeData);
```

### Querying Crimes by Offender
```javascript
const offenderCrimes = await api.getCrimesByOffender("offender_id");
```

### Getting Crime Statistics
```javascript
const stats = await api.getCrimeStats();
// Returns: total crimes, recent crimes, by status, by severity, by month
```

## Testing

Run the test script to validate the new entities:

```bash
cd server
node scripts/test-new-entities.js
```

This will:
1. Create a test victim
2. Create a test crime linking offender, offence, and victim
3. Test population and relationships
4. Display statistics and query results

## Migration Notes

### Existing Data
- Existing offender criminal history will be preserved
- New crimes will automatically update offender's criminal history
- No data loss during migration

### API Changes
- New endpoints added for victims and crimes
- Existing offender endpoints remain unchanged
- New types added to frontend TypeScript definitions

### Frontend Integration
- New API methods added to `ApiService`
- TypeScript interfaces defined for `Victim` and `OffenderOffence`
- Form data interfaces for creating/updating entities

## Security Considerations

- All endpoints require authentication
- Role-based access control enforced
- Organisation-level data isolation
- Audit logging for all operations
- Input validation and sanitization

## Future Enhancements

1. **Media Management**: Photo/document uploads for evidence
2. **Timeline Visualization**: Crime progression timeline
3. **Geographic Mapping**: Crime location mapping
4. **Report Generation**: Automated crime reports
5. **Notification System**: Victim and officer notifications
6. **Integration**: Court system integration
7. **Analytics**: Advanced crime analytics and trends
