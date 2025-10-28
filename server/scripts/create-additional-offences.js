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

// Additional comprehensive offences to reach 200+ total
const additionalOffences = [
  // More Violent Crimes
  {
    name: "Attempted Murder",
    code: "ATM-001",
    description: "Attempting to kill another person",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Attempting to kill another person with malice aforethought.",
    penalties: {
      minimumSentence: "5 years",
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
    name: "Aggravated Assault",
    code: "AGA-001",
    description: "Serious assault with weapon or causing serious injury",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Assault committed with a deadly weapon or causing serious bodily injury.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Assault with Deadly Weapon",
    code: "ADW-001",
    description: "Assault committed with a deadly weapon",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Assault committed with a deadly weapon.",
    penalties: {
      minimumSentence: "3 years",
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
    name: "Home Invasion",
    code: "HOM-001",
    description: "Breaking into occupied dwelling",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Breaking into an occupied dwelling with intent to commit a crime.",
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
    name: "Criminal Threats",
    code: "CRI-001",
    description: "Making threats to cause harm",
    category: "violent_crime",
    severity: "serious",
    legalDefinition: "Making threats to cause physical harm to another person.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 500, maximum: 5000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Terroristic Threats",
    code: "TER-004",
    description: "Threats to commit acts of terrorism",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Threats to commit acts of terrorism or violence.",
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

  // More Property Crimes
  {
    name: "Grand Theft Auto",
    code: "GTA-001",
    description: "Stealing a motor vehicle",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "Stealing a motor vehicle valued over $500.",
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
    name: "Petty Theft",
    code: "PET-001",
    description: "Stealing property valued under $500",
    category: "property_crime",
    severity: "minor",
    legalDefinition: "Stealing property valued under $500.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "6 months",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Receiving Stolen Goods",
    code: "RSG-001",
    description: "Receiving goods known to be stolen",
    category: "property_crime",
    severity: "serious",
    legalDefinition: "Receiving goods known to be stolen.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 500, maximum: 5000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Larceny",
    code: "LAR-001",
    description: "Theft of personal property",
    category: "property_crime",
    severity: "moderate",
    legalDefinition: "The unlawful taking of personal property.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "2 years",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Burglary (Residential)",
    code: "BUR-003",
    description: "Breaking into residential property",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "Breaking into residential property with intent to commit theft.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Burglary (Commercial)",
    code: "BUR-004",
    description: "Breaking into commercial property",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "Breaking into commercial property with intent to commit theft.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1500, maximum: 15000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Arson (Residential)",
    code: "ARS-002",
    description: "Setting fire to residential property",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "Setting fire to residential property.",
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
    name: "Arson (Commercial)",
    code: "ARS-003",
    description: "Setting fire to commercial property",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "Setting fire to commercial property.",
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

  // More Drug Offences
  {
    name: "Drug Possession (Crack Cocaine)",
    code: "DRU-009",
    description: "Possession of crack cocaine",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of crack cocaine.",
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
    name: "Drug Possession (Ecstasy)",
    code: "DRU-010",
    description: "Possession of ecstasy/MDMA",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of ecstasy or MDMA.",
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
    name: "Drug Possession (LSD)",
    code: "DRU-011",
    description: "Possession of LSD",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of LSD.",
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
    name: "Drug Possession (PCP)",
    code: "DRU-012",
    description: "Possession of PCP",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Possession of PCP.",
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
    name: "Drug Possession (Prescription Drugs)",
    code: "DRU-013",
    description: "Possession of prescription drugs without prescription",
    category: "drug_offence",
    severity: "serious",
    legalDefinition: "Possession of prescription drugs without a valid prescription.",
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
    name: "Drug Manufacturing (Meth Lab)",
    code: "DRU-014",
    description: "Operating a methamphetamine laboratory",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "Operating a methamphetamine manufacturing laboratory.",
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
    name: "Drug Trafficking (International)",
    code: "DRU-015",
    description: "International drug trafficking",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "International drug trafficking across borders.",
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

  // More White Collar Crimes
  {
    name: "Wire Fraud",
    code: "WIR-001",
    description: "Fraud committed using electronic communications",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Fraud committed using electronic communications or wire transfers.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 5000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Mail Fraud",
    code: "MAI-001",
    description: "Fraud committed using postal service",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Fraud committed using the postal service.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 5000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Healthcare Fraud",
    code: "HEA-001",
    description: "Fraudulent healthcare billing",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Fraudulent healthcare billing or medical fraud.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 10000, maximum: 500000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Mortgage Fraud",
    code: "MOR-001",
    description: "Fraudulent mortgage applications",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Fraudulent mortgage applications or real estate fraud.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 5000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Credit Card Skimming",
    code: "CRE-002",
    description: "Stealing credit card information using skimming devices",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Stealing credit card information using skimming devices.",
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
    name: "Pyramid Scheme",
    code: "PYR-001",
    description: "Fraudulent investment scheme",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Fraudulent investment scheme where returns are paid from new investors.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 5000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },

  // More Cyber Crimes
  {
    name: "Malware Distribution",
    code: "MAL-001",
    description: "Distributing malicious software",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Distributing malicious software or malware.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "DDoS Attack",
    code: "DDO-001",
    description: "Distributed denial of service attacks",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Distributed denial of service attacks on computer systems.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Cryptocurrency Mining Malware",
    code: "CRY-002",
    description: "Using malware to mine cryptocurrency",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Using malware to mine cryptocurrency on victims' computers.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 5000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Dark Web Activities",
    code: "DAR-001",
    description: "Illegal activities on the dark web",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Illegal activities conducted on the dark web.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 5000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "SIM Swapping",
    code: "SIM-001",
    description: "Stealing phone numbers to access accounts",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Stealing phone numbers to gain access to victims' accounts.",
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

  // More Traffic Violations
  {
    name: "Driving While Suspended",
    code: "DWS-002",
    description: "Operating vehicle with suspended license",
    category: "traffic_violation",
    severity: "moderate",
    legalDefinition: "Operating a motor vehicle with a suspended license.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Driving Without Insurance",
    code: "DWI-001",
    description: "Operating vehicle without insurance",
    category: "traffic_violation",
    severity: "minor",
    legalDefinition: "Operating a motor vehicle without valid insurance.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "30 days",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Fleeing from Police",
    code: "FLE-001",
    description: "Attempting to evade law enforcement",
    category: "traffic_violation",
    severity: "felony",
    legalDefinition: "Attempting to evade law enforcement in a motor vehicle.",
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
    name: "Driving with Expired Registration",
    code: "DER-001",
    description: "Operating vehicle with expired registration",
    category: "traffic_violation",
    severity: "minor",
    legalDefinition: "Operating a motor vehicle with expired registration.",
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

  // More Public Order Offences
  {
    name: "Unlawful Assembly",
    code: "UNA-001",
    description: "Participating in unlawful gatherings",
    category: "public_order",
    severity: "moderate",
    legalDefinition: "Participating in unlawful assemblies or gatherings.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Failure to Disperse",
    code: "FAD-001",
    description: "Refusing to leave when ordered by police",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Refusing to disperse when ordered by law enforcement.",
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
    name: "Interfering with Police",
    code: "INT-001",
    description: "Interfering with law enforcement duties",
    category: "public_order",
    severity: "moderate",
    legalDefinition: "Interfering with law enforcement officers in the performance of their duties.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "False Report to Police",
    code: "FAR-001",
    description: "Making false reports to law enforcement",
    category: "public_order",
    severity: "moderate",
    legalDefinition: "Making false reports to law enforcement officers.",
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

  // More Sexual Offences
  {
    name: "Sexual Battery",
    code: "SEB-001",
    description: "Non-consensual sexual touching",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Non-consensual sexual touching or contact.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Sexual Exploitation",
    code: "SEX-002",
    description: "Exploiting others for sexual purposes",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Exploiting others for sexual purposes or gratification.",
    penalties: {
      minimumSentence: "3 years",
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
    name: "Sexual Coercion",
    code: "SEC-003",
    description: "Coercing others into sexual acts",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Coercing others into sexual acts through threats or manipulation.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Sexual Grooming",
    code: "SEG-001",
    description: "Grooming minors for sexual purposes",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Grooming minors for sexual purposes or exploitation.",
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
    name: "Terrorist Conspiracy",
    code: "TER-005",
    description: "Conspiring to commit terrorist acts",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Conspiring to commit terrorist acts or violence.",
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
  {
    name: "Terrorist Training",
    code: "TER-006",
    description: "Providing training for terrorist activities",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Providing training for terrorist activities or violence.",
    penalties: {
      minimumSentence: "20 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 50000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Weapons of Mass Destruction",
    code: "WMD-001",
    description: "Possession or use of WMDs",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Possession or use of weapons of mass destruction.",
    penalties: {
      minimumSentence: "Life imprisonment",
      maximumSentence: "Death penalty",
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
    name: "Witness Intimidation",
    code: "WIN-001",
    description: "Intimidating witnesses in legal proceedings",
    category: "other",
    severity: "felony",
    legalDefinition: "Intimidating witnesses in legal proceedings.",
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
    name: "Jury Tampering",
    code: "JUR-001",
    description: "Attempting to influence jurors",
    category: "other",
    severity: "felony",
    legalDefinition: "Attempting to influence jurors in legal proceedings.",
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
    name: "Escape from Prison",
    code: "ESC-002",
    description: "Escaping from prison or detention",
    category: "other",
    severity: "felony",
    legalDefinition: "Escaping from prison or detention facilities.",
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
    name: "Contraband in Prison",
    code: "CON-002",
    description: "Bringing contraband into prison",
    category: "other",
    severity: "serious",
    legalDefinition: "Bringing contraband into prison or detention facilities.",
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
  {
    name: "Violation of Restraining Order",
    code: "VRO-001",
    description: "Violating court-issued restraining orders",
    category: "other",
    severity: "serious",
    legalDefinition: "Violating court-issued restraining orders or protective orders.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Animal Cruelty",
    code: "ANI-001",
    description: "Cruelty to animals",
    category: "other",
    severity: "moderate",
    legalDefinition: "Cruelty to animals or animal abuse.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "2 years",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Environmental Crimes",
    code: "ENV-001",
    description: "Violating environmental protection laws",
    category: "other",
    severity: "serious",
    legalDefinition: "Violating environmental protection laws or regulations.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Copyright Infringement",
    code: "COP-001",
    description: "Violating copyright laws",
    category: "other",
    severity: "moderate",
    legalDefinition: "Violating copyright laws or intellectual property rights.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "2 years",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Trademark Counterfeiting",
    code: "TRA-002",
    description: "Counterfeiting trademarked goods",
    category: "other",
    severity: "serious",
    legalDefinition: "Counterfeiting trademarked goods or products.",
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

async function createAdditionalOffences() {
  try {
    console.log('Starting to create additional offences...');
    
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
    
    console.log('\nTotal offences by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`${category}: ${count} offences`);
    });
    
  } catch (error) {
    console.error('Error creating additional offences:', error);
  } finally {
    mongoose.connection.close();
  }
}

createAdditionalOffences();
