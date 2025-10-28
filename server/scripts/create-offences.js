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

// Comprehensive list of offences covering all categories
const offences = [
  // VIOLENT CRIMES
  {
    name: "Murder (First Degree)",
    code: "MUR-001",
    description: "Premeditated killing of another person",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "The unlawful killing of a human being with malice aforethought, premeditation, and deliberation.",
    penalties: {
      minimumSentence: "Life imprisonment",
      maximumSentence: "Death penalty",
      fineRange: { minimum: 0, maximum: 0 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Murder (Second Degree)",
    code: "MUR-002",
    description: "Intentional killing without premeditation",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "The unlawful killing of a human being with malice aforethought but without premeditation.",
    penalties: {
      minimumSentence: "15 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 0, maximum: 0 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Manslaughter (Voluntary)",
    code: "MAN-001",
    description: "Killing in the heat of passion",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "The unlawful killing of a human being without malice aforethought, committed in the heat of passion.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Manslaughter (Involuntary)",
    code: "MAN-002",
    description: "Unintentional killing due to negligence",
    category: "violent_crime",
    severity: "major",
    legalDefinition: "The unlawful killing of a human being without malice aforethought, committed through criminal negligence.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 500, maximum: 5000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "low",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Assault (Aggravated)",
    code: "ASL-001",
    description: "Serious physical attack with weapon or intent to cause serious harm",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "An assault committed with a deadly weapon or with intent to commit a felony.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Assault (Simple)",
    code: "ASL-002",
    description: "Physical attack without serious injury",
    category: "violent_crime",
    severity: "moderate",
    legalDefinition: "An unlawful attempt to commit a violent injury upon another person.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Battery",
    code: "BAT-001",
    description: "Unlawful physical contact with another person",
    category: "violent_crime",
    severity: "moderate",
    legalDefinition: "The unlawful application of force to the person of another.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "6 months",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Robbery",
    code: "ROB-001",
    description: "Taking property from another person by force or threat",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "The taking of personal property from another person by force or intimidation.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Armed Robbery",
    code: "ROB-002",
    description: "Robbery committed with a weapon",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Robbery committed while armed with a deadly weapon.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Kidnapping",
    code: "KID-001",
    description: "Unlawful confinement of another person",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "The unlawful taking and carrying away of a person against their will.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Domestic Violence",
    code: "DOM-001",
    description: "Violence against family or household members",
    category: "violent_crime",
    severity: "serious",
    legalDefinition: "Physical violence or threats of violence against a family or household member.",
    penalties: {
      minimumSentence: "30 days",
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
    name: "Child Abuse",
    code: "CHI-001",
    description: "Physical or emotional harm to a child",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "Physical or emotional harm inflicted on a child by a parent or caregiver.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Elder Abuse",
    code: "ELD-001",
    description: "Physical or financial abuse of elderly persons",
    category: "violent_crime",
    severity: "serious",
    legalDefinition: "Physical, emotional, or financial abuse of elderly persons.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Hate Crime",
    code: "HAT-001",
    description: "Crime motivated by bias against protected groups",
    category: "violent_crime",
    severity: "felony",
    legalDefinition: "A crime committed because of the victim's race, religion, ethnicity, sexual orientation, or other protected characteristic.",
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

  // PROPERTY CRIMES
  {
    name: "Theft (Petty)",
    code: "THE-001",
    description: "Stealing property valued under $500",
    category: "property_crime",
    severity: "minor",
    legalDefinition: "The unlawful taking of personal property valued at less than $500.",
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
    name: "Theft (Grand)",
    code: "THE-002",
    description: "Stealing property valued over $500",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "The unlawful taking of personal property valued at $500 or more.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 500, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Shoplifting",
    code: "SHO-001",
    description: "Stealing merchandise from retail stores",
    category: "property_crime",
    severity: "minor",
    legalDefinition: "The theft of merchandise from a retail establishment.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Burglary",
    code: "BUR-001",
    description: "Unlawful entry into a building to commit theft",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "The unlawful entry into a building or structure with intent to commit theft or another felony.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Armed Burglary",
    code: "BUR-002",
    description: "Burglary committed while armed",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "Burglary committed while armed with a deadly weapon.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Auto Theft",
    code: "AUT-001",
    description: "Stealing a motor vehicle",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "The unlawful taking of a motor vehicle.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Carjacking",
    code: "CAR-001",
    description: "Taking a vehicle by force or threat",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "The taking of a motor vehicle from another person by force or intimidation.",
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
    name: "Arson",
    code: "ARS-001",
    description: "Intentionally setting fire to property",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "The malicious burning of another person's property.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Vandalism",
    code: "VAN-001",
    description: "Willful destruction of property",
    category: "property_crime",
    severity: "minor",
    legalDefinition: "The willful destruction or defacement of another person's property.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Fraud",
    code: "FRA-001",
    description: "Deception for financial gain",
    category: "property_crime",
    severity: "serious",
    legalDefinition: "Intentional deception for personal or financial gain.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Identity Theft",
    code: "IDE-001",
    description: "Using another person's identity for fraud",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "The fraudulent use of another person's personal information.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Credit Card Fraud",
    code: "CRE-001",
    description: "Fraudulent use of credit cards",
    category: "property_crime",
    severity: "serious",
    legalDefinition: "The fraudulent use of credit cards or credit card information.",
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
    name: "Embezzlement",
    code: "EMB-001",
    description: "Theft of funds by someone in a position of trust",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "The fraudulent taking of property by someone in a position of trust.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Forgery",
    code: "FOR-001",
    description: "Creating false documents or signatures",
    category: "property_crime",
    severity: "serious",
    legalDefinition: "The creation of false documents or signatures with intent to defraud.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 500, maximum: 5000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Counterfeiting",
    code: "COU-001",
    description: "Creating fake currency or goods",
    category: "property_crime",
    severity: "felony",
    legalDefinition: "The creation of fake currency or goods with intent to defraud.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },

  // DRUG OFFENCES
  {
    name: "Drug Possession (Marijuana)",
    code: "DRU-001",
    description: "Possession of marijuana",
    category: "drug_offence",
    severity: "minor",
    legalDefinition: "The unlawful possession of marijuana.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Drug Possession (Cocaine)",
    code: "DRU-002",
    description: "Possession of cocaine",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "The unlawful possession of cocaine.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Drug Possession (Heroin)",
    code: "DRU-003",
    description: "Possession of heroin",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "The unlawful possession of heroin.",
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
    name: "Drug Possession (Methamphetamine)",
    code: "DRU-004",
    description: "Possession of methamphetamine",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "The unlawful possession of methamphetamine.",
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
    name: "Drug Trafficking",
    code: "DRU-005",
    description: "Large-scale drug distribution",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "The unlawful distribution of controlled substances in large quantities.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 5000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Drug Manufacturing",
    code: "DRU-006",
    description: "Production of illegal drugs",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "The unlawful production or manufacturing of controlled substances.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 3000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Drug Distribution",
    code: "DRU-007",
    description: "Selling illegal drugs",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "The unlawful sale or distribution of controlled substances.",
    penalties: {
      minimumSentence: "2 years",
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
    name: "Drug Possession with Intent to Distribute",
    code: "DRU-008",
    description: "Possession of drugs with intent to sell",
    category: "drug_offence",
    severity: "felony",
    legalDefinition: "The unlawful possession of controlled substances with intent to distribute.",
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

  // WHITE COLLAR CRIMES
  {
    name: "Money Laundering",
    code: "MON-001",
    description: "Concealing the origins of illegally obtained money",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "The process of making illegally-gained proceeds appear legal.",
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
  {
    name: "Tax Evasion",
    code: "TAX-001",
    description: "Illegal non-payment of taxes",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "The illegal non-payment or underpayment of taxes.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Insider Trading",
    code: "INS-001",
    description: "Trading securities based on non-public information",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Trading securities based on material, non-public information.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 5000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Securities Fraud",
    code: "SEC-001",
    description: "Deceptive practices in securities trading",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Deceptive practices in the securities markets.",
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
    name: "Corporate Fraud",
    code: "COR-001",
    description: "Fraudulent activities by corporations",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Fraudulent activities committed by corporations or their officers.",
    penalties: {
      minimumSentence: "3 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 10000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Bank Fraud",
    code: "BAN-001",
    description: "Fraudulent activities involving banks",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Fraudulent activities involving banks or financial institutions.",
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
    name: "Insurance Fraud",
    code: "INS-002",
    description: "Fraudulent insurance claims",
    category: "white_collar_crime",
    severity: "serious",
    legalDefinition: "Fraudulent insurance claims or activities.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Medicare Fraud",
    code: "MED-001",
    description: "Fraudulent Medicare claims",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "Fraudulent Medicare claims or billing practices.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 5000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Telemarketing Fraud",
    code: "TEL-001",
    description: "Fraudulent telemarketing practices",
    category: "white_collar_crime",
    severity: "serious",
    legalDefinition: "Fraudulent telemarketing practices or schemes.",
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
    name: "Ponzi Scheme",
    code: "PON-001",
    description: "Investment fraud using new investors' money to pay old investors",
    category: "white_collar_crime",
    severity: "felony",
    legalDefinition: "A fraudulent investment scheme where returns are paid to earlier investors using funds from more recent investors.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "25 years",
      fineRange: { minimum: 10000, maximum: 1000000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },

  // CYBER CRIMES
  {
    name: "Computer Hacking",
    code: "COM-001",
    description: "Unauthorized access to computer systems",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Unauthorized access to computer systems or networks.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Identity Theft (Online)",
    code: "IDE-002",
    description: "Stealing personal information through digital means",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "The fraudulent use of another person's personal information obtained through digital means.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Phishing",
    code: "PHI-001",
    description: "Fraudulent attempts to obtain sensitive information",
    category: "cyber_crime",
    severity: "serious",
    legalDefinition: "Fraudulent attempts to obtain sensitive information through deceptive emails or websites.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 1000, maximum: 5000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Ransomware",
    code: "RAN-001",
    description: "Malicious software that encrypts data and demands payment",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Malicious software that encrypts data and demands payment for decryption.",
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
    name: "Data Breach",
    code: "DAT-001",
    description: "Unauthorized access to sensitive data",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Unauthorized access to sensitive personal or corporate data.",
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
    name: "Online Harassment",
    code: "ONL-001",
    description: "Harassment conducted through digital means",
    category: "cyber_crime",
    severity: "moderate",
    legalDefinition: "Harassment conducted through digital means including social media and email.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "2 years",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Cyberstalking",
    code: "CYS-001",
    description: "Repeated harassment through digital means",
    category: "cyber_crime",
    severity: "serious",
    legalDefinition: "Repeated harassment or stalking conducted through digital means.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 500, maximum: 5000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Child Pornography (Distribution)",
    code: "CHP-001",
    description: "Distribution of child pornography",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Distribution of child pornography through digital means.",
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
    name: "Cryptocurrency Fraud",
    code: "CRY-001",
    description: "Fraudulent activities involving cryptocurrency",
    category: "cyber_crime",
    severity: "felony",
    legalDefinition: "Fraudulent activities involving cryptocurrency or blockchain technology.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 5000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Social Media Fraud",
    code: "SOC-001",
    description: "Fraudulent activities on social media platforms",
    category: "cyber_crime",
    severity: "serious",
    legalDefinition: "Fraudulent activities conducted through social media platforms.",
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

  // TRAFFIC VIOLATIONS
  {
    name: "Speeding",
    code: "SPE-001",
    description: "Exceeding posted speed limits",
    category: "traffic_violation",
    severity: "minor",
    legalDefinition: "Operating a vehicle in excess of posted speed limits.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "Fine only",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Reckless Driving",
    code: "REC-001",
    description: "Driving with willful disregard for safety",
    category: "traffic_violation",
    severity: "moderate",
    legalDefinition: "Driving with willful disregard for the safety of persons or property.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Driving Under Influence (DUI)",
    code: "DUI-001",
    description: "Operating a vehicle while intoxicated",
    category: "traffic_violation",
    severity: "serious",
    legalDefinition: "Operating a motor vehicle while under the influence of alcohol or drugs.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "2 years",
      fineRange: { minimum: 500, maximum: 5000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Hit and Run",
    code: "HIT-001",
    description: "Leaving the scene of an accident",
    category: "traffic_violation",
    severity: "serious",
    legalDefinition: "Leaving the scene of a traffic accident without providing required information.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "5 years",
      fineRange: { minimum: 500, maximum: 5000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Driving Without License",
    code: "DWL-001",
    description: "Operating a vehicle without a valid license",
    category: "traffic_violation",
    severity: "minor",
    legalDefinition: "Operating a motor vehicle without a valid driver's license.",
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
    name: "Vehicular Manslaughter",
    code: "VEH-001",
    description: "Causing death through negligent driving",
    category: "traffic_violation",
    severity: "felony",
    legalDefinition: "Causing the death of another person through negligent operation of a vehicle.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Street Racing",
    code: "STR-001",
    description: "Illegal racing on public roads",
    category: "traffic_violation",
    severity: "moderate",
    legalDefinition: "Illegal racing of motor vehicles on public roads.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 200, maximum: 2000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "medium",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Driving with Suspended License",
    code: "DWS-001",
    description: "Operating a vehicle with a suspended license",
    category: "traffic_violation",
    severity: "moderate",
    legalDefinition: "Operating a motor vehicle with a suspended or revoked license.",
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

  // PUBLIC ORDER OFFENCES
  {
    name: "Disorderly Conduct",
    code: "DIS-001",
    description: "Disruptive behavior in public",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Disruptive behavior that disturbs the peace in public places.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "30 days",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Public Intoxication",
    code: "PUB-001",
    description: "Being intoxicated in public places",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Being intoxicated in public places.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "30 days",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Trespassing",
    code: "TRE-001",
    description: "Unlawful entry onto private property",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Unlawful entry onto private property without permission.",
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
    name: "Loitering",
    code: "LOI-001",
    description: "Remaining in a public place without purpose",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Remaining in a public place without apparent purpose.",
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
    name: "Disturbing the Peace",
    code: "DIS-002",
    description: "Creating a public disturbance",
    category: "public_order",
    severity: "minor",
    legalDefinition: "Creating a public disturbance or breach of peace.",
    penalties: {
      minimumSentence: "Fine only",
      maximumSentence: "30 days",
      fineRange: { minimum: 50, maximum: 500 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Rioting",
    code: "RIO-001",
    description: "Participating in a violent public disturbance",
    category: "public_order",
    severity: "felony",
    legalDefinition: "Participating in a violent public disturbance involving multiple people.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Inciting Violence",
    code: "INC-001",
    description: "Encouraging others to commit violent acts",
    category: "public_order",
    severity: "felony",
    legalDefinition: "Encouraging or inciting others to commit violent acts.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Obstruction of Justice",
    code: "OBS-001",
    description: "Interfering with legal proceedings",
    category: "public_order",
    severity: "felony",
    legalDefinition: "Interfering with legal proceedings or law enforcement activities.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Resisting Arrest",
    code: "RES-001",
    description: "Physically resisting law enforcement",
    category: "public_order",
    severity: "moderate",
    legalDefinition: "Physically resisting or obstructing law enforcement officers.",
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
    name: "Escape from Custody",
    code: "ESC-001",
    description: "Fleeing from lawful custody",
    category: "public_order",
    severity: "felony",
    legalDefinition: "Fleeing from lawful custody or detention.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "15 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },

  // SEXUAL OFFENCES
  {
    name: "Rape",
    code: "RAP-001",
    description: "Non-consensual sexual intercourse",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Non-consensual sexual intercourse with another person.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 2000, maximum: 20000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Sexual Assault",
    code: "SEX-001",
    description: "Non-consensual sexual contact",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Non-consensual sexual contact with another person.",
    penalties: {
      minimumSentence: "2 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Child Sexual Abuse",
    code: "CHS-001",
    description: "Sexual abuse of a minor",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Sexual abuse or exploitation of a minor.",
    penalties: {
      minimumSentence: "10 years",
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
    name: "Sexual Harassment",
    code: "SEH-001",
    description: "Unwanted sexual advances or behavior",
    category: "sexual_offence",
    severity: "moderate",
    legalDefinition: "Unwanted sexual advances or behavior that creates a hostile environment.",
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
    name: "Indecent Exposure",
    code: "IND-001",
    description: "Exposing genitals in public",
    category: "sexual_offence",
    severity: "moderate",
    legalDefinition: "Exposing one's genitals in public places.",
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
    name: "Prostitution",
    code: "PRO-001",
    description: "Engaging in sexual activity for payment",
    category: "sexual_offence",
    severity: "moderate",
    legalDefinition: "Engaging in sexual activity in exchange for payment.",
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
    name: "Solicitation of Prostitution",
    code: "SOL-001",
    description: "Offering payment for sexual services",
    category: "sexual_offence",
    severity: "moderate",
    legalDefinition: "Offering payment in exchange for sexual services.",
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
    name: "Sex Trafficking",
    code: "TRA-001",
    description: "Forcing others into sexual exploitation",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Forcing or coercing others into sexual exploitation.",
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
    name: "Revenge Porn",
    code: "REV-001",
    description: "Distributing intimate images without consent",
    category: "sexual_offence",
    severity: "serious",
    legalDefinition: "Distributing intimate images of another person without their consent.",
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
    name: "Sexual Exploitation of Children",
    code: "SEC-002",
    description: "Exploiting children for sexual purposes",
    category: "sexual_offence",
    severity: "felony",
    legalDefinition: "Exploiting children for sexual purposes or gratification.",
    penalties: {
      minimumSentence: "15 years",
      maximumSentence: "Life imprisonment",
      fineRange: { minimum: 10000, maximum: 100000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },

  // TERRORISM
  {
    name: "Terrorism",
    code: "TER-001",
    description: "Acts of violence intended to intimidate or coerce",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Acts of violence intended to intimidate or coerce a civilian population or government.",
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
    name: "Terrorist Financing",
    code: "TER-002",
    description: "Providing financial support to terrorist organizations",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Providing financial support to terrorist organizations or activities.",
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
    name: "Terrorist Recruitment",
    code: "TER-003",
    description: "Recruiting others for terrorist activities",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Recruiting others to participate in terrorist activities.",
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
    name: "Bomb Making",
    code: "BOM-001",
    description: "Manufacturing explosive devices",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Manufacturing explosive devices or bombs.",
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
    name: "Bomb Threat",
    code: "BOM-002",
    description: "Making threats involving explosive devices",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Making threats involving explosive devices or bombs.",
    penalties: {
      minimumSentence: "5 years",
      maximumSentence: "20 years",
      fineRange: { minimum: 5000, maximum: 50000 }
    },
    riskFactors: {
      violenceRisk: "high",
      recidivismRisk: "high",
      publicSafetyRisk: "high"
    }
  },
  {
    name: "Bioterrorism",
    code: "BIO-001",
    description: "Using biological agents as weapons",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Using biological agents as weapons of terror.",
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
  {
    name: "Cyberterrorism",
    code: "CYT-001",
    description: "Using cyber attacks for terrorist purposes",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Using cyber attacks for terrorist purposes or to intimidate populations.",
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
    name: "Material Support to Terrorism",
    code: "MAT-001",
    description: "Providing material support to terrorist organizations",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Providing material support to terrorist organizations.",
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
    name: "Hijacking",
    code: "HIJ-001",
    description: "Seizing control of vehicles or aircraft",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Seizing control of vehicles or aircraft for terrorist purposes.",
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
    name: "Hostage Taking",
    code: "HOS-001",
    description: "Taking hostages for terrorist purposes",
    category: "terrorism",
    severity: "felony",
    legalDefinition: "Taking hostages for terrorist purposes or to coerce governments.",
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

  // OTHER OFFENCES
  {
    name: "Perjury",
    code: "PER-001",
    description: "Lying under oath in court",
    category: "other",
    severity: "felony",
    legalDefinition: "Lying under oath in court or legal proceedings.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Contempt of Court",
    code: "CON-001",
    description: "Disrespecting court authority",
    category: "other",
    severity: "moderate",
    legalDefinition: "Disrespecting or disobeying court authority.",
    penalties: {
      minimumSentence: "30 days",
      maximumSentence: "1 year",
      fineRange: { minimum: 100, maximum: 1000 }
    },
    riskFactors: {
      violenceRisk: "low",
      recidivismRisk: "medium",
      publicSafetyRisk: "low"
    }
  },
  {
    name: "Bribery",
    code: "BRI-001",
    description: "Offering or accepting bribes",
    category: "other",
    severity: "felony",
    legalDefinition: "Offering or accepting bribes to influence official actions.",
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
    name: "Extortion",
    code: "EXT-001",
    description: "Obtaining money through threats",
    category: "other",
    severity: "felony",
    legalDefinition: "Obtaining money or property through threats or intimidation.",
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
    name: "Blackmail",
    code: "BLA-001",
    description: "Threatening to reveal damaging information",
    category: "other",
    severity: "felony",
    legalDefinition: "Threatening to reveal damaging information unless demands are met.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "10 years",
      fineRange: { minimum: 1000, maximum: 10000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Stalking",
    code: "STA-001",
    description: "Repeatedly following or harassing someone",
    category: "other",
    severity: "serious",
    legalDefinition: "Repeatedly following or harassing another person.",
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
    name: "Harassment",
    code: "HAR-001",
    description: "Repeated unwanted contact or behavior",
    category: "other",
    severity: "moderate",
    legalDefinition: "Repeated unwanted contact or behavior that causes distress.",
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
    name: "Trespassing (Aggravated)",
    code: "TRE-002",
    description: "Trespassing with intent to commit a crime",
    category: "other",
    severity: "serious",
    legalDefinition: "Trespassing with intent to commit a crime.",
    penalties: {
      minimumSentence: "1 year",
      maximumSentence: "5 years",
      fineRange: { minimum: 500, maximum: 5000 }
    },
    riskFactors: {
      violenceRisk: "medium",
      recidivismRisk: "high",
      publicSafetyRisk: "medium"
    }
  },
  {
    name: "Possession of Stolen Property",
    code: "POS-001",
    description: "Knowingly possessing stolen goods",
    category: "other",
    severity: "serious",
    legalDefinition: "Knowingly possessing stolen property.",
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
    name: "Receiving Stolen Property",
    code: "REC-002",
    description: "Receiving goods known to be stolen",
    category: "other",
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
  }
];

async function createOffences() {
  try {
    console.log('Starting to create offences...');
    
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
    
    // Clear existing offences
    await Offence.deleteMany({});
    console.log('Cleared existing offences');
    
    // Create offences with organisation and user IDs
    const organisationId = organisation._id;
    const userId = user._id;
    
    const offencesWithMetadata = offences.map(offence => ({
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
    console.log(`Successfully created ${createdOffences.length} offences`);
    
    // Print summary by category
    const categoryCounts = {};
    offences.forEach(offence => {
      categoryCounts[offence.category] = (categoryCounts[offence.category] || 0) + 1;
    });
    
    console.log('\nOffences created by category:');
    Object.entries(categoryCounts).forEach(([category, count]) => {
      console.log(`${category}: ${count} offences`);
    });
    
    console.log('\nTotal offences created:', offences.length);
    
  } catch (error) {
    console.error('Error creating offences:', error);
  } finally {
    mongoose.connection.close();
  }
}

createOffences();
