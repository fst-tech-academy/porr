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

// Final batch of offences to reach 200+ total
const finalOffences = [
  // More Violent Crimes
  {
    name: "Assault on Police Officer",
    code: "APO-001",
    description: "Assaulting a law enforcement officer",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Assaulting a law enforcement officer in the performance of their duties.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Assault on Firefighter",
    code: "AFI-001",
    description: "Assaulting a firefighter",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Assaulting a firefighter in the performance of their duties.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Assault on Healthcare Worker",
    code: "AHW-001",
    description: "Assaulting a healthcare worker",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Assaulting a healthcare worker in the performance of their duties.",
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
    name: "Gang Violence",
    code: "GAN-001",
    description: "Violence committed by gang members",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Violence committed by gang members or in furtherance of gang activities.",
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
    name: "Drive-by Shooting",
    code: "DBS-001",
    description: "Shooting from a moving vehicle",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Shooting from a moving vehicle at persons or property.",
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

  // More Property Crimes
  {
    name: "Theft of Services",
    code: "TOS-001",
    description: "Obtaining services without payment",
    category: "property_crime",
    severity: "moderate",
    legalDefinition: "Obtaining services without payment or authorization.",
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
    name: "Theft of Utilities",
    code: "TOU-001",
    description: "Stealing electricity, gas, or water",
    category: "property_crime",
    severity: "moderate",
    legalDefinition: "Stealing electricity, gas, water, or other utilities.",
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
    name: "Theft by Deception",
    code: "TBD-001",
    description: "Stealing through fraudulent means",
    category: "property_crime",
    severity: "serious",
    legalDefinition: "Stealing property through fraudulent means or deception.",
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
    name: "Theft of Trade Secrets",
    code: "TTS-001",
    description: "Stealing proprietary business information",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "Stealing proprietary business information or trade secrets.",
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
    name: "Theft of Intellectual Property",
    code: "TIP-001",
    description: "Stealing copyrighted or patented material",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "Stealing copyrighted or patented material or intellectual property.",
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

  // More Drug Offences
  {
    name: "Drug Possession (Fentanyl)",
    code: "DRU-016",
    description: "Possession of fentanyl",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of fentanyl or fentanyl analogs.",
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
    name: "Drug Possession (Synthetic Drugs)",
    code: "DRU-017",
    description: "Possession of synthetic drugs",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of synthetic drugs or designer drugs.",
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
    name: "Drug Possession (Prescription Opioids)",
    code: "DRU-018",
    description: "Possession of prescription opioids without prescription",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of prescription opioids without a valid prescription.",
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
    name: "Drug Distribution Near Schools",
    code: "DRU-019",
    description: "Distributing drugs near educational institutions",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Distributing drugs within 1000 feet of educational institutions.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "30 years",
      fineRange: { minimum: 5000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Drug Distribution Near Parks",
    code: "DRU-020",
    description: "Distributing drugs near public parks",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Distributing drugs within 1000 feet of public parks.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },

  // More White Collar Crimes
  {
    name: "Ponzi Scheme (Large Scale)",
    code: "PON-002",
    description: "Large-scale Ponzi scheme",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Large-scale Ponzi scheme involving millions of dollars.",
    penalties: {
      minimumSentence: "10 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 50000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Securities Fraud (Large Scale)",
    code: "SEC-002",
    description: "Large-scale securities fraud",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Large-scale securities fraud involving millions of dollars.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 25000, maximum: 500000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Bank Fraud (Large Scale)",
    code: "BAN-002",
    description: "Large-scale bank fraud",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Large-scale bank fraud involving millions of dollars.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 25000, maximum: 500000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Tax Evasion (Large Scale)",
    code: "TAX-002",
    description: "Large-scale tax evasion",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Large-scale tax evasion involving millions of dollars.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 10000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Money Laundering (Large Scale)",
    code: "MON-002",
    description: "Large-scale money laundering",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Large-scale money laundering involving millions of dollars.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 25000, maximum: 500000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },

  // More Cyber Crimes
  {
    name: "Cyber Espionage",
    code: "CYE-001",
    description: "Stealing sensitive information through cyber means",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Stealing sensitive information through cyber espionage.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 10000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Cyber Sabotage",
    code: "CYS-002",
    description: "Sabotaging computer systems",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Sabotaging computer systems or networks.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 5000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Cyber Extortion",
    code: "CYE-002",
    description: "Extorting money through cyber threats",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Extorting money through cyber threats or ransomware.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 5000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Cyber Stalking (Aggravated)",
    code: "CYS-003",
    description: "Aggravated cyber stalking",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Aggravated cyber stalking with threats of violence.",
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
    name: "Cyber Bullying (Criminal)",
    code: "CYB-001",
    description: "Criminal cyber bullying",
    category: "cyber_crime",
    severity: "serious",
    legalDefinition: "Criminal cyber bullying resulting in harm to victims.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },

  // More Traffic Violations
  {
    name: "Driving While Intoxicated (Felony)",
    code: "DWI-002",
    description: "Felony DUI with prior convictions",
    category: "traffic_violation",
    severity: "felony",
    legalDefinition: "Driving while intoxicated with prior DUI convictions.",
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
    name: "Vehicular Homicide",
    code: "VEH-002",
    description: "Causing death through reckless driving",
    category: "traffic_violation",
    severity: "felony",
    legalDefinition: "Causing death through reckless or negligent driving.",
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
    name: "Hit and Run (Injury)",
    code: "HAR-002",
    description: "Hit and run causing injury",
    category: "traffic_violation",
    severity: "felony",
    legalDefinition: "Hit and run causing injury to another person.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "10 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Hit and Run (Death)",
    code: "HAR-003",
    description: "Hit and run causing death",
    category: "traffic_violation",
    severity: "felony",
    legalDefinition: "Hit and run causing death to another person.",
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
    name: "Racing (Resulting in Injury)",
    code: "RAC-001",
    description: "Street racing resulting in injury",
    category: "traffic_violation",
    severity: "felony",
    legalDefinition: "Street racing resulting in injury to another person.",
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

  // More Public Order Offences
  {
    name: "Rioting (Aggravated)",
    code: "RIO-002",
    description: "Aggravated rioting with violence",
    category: "public_order",
    severity: "felony",
    legalDefinition: "Aggravated rioting with violence and destruction of property.",
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
    name: "Inciting Riot",
    code: "INC-002",
    description: "Inciting others to riot",
    category: "public_order",
    severity: "felony",
    legalDefinition: "Inciting others to riot or engage in violent behavior.",
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
    name: "Obstruction of Justice (Aggravated)",
    code: "OBS-002",
    description: "Aggravated obstruction of justice",
    category: "public_order",
    severity: "felony",
    legalDefinition: "Aggravated obstruction of justice with threats or violence.",
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
    name: "Resisting Arrest (Aggravated)",
    code: "RES-002",
    description: "Aggravated resisting arrest",
    category: "public_order",
    severity: "felony",
    legalDefinition: "Aggravated resisting arrest with violence or weapons.",
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
    name: "Escape from Custody (Aggravated)",
    code: "ESC-003",
    description: "Aggravated escape from custody",
    category: "public_order",
    severity: "felony",
    legalDefinition: "Aggravated escape from custody with violence or weapons.",
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

  // More Sexual Offences
  {
    name: "Sexual Assault (Aggravated)",
    code: "SEA-001",
    description: "Aggravated sexual assault",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Aggravated sexual assault with weapons or serious injury.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 5000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Sexual Assault (Multiple Victims)",
    code: "SAM-001",
    description: "Sexual assault of multiple victims",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Sexual assault of multiple victims or serial sexual assault.",
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
    name: "Sexual Assault (Child - Aggravated)",
    code: "SAC-001",
    description: "Aggravated sexual assault of child",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Aggravated sexual assault of a child with violence or weapons.",
    penalties: {
      minimumSentence: "25 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 25000, maximum: 250000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Sexual Assault (Elderly)",
    code: "SAE-001",
    description: "Sexual assault of elderly person",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Sexual assault of an elderly person.",
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
    name: "Sexual Assault (Disabled)",
    code: "SAD-001",
    description: "Sexual assault of disabled person",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Sexual assault of a disabled person.",
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

  // More Terrorism Offences
  {
    name: "Terrorist Financing (International)",
    code: "TER-007",
    description: "International terrorist financing",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "International terrorist financing across borders.",
    penalties: {
      minimumSentence: "20 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 100000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Terrorist Recruitment (International)",
    code: "TER-008",
    description: "International terrorist recruitment",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "International terrorist recruitment across borders.",
    penalties: {
      minimumSentence: "25 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 100000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Terrorist Training (International)",
    code: "TER-009",
    description: "International terrorist training",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "International terrorist training across borders.",
    penalties: {
      minimumSentence: "25 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 100000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Terrorist Conspiracy (International)",
    code: "TER-010",
    description: "International terrorist conspiracy",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "International terrorist conspiracy across borders.",
    penalties: {
      minimumSentence: "25 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 100000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Terrorist Material Support (International)",
    code: "TER-011",
    description: "International terrorist material support",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "International terrorist material support across borders.",
    penalties: {
      minimumSentence: "25 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 100000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },

  // More Other Offences
  {
    name: "Witness Tampering",
    code: "WIT-001",
    description: "Tampering with witnesses",
    category: "other",
    severity: "felony",
    legalDefinition: "Tampering with witnesses in legal proceedings.",
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
    name: "Jury Tampering (Aggravated)",
    code: "JUR-002",
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
    code: "ESC-004",
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
    name: "Contraband in Prison (Weapons)",
    code: "CON-003",
    description: "Bringing weapons into prison",
    category: "other",
    severity: "felony",
    legalDefinition: "Bringing weapons into prison or detention facilities.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 3000, maximum: 30000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Violation of Restraining Order (Aggravated)",
    code: "VRO-002",
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
    code: "ANI-002",
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
    code: "ENV-002",
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
    code: "COP-002",
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
    code: "TRA-003",
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
    code: "PAT-001",
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

async function createFinalOffences() {
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
    
    const offencesWithMetadata = finalOffences.map(offence => ({
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
    console.log(`Successfully created ${createdOffences.length} final offences`);
    
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
    
  } catch (error) {
    console.error('Error creating final offences:', error);
  } finally {
    mongoose.connection.close();
  }
}

createFinalOffences();
