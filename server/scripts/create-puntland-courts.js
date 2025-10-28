const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/porr');

// Import models
const Court = require('../models/Court');
const Organisation = require('../models/Organisation');
const User = require('../models/User');

// Comprehensive list of courts in Puntland, Somalia
const puntlandCourts = [
  // Court of Appeal of Bari (provided)
  {
    "name": "Court of Appeal of Bari",
    "code": "BARI-CA-001",
    "type": "appeals_court",
    "jurisdiction": "state",
    "level": "appellate",
    "description": "The highest appellate court in Bari region, handling appeals from district courts",
    "address": {
      "street": "Main St.",
      "city": "Bosaso",
      "state": "Bari",
      "country": "Somalia",
      "postalCode": "12345",
      "coordinates": {
        "latitude": 11.2802,
        "longitude": 49.1830
      }
    },
    "contactInfo": {
      "phone": "+25212345678",
      "email": "info@bari-court.so",
      "fax": "+25212345679",
      "website": "https://bari-court.so"
    },
    "personnel": {
      "judges": [
        {
          "name": "Judge Ahmed Mohamed",
          "title": "Chief Judge",
          "specialization": ["Criminal Law", "Family Law"],
          "contactInfo": {
            "phone": "+25212345680",
            "email": "judge.ahmed@bari-court.so"
          },
          "isActive": true
        }
      ],
      "clerks": [
        {
          "name": "Clerk Fatima Ali",
          "title": "Court Clerk",
          "contactInfo": {
            "phone": "+25212345681",
            "email": "fatima.ali@bari-court.so"
          },
          "isActive": true
        }
      ],
      "prosecutors": [
        {
          "name": "Prosecutor Mohamed Hussein",
          "title": "Senior Prosecutor",
          "specialization": ["Criminal Law"],
          "contactInfo": {
            "phone": "+25212345682",
            "email": "mohamed.hussein@bari-court.so"
          },
          "isActive": true
        }
      ]
    },
    "operations": {
      "businessHours": {
        "monday": { "open": "08:00", "close": "17:00" },
        "tuesday": { "open": "08:00", "close": "17:00" },
        "wednesday": { "open": "08:00", "close": "17:00" },
        "thursday": { "open": "08:00", "close": "17:00" },
        "friday": { "open": "08:00", "close": "17:00" },
        "saturday": { "open": "08:00", "close": "17:00" },
        "sunday": { "open": "08:00", "close": "17:00" }
      },
      "holidays": ["2025-12-25", "2025-07-04"],
      "capacity": {
        "courtrooms": 3,
        "seatingCapacity": 100
      },
      "facilities": [
        {
          "name": "Courtroom 1",
          "type": "courtroom",
          "capacity": 50,
          "equipment": ["Projector", "Microphone", "Air Conditioning"]
        },
        {
          "name": "Conference Room A",
          "type": "conference_room",
          "capacity": 20,
          "equipment": ["Conference Phone", "Whiteboard"]
        }
      ]
    },
    "caseManagement": {
      "caseTypes": ["Civil", "Criminal", "Family"],
      "maxCaseLoad": 500,
      "currentCaseLoad": 150,
      "averageProcessingTime": 45,
      "backlogThreshold": 100
    },
    "budget": {
      "annual": 500000,
      "currency": "USD",
      "allocated": 200000,
      "spent": 150000,
      "remaining": 50000
    },
    "metrics": {
      "casesProcessed": 350,
      "averageResolutionTime": 30,
      "successRate": 85,
      "satisfactionRating": 4.5,
      "lastUpdated": "2025-10-28T00:00:00Z"
    },
    "isActive": true,
    "establishedDate": "2000-01-01T00:00:00Z",
    "lastInspectionDate": "2024-10-15T00:00:00Z",
    "nextInspectionDate": "2025-10-15T00:00:00Z",
    "tags": ["criminal", "family", "state"],
    "notes": "Active court with ongoing cases"
  },

  // Court of Appeal of Nugaal (provided)
  {
    "name": "Court of Appeal of Nugaal",
    "code": "NUGAAL-CA-002",
    "type": "appeals_court",
    "jurisdiction": "state",
    "level": "appellate",
    "description": "The highest appellate court in Nugaal region, handling appeals from district courts",
    "address": {
      "street": "Court Rd.",
      "city": "Garowe",
      "state": "Nugaal",
      "country": "Somalia",
      "postalCode": "67890",
      "coordinates": {
        "latitude": 8.4000,
        "longitude": 48.4844
      }
    },
    "contactInfo": {
      "phone": "+25298765432",
      "email": "info@nugaal-court.so",
      "fax": "+25298765433",
      "website": "https://nugaal-court.so"
    },
    "personnel": {
      "judges": [
        {
          "name": "Judge Amina Ismail",
          "title": "Chief Judge",
          "specialization": ["Commercial Law", "Property Law"],
          "contactInfo": {
            "phone": "+25298765434",
            "email": "amina.ismail@nugaal-court.so"
          },
          "isActive": true
        }
      ],
      "clerks": [
        {
          "name": "Clerk Mohamed Ali",
          "title": "Court Clerk",
          "contactInfo": {
            "phone": "+25298765435",
            "email": "mohamed.ali@nugaal-court.so"
          },
          "isActive": true
        }
      ],
      "prosecutors": [
        {
          "name": "Prosecutor Huda Ali",
          "title": "Senior Prosecutor",
          "specialization": ["Criminal Law", "Terrorism"],
          "contactInfo": {
            "phone": "+25298765436",
            "email": "huda.ali@nugaal-court.so"
          },
          "isActive": true
        }
      ]
    },
    "operations": {
      "businessHours": {
        "monday": { "open": "08:00", "close": "17:00" },
        "tuesday": { "open": "08:00", "close": "17:00" },
        "wednesday": { "open": "08:00", "close": "17:00" },
        "thursday": { "open": "08:00", "close": "17:00" },
        "friday": { "open": "08:00", "close": "17:00" },
        "saturday": { "open": "08:00", "close": "17:00" },
        "sunday": { "open": "08:00", "close": "17:00" }
      },
      "holidays": ["2025-12-25", "2025-07-04"],
      "capacity": {
        "courtrooms": 2,
        "seatingCapacity": 80
      },
      "facilities": [
        {
          "name": "Courtroom 1",
          "type": "courtroom",
          "capacity": 40,
          "equipment": ["Microphone", "Whiteboard"]
        },
        {
          "name": "Holding Cell",
          "type": "holding_cell",
          "capacity": 10,
          "equipment": ["Security Cameras"]
        }
      ]
    },
    "caseManagement": {
      "caseTypes": ["Criminal", "Civil"],
      "maxCaseLoad": 400,
      "currentCaseLoad": 100,
      "averageProcessingTime": 60,
      "backlogThreshold": 80
    },
    "budget": {
      "annual": 400000,
      "currency": "USD",
      "allocated": 150000,
      "spent": 100000,
      "remaining": 50000
    },
    "metrics": {
      "casesProcessed": 250,
      "averageResolutionTime": 45,
      "successRate": 90,
      "satisfactionRating": 4.7,
      "lastUpdated": "2025-10-28T00:00:00Z"
    },
    "isActive": true,
    "establishedDate": "2005-01-01T00:00:00Z",
    "lastInspectionDate": "2024-10-15T00:00:00Z",
    "nextInspectionDate": "2025-10-15T00:00:00Z",
    "tags": ["criminal", "civil", "state"],
    "notes": "Active court with a growing case load"
  },

  // Additional Courts in Puntland
  {
    "name": "Supreme Court of Puntland",
    "code": "PUNTLAND-SC-001",
    "type": "supreme_court",
    "jurisdiction": "state",
    "level": "supreme",
    "description": "The highest court in Puntland State, handling constitutional and final appeals",
    "address": {
      "street": "Supreme Court Building",
      "city": "Garowe",
      "state": "Nugaal",
      "country": "Somalia",
      "postalCode": "67891",
      "coordinates": {
        "latitude": 8.4050,
        "longitude": 48.4850
      }
    },
    "contactInfo": {
      "phone": "+25298765440",
      "email": "info@puntland-supreme.so",
      "fax": "+25298765441",
      "website": "https://puntland-supreme.so"
    },
    "personnel": {
      "judges": [
        {
          "name": "Chief Justice Hassan Ali",
          "title": "Chief Justice",
          "specialization": ["Constitutional Law", "Administrative Law"],
          "contactInfo": {
            "phone": "+25298765442",
            "email": "chief.justice@puntland-supreme.so"
          },
          "isActive": true
        },
        {
          "name": "Justice Fatima Mohamed",
          "title": "Associate Justice",
          "specialization": ["Criminal Law", "Human Rights"],
          "contactInfo": {
            "phone": "+25298765443",
            "email": "justice.fatima@puntland-supreme.so"
          },
          "isActive": true
        }
      ],
      "clerks": [
        {
          "name": "Clerk Abdullahi Hassan",
          "title": "Chief Clerk",
          "contactInfo": {
            "phone": "+25298765444",
            "email": "clerk.abdullahi@puntland-supreme.so"
          },
          "isActive": true
        }
      ],
      "prosecutors": [
        {
          "name": "Prosecutor General Ahmed Ali",
          "title": "Prosecutor General",
          "specialization": ["Constitutional Law", "Criminal Law"],
          "contactInfo": {
            "phone": "+25298765445",
            "email": "prosecutor.general@puntland-supreme.so"
          },
          "isActive": true
        }
      ]
    },
    "operations": {
      "businessHours": {
        "monday": { "open": "08:00", "close": "17:00" },
        "tuesday": { "open": "08:00", "close": "17:00" },
        "wednesday": { "open": "08:00", "close": "17:00" },
        "thursday": { "open": "08:00", "close": "17:00" },
        "friday": { "open": "08:00", "close": "17:00" },
        "saturday": { "open": "08:00", "close": "17:00" },
        "sunday": { "open": "08:00", "close": "17:00" }
      },
      "holidays": ["2025-12-25", "2025-07-04"],
      "capacity": {
        "courtrooms": 2,
        "seatingCapacity": 120
      },
      "facilities": [
        {
          "name": "Supreme Courtroom",
          "type": "courtroom",
          "capacity": 60,
          "equipment": ["Projector", "Microphone", "Air Conditioning", "Recording System"]
        },
        {
          "name": "Judges Chambers",
          "type": "office",
          "capacity": 5,
          "equipment": ["Computer", "Printer", "Library"]
        }
      ]
    },
    "caseManagement": {
      "caseTypes": ["Constitutional", "Administrative", "Criminal", "Civil"],
      "maxCaseLoad": 200,
      "currentCaseLoad": 50,
      "averageProcessingTime": 90,
      "backlogThreshold": 30
    },
    "budget": {
      "annual": 800000,
      "currency": "USD",
      "allocated": 300000,
      "spent": 200000,
      "remaining": 100000
    },
    "metrics": {
      "casesProcessed": 150,
      "averageResolutionTime": 75,
      "successRate": 95,
      "satisfactionRating": 4.8,
      "lastUpdated": "2025-10-28T00:00:00Z"
    },
    "isActive": true,
    "establishedDate": "1998-01-01T00:00:00Z",
    "lastInspectionDate": "2024-10-15T00:00:00Z",
    "nextInspectionDate": "2025-10-15T00:00:00Z",
    "tags": ["constitutional", "supreme", "state"],
    "notes": "Highest court in Puntland State"
  },

  {
    "name": "District Court of Bosaso",
    "code": "BOSASO-DC-001",
    "type": "district_court",
    "jurisdiction": "state",
    "level": "trial",
    "description": "Primary trial court in Bosaso, handling civil and criminal cases",
    "address": {
      "street": "District Court St.",
      "city": "Bosaso",
      "state": "Bari",
      "country": "Somalia",
      "postalCode": "12346",
      "coordinates": {
        "latitude": 11.2850,
        "longitude": 49.1850
      }
    },
    "contactInfo": {
      "phone": "+25212345690",
      "email": "info@bosaso-district.so",
      "fax": "+25212345691",
      "website": "https://bosaso-district.so"
    },
    "personnel": {
      "judges": [
        {
          "name": "Judge Omar Hassan",
          "title": "Presiding Judge",
          "specialization": ["Criminal Law", "Commercial Law"],
          "contactInfo": {
            "phone": "+25212345692",
            "email": "judge.omar@bosaso-district.so"
          },
          "isActive": true
        },
        {
          "name": "Judge Khadija Ali",
          "title": "Associate Judge",
          "specialization": ["Family Law", "Property Law"],
          "contactInfo": {
            "phone": "+25212345693",
            "email": "judge.khadija@bosaso-district.so"
          },
          "isActive": true
        }
      ],
      "clerks": [
        {
          "name": "Clerk Mohamed Abdi",
          "title": "Senior Clerk",
          "contactInfo": {
            "phone": "+25212345694",
            "email": "clerk.mohamed@bosaso-district.so"
          },
          "isActive": true
        },
        {
          "name": "Clerk Aisha Mohamed",
          "title": "Court Clerk",
          "contactInfo": {
            "phone": "+25212345695",
            "email": "clerk.aisha@bosaso-district.so"
          },
          "isActive": true
        }
      ],
      "prosecutors": [
        {
          "name": "Prosecutor Ali Mohamed",
          "title": "Senior Prosecutor",
          "specialization": ["Criminal Law"],
          "contactInfo": {
            "phone": "+25212345696",
            "email": "prosecutor.ali@bosaso-district.so"
          },
          "isActive": true
        }
      ]
    },
    "operations": {
      "businessHours": {
        "monday": { "open": "08:00", "close": "17:00" },
        "tuesday": { "open": "08:00", "close": "17:00" },
        "wednesday": { "open": "08:00", "close": "17:00" },
        "thursday": { "open": "08:00", "close": "17:00" },
        "friday": { "open": "08:00", "close": "17:00" },
        "saturday": { "open": "08:00", "close": "17:00" },
        "sunday": { "open": "08:00", "close": "17:00" }
      },
      "holidays": ["2025-12-25", "2025-07-04"],
      "capacity": {
        "courtrooms": 4,
        "seatingCapacity": 200
      },
      "facilities": [
        {
          "name": "Courtroom 1",
          "type": "courtroom",
          "capacity": 50,
          "equipment": ["Microphone", "Air Conditioning"]
        },
        {
          "name": "Courtroom 2",
          "type": "courtroom",
          "capacity": 50,
          "equipment": ["Microphone", "Air Conditioning"]
        },
        {
          "name": "Holding Cell",
          "type": "holding_cell",
          "capacity": 20,
          "equipment": ["Security Cameras", "Intercom"]
        }
      ]
    },
    "caseManagement": {
      "caseTypes": ["Criminal", "Civil", "Commercial", "Family"],
      "maxCaseLoad": 800,
      "currentCaseLoad": 300,
      "averageProcessingTime": 30,
      "backlogThreshold": 150
    },
    "budget": {
      "annual": 600000,
      "currency": "USD",
      "allocated": 250000,
      "spent": 180000,
      "remaining": 70000
    },
    "metrics": {
      "casesProcessed": 500,
      "averageResolutionTime": 25,
      "successRate": 88,
      "satisfactionRating": 4.3,
      "lastUpdated": "2025-10-28T00:00:00Z"
    },
    "isActive": true,
    "establishedDate": "2001-01-01T00:00:00Z",
    "lastInspectionDate": "2024-10-15T00:00:00Z",
    "nextInspectionDate": "2025-10-15T00:00:00Z",
    "tags": ["criminal", "civil", "commercial", "district"],
    "notes": "Busy district court handling high case volume"
  },

  {
    "name": "District Court of Garowe",
    "code": "GAROWE-DC-001",
    "type": "district_court",
    "jurisdiction": "state",
    "level": "trial",
    "description": "Primary trial court in Garowe, handling civil and criminal cases",
    "address": {
      "street": "Justice Ave.",
      "city": "Garowe",
      "state": "Nugaal",
      "country": "Somalia",
      "postalCode": "67892",
      "coordinates": {
        "latitude": 8.4100,
        "longitude": 48.4900
      }
    },
    "contactInfo": {
      "phone": "+25298765450",
      "email": "info@garowe-district.so",
      "fax": "+25298765451",
      "website": "https://garowe-district.so"
    },
    "personnel": {
      "judges": [
        {
          "name": "Judge Ibrahim Hassan",
          "title": "Presiding Judge",
          "specialization": ["Criminal Law", "Family Law"],
          "contactInfo": {
            "phone": "+25298765452",
            "email": "judge.ibrahim@garowe-district.so"
          },
          "isActive": true
        },
        {
          "name": "Judge Maryam Ali",
          "title": "Associate Judge",
          "specialization": ["Property Law", "Commercial Law"],
          "contactInfo": {
            "phone": "+25298765453",
            "email": "judge.maryam@garowe-district.so"
          },
          "isActive": true
        }
      ],
      "clerks": [
        {
          "name": "Clerk Hassan Mohamed",
          "title": "Senior Clerk",
          "contactInfo": {
            "phone": "+25298765454",
            "email": "clerk.hassan@garowe-district.so"
          },
          "isActive": true
        }
      ],
      "prosecutors": [
        {
          "name": "Prosecutor Mohamed Ali",
          "title": "Senior Prosecutor",
          "specialization": ["Criminal Law", "Terrorism"],
          "contactInfo": {
            "phone": "+25298765455",
            "email": "prosecutor.mohamed@garowe-district.so"
          },
          "isActive": true
        }
      ]
    },
    "operations": {
      "businessHours": {
        "monday": { "open": "08:00", "close": "17:00" },
        "tuesday": { "open": "08:00", "close": "17:00" },
        "wednesday": { "open": "08:00", "close": "17:00" },
        "thursday": { "open": "08:00", "close": "17:00" },
        "friday": { "open": "08:00", "close": "17:00" },
        "saturday": { "open": "08:00", "close": "17:00" },
        "sunday": { "open": "08:00", "close": "17:00" }
      },
      "holidays": ["2025-12-25", "2025-07-04"],
      "capacity": {
        "courtrooms": 3,
        "seatingCapacity": 150
      },
      "facilities": [
        {
          "name": "Courtroom 1",
          "type": "courtroom",
          "capacity": 50,
          "equipment": ["Microphone", "Air Conditioning"]
        },
        {
          "name": "Courtroom 2",
          "type": "courtroom",
          "capacity": 50,
          "equipment": ["Microphone", "Air Conditioning"]
        },
        {
          "name": "Conference Room",
          "type": "conference_room",
          "capacity": 20,
          "equipment": ["Whiteboard", "Projector"]
        }
      ]
    },
    "caseManagement": {
      "caseTypes": ["Criminal", "Civil", "Family", "Commercial"],
      "maxCaseLoad": 600,
      "currentCaseLoad": 200,
      "averageProcessingTime": 35,
      "backlogThreshold": 120
    },
    "budget": {
      "annual": 500000,
      "currency": "USD",
      "allocated": 200000,
      "spent": 150000,
      "remaining": 50000
    },
    "metrics": {
      "casesProcessed": 400,
      "averageResolutionTime": 30,
      "successRate": 92,
      "satisfactionRating": 4.6,
      "lastUpdated": "2025-10-28T00:00:00Z"
    },
    "isActive": true,
    "establishedDate": "2002-01-01T00:00:00Z",
    "lastInspectionDate": "2024-10-15T00:00:00Z",
    "nextInspectionDate": "2025-10-15T00:00:00Z",
    "tags": ["criminal", "civil", "family", "district"],
    "notes": "Well-functioning district court with good case management"
  },

  {
    "name": "Regional Court of Sanaag",
    "code": "SANAAG-RC-001",
    "type": "regional_court",
    "jurisdiction": "regional",
    "level": "trial",
    "description": "Regional court covering Sanaag region, handling regional disputes",
    "address": {
      "street": "Regional Court St.",
      "city": "Ceerigaabo",
      "state": "Sanaag",
      "country": "Somalia",
      "postalCode": "23456",
      "coordinates": {
        "latitude": 10.6167,
        "longitude": 47.3667
      }
    },
    "contactInfo": {
      "phone": "+25223456789",
      "email": "info@sanaag-regional.so",
      "fax": "+25223456790",
      "website": "https://sanaag-regional.so"
    },
    "personnel": {
      "judges": [
        {
          "name": "Judge Abdi Mohamed",
          "title": "Regional Judge",
          "specialization": ["Property Law", "Commercial Law"],
          "contactInfo": {
            "phone": "+25223456791",
            "email": "judge.abdi@sanaag-regional.so"
          },
          "isActive": true
        }
      ],
      "clerks": [
        {
          "name": "Clerk Halima Ali",
          "title": "Regional Clerk",
          "contactInfo": {
            "phone": "+25223456792",
            "email": "clerk.halima@sanaag-regional.so"
          },
          "isActive": true
        }
      ],
      "prosecutors": [
        {
          "name": "Prosecutor Omar Hassan",
          "title": "Regional Prosecutor",
          "specialization": ["Criminal Law"],
          "contactInfo": {
            "phone": "+25223456793",
            "email": "prosecutor.omar@sanaag-regional.so"
          },
          "isActive": true
        }
      ]
    },
    "operations": {
      "businessHours": {
        "monday": { "open": "08:00", "close": "17:00" },
        "tuesday": { "open": "08:00", "close": "17:00" },
        "wednesday": { "open": "08:00", "close": "17:00" },
        "thursday": { "open": "08:00", "close": "17:00" },
        "friday": { "open": "08:00", "close": "17:00" },
        "saturday": { "open": "08:00", "close": "17:00" },
        "sunday": { "open": "08:00", "close": "17:00" }
      },
      "holidays": ["2025-12-25", "2025-07-04"],
      "capacity": {
        "courtrooms": 2,
        "seatingCapacity": 100
      },
      "facilities": [
        {
          "name": "Regional Courtroom",
          "type": "courtroom",
          "capacity": 50,
          "equipment": ["Microphone", "Air Conditioning"]
        },
        {
          "name": "Office Space",
          "type": "office",
          "capacity": 10,
          "equipment": ["Computer", "Printer"]
        }
      ]
    },
    "caseManagement": {
      "caseTypes": ["Criminal", "Civil", "Property"],
      "maxCaseLoad": 300,
      "currentCaseLoad": 80,
      "averageProcessingTime": 40,
      "backlogThreshold": 60
    },
    "budget": {
      "annual": 300000,
      "currency": "USD",
      "allocated": 120000,
      "spent": 80000,
      "remaining": 40000
    },
    "metrics": {
      "casesProcessed": 200,
      "averageResolutionTime": 35,
      "successRate": 85,
      "satisfactionRating": 4.2,
      "lastUpdated": "2025-10-28T00:00:00Z"
    },
    "isActive": true,
    "establishedDate": "2003-01-01T00:00:00Z",
    "lastInspectionDate": "2024-10-15T00:00:00Z",
    "nextInspectionDate": "2025-10-15T00:00:00Z",
    "tags": ["criminal", "civil", "property", "regional"],
    "notes": "Regional court serving Sanaag region"
  },

  {
    "name": "Municipal Court of Qardho",
    "code": "QARDHO-MC-001",
    "type": "municipal_court",
    "jurisdiction": "municipal",
    "level": "trial",
    "description": "Municipal court handling local disputes and minor offenses",
    "address": {
      "street": "Municipal Court St.",
      "city": "Qardho",
      "state": "Bari",
      "country": "Somalia",
      "postalCode": "12347",
      "coordinates": {
        "latitude": 9.5000,
        "longitude": 49.0833
      }
    },
    "contactInfo": {
      "phone": "+25212345700",
      "email": "info@qardho-municipal.so",
      "fax": "+25212345701",
      "website": "https://qardho-municipal.so"
    },
    "personnel": {
      "judges": [
        {
          "name": "Judge Mohamed Ali",
          "title": "Municipal Judge",
          "specialization": ["Municipal Law", "Traffic Law"],
          "contactInfo": {
            "phone": "+25212345702",
            "email": "judge.mohamed@qardho-municipal.so"
          },
          "isActive": true
        }
      ],
      "clerks": [
        {
          "name": "Clerk Aisha Hassan",
          "title": "Municipal Clerk",
          "contactInfo": {
            "phone": "+25212345703",
            "email": "clerk.aisha@qardho-municipal.so"
          },
          "isActive": true
        }
      ],
      "prosecutors": [
        {
          "name": "Prosecutor Hassan Ali",
          "title": "Municipal Prosecutor",
          "specialization": ["Municipal Law"],
          "contactInfo": {
            "phone": "+25212345704",
            "email": "prosecutor.hassan@qardho-municipal.so"
          },
          "isActive": true
        }
      ]
    },
    "operations": {
      "businessHours": {
        "monday": { "open": "08:00", "close": "17:00" },
        "tuesday": { "open": "08:00", "close": "17:00" },
        "wednesday": { "open": "08:00", "close": "17:00" },
        "thursday": { "open": "08:00", "close": "17:00" },
        "friday": { "open": "08:00", "close": "17:00" },
        "saturday": { "open": "08:00", "close": "17:00" },
        "sunday": { "open": "08:00", "close": "17:00" }
      },
      "holidays": ["2025-12-25", "2025-07-04"],
      "capacity": {
        "courtrooms": 1,
        "seatingCapacity": 50
      },
      "facilities": [
        {
          "name": "Municipal Courtroom",
          "type": "courtroom",
          "capacity": 50,
          "equipment": ["Microphone"]
        }
      ]
    },
    "caseManagement": {
      "caseTypes": ["Municipal", "Traffic", "Minor Criminal"],
      "maxCaseLoad": 200,
      "currentCaseLoad": 50,
      "averageProcessingTime": 15,
      "backlogThreshold": 40
    },
    "budget": {
      "annual": 150000,
      "currency": "USD",
      "allocated": 60000,
      "spent": 40000,
      "remaining": 20000
    },
    "metrics": {
      "casesProcessed": 150,
      "averageResolutionTime": 12,
      "successRate": 90,
      "satisfactionRating": 4.0,
      "lastUpdated": "2025-10-28T00:00:00Z"
    },
    "isActive": true,
    "establishedDate": "2004-01-01T00:00:00Z",
    "lastInspectionDate": "2024-10-15T00:00:00Z",
    "nextInspectionDate": "2025-10-15T00:00:00Z",
    "tags": ["municipal", "traffic", "minor", "local"],
    "notes": "Municipal court handling local disputes"
  },

  {
    "name": "Specialized Commercial Court",
    "code": "PUNTLAND-CC-001",
    "type": "specialized_court",
    "jurisdiction": "specialized",
    "level": "trial",
    "description": "Specialized court handling commercial disputes and business law cases",
    "address": {
      "street": "Commercial Court Building",
      "city": "Garowe",
      "state": "Nugaal",
      "country": "Somalia",
      "postalCode": "67893",
      "coordinates": {
        "latitude": 8.4150,
        "longitude": 48.4950
      }
    },
    "contactInfo": {
      "phone": "+25298765460",
      "email": "info@puntland-commercial.so",
      "fax": "+25298765461",
      "website": "https://puntland-commercial.so"
    },
    "personnel": {
      "judges": [
        {
          "name": "Judge Ahmed Hassan",
          "title": "Commercial Judge",
          "specialization": ["Commercial Law", "Contract Law", "Banking Law"],
          "contactInfo": {
            "phone": "+25298765462",
            "email": "judge.ahmed@puntland-commercial.so"
          },
          "isActive": true
        }
      ],
      "clerks": [
        {
          "name": "Clerk Mohamed Ali",
          "title": "Commercial Clerk",
          "contactInfo": {
            "phone": "+25298765463",
            "email": "clerk.mohamed@puntland-commercial.so"
          },
          "isActive": true
        }
      ],
      "prosecutors": [
        {
          "name": "Prosecutor Fatima Hassan",
          "title": "Commercial Prosecutor",
          "specialization": ["Commercial Law", "Fraud"],
          "contactInfo": {
            "phone": "+25298765464",
            "email": "prosecutor.fatima@puntland-commercial.so"
          },
          "isActive": true
        }
      ]
    },
    "operations": {
      "businessHours": {
        "monday": { "open": "08:00", "close": "17:00" },
        "tuesday": { "open": "08:00", "close": "17:00" },
        "wednesday": { "open": "08:00", "close": "17:00" },
        "thursday": { "open": "08:00", "close": "17:00" },
        "friday": { "open": "08:00", "close": "17:00" },
        "saturday": { "open": "08:00", "close": "17:00" },
        "sunday": { "open": "08:00", "close": "17:00" }
      },
      "holidays": ["2025-12-25", "2025-07-04"],
      "capacity": {
        "courtrooms": 2,
        "seatingCapacity": 80
      },
      "facilities": [
        {
          "name": "Commercial Courtroom",
          "type": "courtroom",
          "capacity": 40,
          "equipment": ["Projector", "Microphone", "Air Conditioning", "Computer"]
        },
        {
          "name": "Business Library",
          "type": "office",
          "capacity": 15,
          "equipment": ["Computer", "Printer", "Legal Database"]
        }
      ]
    },
    "caseManagement": {
      "caseTypes": ["Commercial", "Contract", "Banking", "Insurance"],
      "maxCaseLoad": 400,
      "currentCaseLoad": 120,
      "averageProcessingTime": 45,
      "backlogThreshold": 80
    },
    "budget": {
      "annual": 400000,
      "currency": "USD",
      "allocated": 180000,
      "spent": 120000,
      "remaining": 60000
    },
    "metrics": {
      "casesProcessed": 300,
      "averageResolutionTime": 40,
      "successRate": 88,
      "satisfactionRating": 4.4,
      "lastUpdated": "2025-10-28T00:00:00Z"
    },
    "isActive": true,
    "establishedDate": "2006-01-01T00:00:00Z",
    "lastInspectionDate": "2024-10-15T00:00:00Z",
    "nextInspectionDate": "2025-10-15T00:00:00Z",
    "tags": ["commercial", "contract", "banking", "specialized"],
    "notes": "Specialized court for commercial disputes"
  }
];

async function createCourts() {
  try {
    console.log('🏛️  Starting Puntland Courts Database Population...');
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

    // Clear existing courts
    await Court.deleteMany({});
    console.log('🗑️  Cleared existing courts from database');

    // Add system information to each court
    const courtsWithSystemInfo = puntlandCourts.map(court => ({
      ...court,
      organisationId: organisation._id,
      createdBy: user._id,
      lastModifiedBy: user._id,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    }));

    // Insert courts
    const createdCourts = await Court.insertMany(courtsWithSystemInfo);
    
    console.log('✅ Successfully created courts:');
    console.log('-'.repeat(40));
    
    createdCourts.forEach((court, index) => {
      console.log(`${index + 1}. ${court.name} (${court.code})`);
      console.log(`   Type: ${court.type} | Jurisdiction: ${court.jurisdiction} | Level: ${court.level}`);
      console.log(`   Location: ${court.address.city}, ${court.address.state}`);
      console.log(`   Cases: ${court.caseManagement.currentCaseLoad}/${court.caseManagement.maxCaseLoad}`);
      console.log('');
    });

    // Display summary statistics
    const totalCourts = createdCourts.length;
    const totalCapacity = createdCourts.reduce((sum, court) => sum + court.caseManagement.maxCaseLoad, 0);
    const totalCurrentLoad = createdCourts.reduce((sum, court) => sum + court.caseManagement.currentCaseLoad, 0);
    const totalBudget = createdCourts.reduce((sum, court) => sum + court.budget.annual, 0);

    console.log('📊 SUMMARY STATISTICS:');
    console.log('='.repeat(60));
    console.log(`Total Courts Created: ${totalCourts}`);
    console.log(`Total Case Capacity: ${totalCapacity}`);
    console.log(`Current Case Load: ${totalCurrentLoad}`);
    console.log(`Total Annual Budget: $${totalBudget.toLocaleString()} USD`);
    console.log('');

    // Group by type
    const courtsByType = createdCourts.reduce((acc, court) => {
      acc[court.type] = (acc[court.type] || 0) + 1;
      return acc;
    }, {});

    console.log('🏛️  COURTS BY TYPE:');
    console.log('-'.repeat(40));
    Object.entries(courtsByType).forEach(([type, count]) => {
      const typeName = type.replace('_', ' ').toUpperCase();
      console.log(`${typeName.padEnd(20)}: ${count} courts`);
    });
    console.log('');

    // Group by jurisdiction
    const courtsByJurisdiction = createdCourts.reduce((acc, court) => {
      acc[court.jurisdiction] = (acc[court.jurisdiction] || 0) + 1;
      return acc;
    }, {});

    console.log('🌍 COURTS BY JURISDICTION:');
    console.log('-'.repeat(40));
    Object.entries(courtsByJurisdiction).forEach(([jurisdiction, count]) => {
      const jurisdictionName = jurisdiction.toUpperCase();
      console.log(`${jurisdictionName.padEnd(20)}: ${count} courts`);
    });
    console.log('');

    console.log('🎉 PUNTLAND COURTS DATABASE POPULATION COMPLETE!');
    console.log('='.repeat(60));
    console.log('All major courts in Puntland State have been successfully added to the database.');
    console.log('The courts include:');
    console.log('• Supreme Court of Puntland (Garowe)');
    console.log('• Court of Appeal of Bari (Bosaso)');
    console.log('• Court of Appeal of Nugaal (Garowe)');
    console.log('• District Court of Bosaso');
    console.log('• District Court of Garowe');
    console.log('• Regional Court of Sanaag (Ceerigaabo)');
    console.log('• Municipal Court of Qardho');
    console.log('• Specialized Commercial Court (Garowe)');

  } catch (error) {
    console.error('❌ Error creating courts:', error);
  } finally {
    mongoose.connection.close();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
createCourts();
