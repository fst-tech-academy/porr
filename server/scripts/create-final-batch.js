const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/porr', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const Offence = require('../models/Offence');
const Organisation = require('../models/Organisation');
const User = require('../models/User');

// Additional offences to reach 200+ total
const additionalOffences = [
  // More Violent Crimes
  {
    name: "Assault with Vehicle",
    code: "AVH-001",
    description: "Using a vehicle as a weapon to assault someone",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Using a motor vehicle as a weapon to assault another person.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Assault with Firearm",
    code: "AFR-001",
    description: "Assault committed with a firearm",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Assault committed with a firearm or deadly weapon.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 5000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Assault with Knife",
    code: "AKN-001",
    description: "Assault committed with a knife",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Assault committed with a knife or cutting weapon.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Assault with Blunt Object",
    code: "ABO-001",
    description: "Assault committed with a blunt object",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Assault committed with a blunt object or club.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Assault with Hands/Fists",
    code: "AHF-001",
    description: "Assault committed with hands or fists",
    category: "violent_crime",
    severity: "serious",
    legalDefinition: "Assault committed with hands or fists causing injury.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },

  // More Property Crimes
  {
    name: "Theft of Motor Vehicle Parts",
    code: "TMP-001",
    description: "Stealing parts from motor vehicles",
    category: "property_crime",
    severity: "moderate",
    legalDefinition: "Stealing parts or accessories from motor vehicles.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Theft of Mail",
    code: "TML-001",
    description: "Stealing mail from mailboxes",
    category: "property_crime",
    severity: "moderate",
    legalDefinition: "Stealing mail from mailboxes or postal service.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Theft of Packages",
    code: "TPK-001",
    description: "Stealing packages from doorsteps",
    category: "property_crime",
    severity: "moderate",
    legalDefinition: "Stealing packages from doorsteps or delivery areas.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Theft of Bicycles",
    code: "TBC-001",
    description: "Stealing bicycles",
    category: "property_crime",
    severity: "minor",
    legalDefinition: "Stealing bicycles or bicycle parts.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "30 days",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Theft of Tools",
    code: "TTL-001",
    description: "Stealing tools or equipment",
    category: "property_crime",
    severity: "moderate",
    legalDefinition: "Stealing tools, equipment, or work materials.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },

  // More Drug Offences
  {
    name: "Drug Possession (Ketamine)",
    code: "DRU-021",
    description: "Possession of ketamine",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of ketamine or similar substances.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Drug Possession (GHB)",
    code: "DRU-022",
    description: "Possession of GHB",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of GHB or date rape drugs.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Drug Possession (Rohypnol)",
    code: "DRU-023",
    description: "Possession of Rohypnol",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of Rohypnol or similar date rape drugs.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Drug Possession (Steroids)",
    code: "DRU-024",
    description: "Possession of anabolic steroids",
    category: "drug_offence",
    severity: "serious",
    legalDefinition: "Possession of anabolic steroids without prescription.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Drug Possession (Inhalants)",
    code: "DRU-025",
    description: "Possession of inhalants for abuse",
    category: "drug_offence",
    severity: "moderate",
    legalDefinition: "Possession of inhalants for the purpose of abuse.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },

  // More White Collar Crimes
  {
    name: "Credit Card Fraud (Online)",
    code: "CRE-003",
    description: "Online credit card fraud",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Online credit card fraud or e-commerce fraud.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Credit Card Fraud (Physical)",
    code: "CRE-004",
    description: "Physical credit card fraud",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Physical credit card fraud using stolen cards.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Check Fraud",
    code: "CHK-001",
    description: "Fraudulent use of checks",
    category: "white_collar_crime",
    severity: "serious",
    legalDefinition: "Fraudulent use of checks or check kiting.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Wire Transfer Fraud",
    code: "WTF-001",
    description: "Fraudulent wire transfers",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Fraudulent wire transfers or money transfer fraud.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Gift Card Fraud",
    code: "GIF-001",
    description: "Fraudulent use of gift cards",
    category: "white_collar_crime",
    severity: "serious",
    legalDefinition: "Fraudulent use of gift cards or gift card scams.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },

  // More Cyber Crimes
  {
    name: "Social Engineering",
    code: "SOC-002",
    description: "Social engineering attacks",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Social engineering attacks to gain unauthorized access.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Credential Stuffing",
    code: "CRE-005",
    description: "Credential stuffing attacks",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Credential stuffing attacks using stolen login credentials.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Account Takeover",
    code: "ATO-001",
    description: "Unauthorized account takeover",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Unauthorized takeover of online accounts.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Business Email Compromise",
    code: "BEC-001",
    description: "Business email compromise attacks",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Business email compromise attacks for financial gain.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Romance Scam",
    code: "ROM-001",
    description: "Online romance scams",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Online romance scams for financial gain.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },

  // More Traffic Violations
  {
    name: "Driving Without Registration",
    code: "DWR-001",
    description: "Operating vehicle without registration",
    category: "traffic_violation",
    severity: "minor",
    legalDefinition: "Operating a motor vehicle without valid registration.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "Fine only",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Driving Without Inspection",
    code: "DWI-003",
    description: "Operating vehicle without inspection",
    category: "traffic_violation",
    severity: "minor",
    legalDefinition: "Operating a motor vehicle without valid inspection.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "Fine only",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Driving with Expired Tags",
    code: "DET-001",
    description: "Operating vehicle with expired tags",
    category: "traffic_violation",
    severity: "minor",
    legalDefinition: "Operating a motor vehicle with expired license tags.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "Fine only",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Driving with Broken Headlights",
    code: "DBH-001",
    description: "Operating vehicle with broken headlights",
    category: "traffic_violation",
    severity: "minor",
    legalDefinition: "Operating a motor vehicle with broken or non-functioning headlights.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "Fine only",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Driving with Broken Taillights",
    code: "DBT-001",
    description: "Operating vehicle with broken taillights",
    category: "traffic_violation",
    severity: "minor",
    legalDefinition: "Operating a motor vehicle with broken or non-functioning taillights.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "Fine only",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "medium"
    }
  },

  // More Public Order Offences
  {
    name: "Public Nuisance",
    code: "PUN-001",
    description: "Creating a public nuisance",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Creating a public nuisance or disturbance.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "30 days",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Public Indecency",
    code: "PIN-001",
    description: "Indecent behavior in public",
    category: "public_order",
    severity: "moderate",
    legalDefinition: "Indecent behavior or exposure in public places.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Public Urination",
    code: "PUR-001",
    description: "Urinating in public",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Urinating in public places.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "30 days",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Public Defecation",
    code: "PDE-001",
    description: "Defecating in public",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Defecating in public places.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "30 days",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Public Spitting",
    code: "PSP-001",
    description: "Spitting in public",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Spitting in public places.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "Fine only",
      fineRange: { minimum: 25, maximum: 250 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "low"
    }
  },

  // More Sexual Offences
  {
    name: "Sexual Assault (Stranger)",
    code: "SAS-001",
    description: "Sexual assault by stranger",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Sexual assault committed by a stranger.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Sexual Assault (Acquaintance)",
    code: "SAA-001",
    description: "Sexual assault by acquaintance",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Sexual assault committed by an acquaintance.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Sexual Assault (Date Rape)",
    code: "SAD-002",
    description: "Date rape sexual assault",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Sexual assault committed during a date or social encounter.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Sexual Assault (Marital)",
    code: "SAM-002",
    description: "Marital sexual assault",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Sexual assault committed within marriage.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Sexual Assault (Workplace)",
    code: "SAW-001",
    description: "Workplace sexual assault",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Sexual assault committed in the workplace.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },

  // More Terrorism Offences
  {
    name: "Terrorist Propaganda",
    code: "TER-012",
    description: "Creating or distributing terrorist propaganda",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Creating or distributing terrorist propaganda materials.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 10000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Terrorist Communication",
    code: "TER-013",
    description: "Communicating terrorist threats",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Communicating terrorist threats or plans.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 10000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Terrorist Planning",
    code: "TER-014",
    description: "Planning terrorist activities",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Planning terrorist activities or attacks.",
    penalties: {
      minimumSentence: "10 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 25000, maximum: 500000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Terrorist Surveillance",
    code: "TER-015",
    description: "Conducting surveillance for terrorist purposes",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Conducting surveillance for terrorist purposes.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 10000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Terrorist Weapons Training",
    code: "TER-016",
    description: "Providing weapons training for terrorism",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Providing weapons training for terrorist purposes.",
    penalties: {
      minimumSentence: "15 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 25000, maximum: 500000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },

  // More Other Offences
  {
    name: "Witness Intimidation (Aggravated)",
    code: "WIN-002",
    description: "Aggravated witness intimidation",
    category: "other",
    severity: "felony",
    legalDefinition: "Aggravated witness intimidation with threats or violence.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 5000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Jury Tampering (Aggravated)",
    code: "JUR-003",
    description: "Aggravated jury tampering",
    category: "other",
    severity: "felony",
    legalDefinition: "Aggravated jury tampering with threats or violence.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 5000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Escape from Prison (Aggravated)",
    code: "ESC-005",
    description: "Aggravated escape from prison",
    category: "other",
    severity: "felony",
    legalDefinition: "Aggravated escape from prison with violence or weapons.",
    penalties: {
      minimumSentence: "10 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 10000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Contraband in Prison (Drugs)",
    code: "CON-004",
    description: "Bringing drugs into prison",
    category: "other",
    severity: "felony",
    legalDefinition: "Bringing drugs into prison or detention facilities.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "10 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Violation of Restraining Order (Aggravated)",
    code: "VRO-003",
    description: "Aggravated violation of restraining order",
    category: "other",
    severity: "felony",
    legalDefinition: "Aggravated violation of restraining order with threats or violence.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "10 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Animal Cruelty (Aggravated)",
    code: "ANI-003",
    description: "Aggravated animal cruelty",
    category: "other",
    severity: "felony",
    legalDefinition: "Aggravated animal cruelty with torture or killing.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "10 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Environmental Crimes (Major)",
    code: "ENV-003",
    description: "Major environmental crimes",
    category: "other",
    severity: "felony",
    legalDefinition: "Major environmental crimes causing significant harm.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 10000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Copyright Infringement (Commercial)",
    code: "COP-003",
    description: "Commercial copyright infringement",
    category: "other",
    severity: "felony",
    legalDefinition: "Commercial copyright infringement for profit.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Trademark Counterfeiting (Commercial)",
    code: "TRA-004",
    description: "Commercial trademark counterfeiting",
    category: "other",
    severity: "felony",
    legalDefinition: "Commercial trademark counterfeiting for profit.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "10 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Patent Infringement (Willful)",
    code: "PAT-002",
    description: "Willful patent infringement",
    category: "other",
    severity: "felony",
    legalDefinition: "Willful patent infringement with knowledge of the patent.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  }
];

async function createFinalBatch() {
  try {
    console.log('Starting to create final batch of offences...');
    
    // Get the first organisation and user
    const organisation = await Organisation.findOne();
    const user = await User.findOne();
    
    if (!organisation) {
      console.error('No organisation found. Please create an organisation first.');
      return;
    }
    
    if (!user) {
      console.error('No user found. Please create a user first.');
      return;
    }
    
    console.log(`Using organisation: ${organisation.name} (${organisation._id})`);
    console.log(`Using user: ${user.firstName} ${user.lastName} (${user._id})`);
    
    // Create offences with organisation and user IDs
    const organisationId = organisation._id;
    const userId = user._id;
    
    const offencesWithMetadata = additionalOffences.map(offence => ({
      ...offence,
      organisationId,
      createdBy: userId,
      isActive: true,
      effectiveDate: new Date(),
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        version: 1
      }
    }));
    
    const createdOffences = await Offence.insertMany(offencesWithMetadata);
    console.log(`Successfully created ${createdOffences.length} additional offences`);
    
    // Get total count
    const totalCount = await Offence.countDocuments();
    console.log(`Total offences in database: ${totalCount}`);
    
    // Print summary by category
    const categoryCounts = {};
    const allOffences = await Offence.find({});
    allOffences.forEach(offence => {
      categoryCounts[offence.category] = (categoryCounts[offence.category] || 0) + 1;
    });
    
    console.log('\nFinal offences by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`${category}: ${count} offences`);
    });
    
    console.log(`\n🎉 SUCCESS! Created ${totalCount} comprehensive offences covering all possible crime categories!`);
    console.log('From shoplifting to terrorism - every possible offence is now in the database!');
    
  } catch (error) {
    console.error('Error creating final batch:', error);
  } finally {
    mongoose.connection.close();
  }
}

createFinalBatch();
