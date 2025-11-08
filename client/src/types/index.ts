export interface EntityOption {
  _id: string;
  display: string;
  type?: string;
}

export interface User {
  id: string;
  _id?: string; // MongoDB _id field
  firstName: string;
  lastName: string;
  email: string;
  role: 'super_admin' | 'admin' | 'manager' | 'officer' | 'viewer';
  nationalId: string;
  employeeId: string;
  phone?: string;
  lastLogin?: string;
  isActive?: boolean;
  emailVerified?: boolean;
  profilePhoto?: string; // Added profilePhoto field
  organisationId?: string; // Added organisationId field
  createdAt: string;
}

export interface Organisation {
  _id: string;
  name: string;
  description?: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  settings: {
    isActive: boolean;
    maxUsers: number;
    features: {
      userManagement: boolean;
      caseManagement: boolean;
      offenceRecords: boolean;
      fileUploads: boolean;
      emailNotifications: boolean;
      auditLogging: boolean;
      dashboardAnalytics: boolean;
    };
  };
  adminUser?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isActive: boolean;
    phone?: string;
    employeeId: string;
  };
  subscription: {
    plan: 'free' | 'basic' | 'premium' | 'enterprise';
    startDate: string;
    endDate?: string;
    isActive: boolean;
  };
  metadata: {
    createdBy: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    lastModifiedBy?: {
      _id: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    tags: string[];
  };
  userCount?: number;
  activeUserCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrganisationFormData {
  name: string;
  description?: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  settings?: {
    maxUsers?: number;
    features?: {
      userManagement?: boolean;
      caseManagement?: boolean;
      offenceRecords?: boolean;
      fileUploads?: boolean;
      emailNotifications?: boolean;
      auditLogging?: boolean;
      dashboardAnalytics?: boolean;
    };
  };
  subscription?: {
    plan?: 'free' | 'basic' | 'premium' | 'enterprise';
    endDate?: string;
  };
  adminUser: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
    nationalId?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}








export interface SimCard {
  _id: string;
  simId: string;
  customer: {
    personalInfo: {
      firstName: string;
      lastName: string;
      dateOfBirth: string;
      nationality: string;
      idType: 'passport' | 'national_id' | 'driving_license' | 'other';
      idNumber: string;
    };
    contactInfo: {
      email?: string;
      phone?: string;
      address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
      };
    };
  };
  simDetails: {
    phoneNumber: string;
    iccid: string;
    imsi: string;
    simType: 'standard' | 'micro' | 'nano' | 'esim';
    activationDate: string;
    expiryDate?: string;
    status: 'active' | 'inactive' | 'suspended' | 'expired' | 'blocked';
  };
  telecomProvider: {
    name: string;
    providerId: string;
    contactInfo?: {
      phone?: string;
      email?: string;
      address?: string;
    };
    licenseNumber: string;
  };
  planDetails: {
    planName: string;
    planType: 'prepaid' | 'postpaid' | 'hybrid';
    dataAllowance?: number;
    voiceAllowance?: number;
    smsAllowance?: number;
    validityPeriod?: number;
  };
  compliance: {
    localAuthorityNotification: {
      notified: boolean;
      notificationDate?: string;
      notificationMethod?: 'api' | 'email' | 'manual' | 'batch_upload';
      referenceNumber?: string;
    };
    verificationStatus: 'pending' | 'verified' | 'failed' | 'requires_review';
    verificationDate?: string;
    verifiedBy?: string;
  };
  documents: Array<{
    type: string;
    documentNumber?: string;
    url: string;
    uploadedAt: string;
  }>;
  usage: {
    dataUsed: number;
    voiceUsed: number;
    smsUsed: number;
    lastUsageDate?: string;
  };
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
}

export interface StatsResponse {
  success: boolean;
  data: {
    total: number;
    active: number;
    [key: string]: any;
  };
}

// Offender Registry System Types

export interface Offender {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    placeOfBirth?: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    nationalId?: string;
    passportNumber?: string;
    phoneNumber?: string;
    email?: string;
  };
  physicalDescription?: {
    height?: number;
    weight?: number;
    eyeColor?: 'brown' | 'blue' | 'green' | 'hazel' | 'gray' | 'amber' | 'other';
    hairColor?: 'black' | 'brown' | 'blonde' | 'red' | 'gray' | 'white' | 'other';
    skinTone?: 'light' | 'medium' | 'dark' | 'very dark';
    distinguishingMarks?: string;
    tattoos?: Array<{ description: string; location: string }>;
    scars?: Array<{ description: string; location: string }>;
  };
  address?: {
    current?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      coordinates?: { latitude: number; longitude: number };
    };
    permanent?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      coordinates?: { latitude: number; longitude: number };
    };
    previousAddresses?: Array<{
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      dateFrom?: string;
      dateTo?: string;
    }>;
  };
  familyInfo?: {
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated';
    spouse?: { name: string; phone?: string; address?: string };
    children?: Array<{ name: string; age?: number; relationship: string }>;
    parents?: {
      father?: { name: string; phone?: string; address?: string };
      mother?: { name: string; phone?: string; address?: string };
    };
    emergencyContact?: { name: string; relationship: string; phone?: string; address?: string };
  };
  employment?: {
    current?: {
      employer?: string;
      position?: string;
      address?: string;
      phone?: string;
      startDate?: string;
    };
    previous?: Array<{
      employer?: string;
      position?: string;
      address?: string;
      phone?: string;
      startDate?: string;
      endDate?: string;
    }>;
  };
  criminalHistory?: {
    offences?: Array<{
      offenceCatalogueId: OffenceCatalogue | string;
      caseId: Case | string;
      dateCommitted: string;
      dateArrested?: string;
      status: 'pending' | 'convicted' | 'acquitted' | 'dismissed' | 'appealed';
      sentence?: string;
      fine?: number;
      communityService?: number;
      probationPeriod?: number;
      notes?: string;
    }>;
    aliases?: Array<{ name: string; type: 'nickname' | 'alias' | 'maiden_name' | 'other' }>;
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'critical';
    factors?: Array<{ factor: string; weight: number }>;
    lastAssessment?: string;
    nextAssessment?: string;
    notes?: string;
  };
  medicalInfo?: {
    mentalHealthStatus?: 'stable' | 'treatment_required' | 'medication_required' | 'hospitalized';
    physicalHealthStatus?: 'good' | 'fair' | 'poor' | 'critical';
    medications?: Array<{ name: string; dosage: string; frequency: string }>;
    allergies?: string[];
    medicalNotes?: string;
  };
  status: {
    isActive: boolean;
    isInCustody: boolean;
    custodyLocation?: string;
    custodyStartDate?: string;
    expectedReleaseDate?: string;
    paroleStatus?: 'none' | 'eligible' | 'on_parole' | 'parole_violated' | 'completed';
    probationStatus?: 'none' | 'active' | 'completed' | 'violated';
  };
  // Direct access properties for frontend compatibility
  isActive: boolean;
  custodyStatus: 'in_custody' | 'released' | 'probation' | 'parole' | 'community_service';
  profilePhoto?: string;
  photos?: Array<{
    url: string;
    type: 'mugshot' | 'profile' | 'identification' | 'other';
    description?: string;
    uploadedAt: string;
  }>;
  documents?: Array<{
    url: string;
    type: 'id_copy' | 'passport_copy' | 'court_document' | 'medical_record' | 'other';
    description?: string;
    uploadedAt: string;
  }>;
  organisationId: string;
  createdBy: User | string;
  lastModifiedBy?: User | string;
  tags?: string[];
  notes?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  // Direct access properties for frontend compatibility
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  fullName?: string;
  age?: number;
}

export interface OffenceCatalogue {
  _id: string;
  name: string;
  description: string;
  code: string;
  category: 'violent_crime' | 'property_crime' | 'white_collar_crime' | 'drug_crime' | 'cyber_crime' | 'traffic_violation' | 'public_order' | 'sexual_crime' | 'terrorism' | 'other';
  subcategory?: string;
  severity: 'minor' | 'moderate' | 'serious' | 'major' | 'severe';
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  penaltyRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  isActive: boolean;
  organisationId: string;
  createdBy: User | string;
  lastModifiedBy?: User | string;
  tags?: string[];
  notes?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  // Virtual fields
  displayName?: string;
}

export interface Case {
  _id: string;
  caseNumber: string;
  title: string;
  description: string;
  caseType: 'criminal' | 'civil' | 'administrative' | 'appeal' | 'review' | 'investigation' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  offenders: Array<{
    offenderId: Offender | string;
    role: 'primary' | 'secondary' | 'accomplice' | 'witness';
    charges: Array<{
      offenceCatalogueId: OffenceCatalogue | string;
      count: number;
      description?: string;
      dateCommitted: string;
      location?: string;
    }>;
  }>;
  victims?: Array<{
    name: string;
    contactInfo?: { phone?: string; email?: string; address?: string };
    relationship?: string;
    impactStatement?: string;
  }>;
  witnesses?: Array<{
    name: string;
    contactInfo?: { phone?: string; email?: string; address?: string };
    statement?: string;
    credibility?: 'high' | 'medium' | 'low';
  }>;
  offences: Array<{
    offenceCatalogueId: OffenceCatalogue | string;
    count: number;
    description?: string;
    dateCommitted: string;
    location?: string;
    evidence?: string[];
  }>;
  court?: {
    courtId?: Court | string;
    judge?: string;
    prosecutor?: string;
    defenseAttorney?: string;
    courtDate?: string;
    nextHearing?: string;
  };
  timeline: Array<{
    date: string;
    event: 'case_opened' | 'investigation_started' | 'arrest_made' | 'charges_filed' | 'arraignment' | 'preliminary_hearing' | 'trial_started' | 'trial_completed' | 'sentencing' | 'appeal_filed' | 'case_closed' | 'other';
    description?: string;
    location?: string;
    participants?: string[];
    documents?: string[];
    createdBy?: User | string;
  }>;
  status: {
    current: 'open' | 'under_investigation' | 'charges_pending' | 'in_court' | 'trial_in_progress' | 'awaiting_sentencing' | 'sentenced' | 'appealed' | 'closed' | 'dismissed' | 'acquitted';
    previous: Array<{
      status: string;
      dateChanged: string;
      changedBy: User | string;
      reason?: string;
    }>;
  };
  investigation?: {
    assignedOfficer?: User | string;
    assignedTeam?: Array<User | string>;
    startDate?: string;
    endDate?: string;
    evidence?: Array<{
      type: 'physical' | 'digital' | 'testimony' | 'document' | 'other';
      description?: string;
      collectedBy?: User | string;
      collectedDate?: string;
      location?: string;
      chainOfCustody?: Array<{ person: string; date: string; action: string }>;
    }>;
    leads?: Array<{
      description: string;
      source?: string;
      status: 'active' | 'investigated' | 'closed' | 'false';
      assignedTo?: User | string;
    }>;
  };
  outcome?: {
    verdict?: 'guilty' | 'not_guilty' | 'dismissed' | 'plea_bargain' | 'pending';
    sentence?: string;
    fine?: number;
    communityService?: number;
    probationPeriod?: number;
    paroleEligibility?: string;
    restitution?: number;
    notes?: string;
  };
  documents?: Array<{
    name: string;
    type: 'arrest_report' | 'investigation_report' | 'court_document' | 'evidence' | 'medical_report' | 'witness_statement' | 'other';
    url: string;
    uploadedBy?: User | string;
    uploadedAt: string;
    description?: string;
    isConfidential?: boolean;
  }>;
  organisationId: string;
  createdBy: User | string;
  lastModifiedBy?: User | string;
  tags?: string[];
  notes?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  // Virtual fields
  caseAge?: number;
}

export interface Court {
  _id: string;
  name: string;
  code: string;
  description?: string;
  type: 'supreme_court' | 'appeals_court' | 'district_court' | 'regional_court' | 'municipal_court' | 'specialized_court' | 'military_court' | 'other';
  jurisdiction: 'federal' | 'state' | 'regional' | 'municipal' | 'specialized';
  level: 'trial' | 'appellate' | 'supreme' | 'administrative';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    coordinates?: { latitude: number; longitude: number };
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    fax?: string;
    website?: string;
  };
  personnel?: {
    judges?: Array<{
      name: string;
      title?: string;
      specialization?: string[];
      contactInfo?: { phone?: string; email?: string };
      isActive?: boolean;
    }>;
    clerks?: Array<{
      name: string;
      title?: string;
      contactInfo?: { phone?: string; email?: string };
      isActive?: boolean;
    }>;
    prosecutors?: Array<{
      name: string;
      title?: string;
      specialization?: string[];
      contactInfo?: { phone?: string; email?: string };
      isActive?: boolean;
    }>;
  };
  operations?: {
    businessHours?: {
      monday?: { open: string; close: string };
      tuesday?: { open: string; close: string };
      wednesday?: { open: string; close: string };
      thursday?: { open: string; close: string };
      friday?: { open: string; close: string };
      saturday?: { open: string; close: string };
      sunday?: { open: string; close: string };
    };
    holidays?: string[];
    capacity?: {
      courtrooms?: number;
      seatingCapacity?: number;
    };
    facilities?: Array<{
      name: string;
      type: 'courtroom' | 'conference_room' | 'holding_cell' | 'office' | 'other';
      capacity?: number;
      equipment?: string[];
    }>;
  };
  caseManagement?: {
    caseTypes?: string[];
    maxCaseLoad?: number;
    currentCaseLoad?: number;
    averageProcessingTime?: number;
    backlogThreshold?: number;
  };
  budget?: {
    annual?: number;
    currency?: string;
    allocated?: number;
    spent?: number;
    remaining?: number;
  };
  metrics?: {
    casesProcessed?: number;
    averageResolutionTime?: number;
    successRate?: number;
    satisfactionRating?: number;
    lastUpdated?: string;
  };
  isActive: boolean;
  establishedDate?: string;
  lastInspectionDate?: string;
  nextInspectionDate?: string;
  organisationId: string;
  createdBy: User | string;
  lastModifiedBy?: User | string;
  tags?: string[];
  notes?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  // Virtual fields
  fullAddress?: string;
  utilizationRate?: number;
}

export interface Agent {
  _id: string;
  agentId: string; // Auto-incremented numeric field (00001 format)
  pseudonym: {
    firstName: string;
    lastName: string;
    codeName?: string;
  };
  realIdentity?: {
    firstName?: string;
    lastName?: string;
    nationalId?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
  };
  department: Department | string;
  user?: User | string;
  rank: 'detective' | 'senior_detective' | 'supervisor' | 'commander' | 'director';
  specialization: 'homicide' | 'narcotics' | 'fraud' | 'cybercrime' | 'terrorism' | 'organized_crime' | 'general' | 'other';
  employmentDate: string;
  status: 'active' | 'on_leave' | 'suspended' | 'retired' | 'transferred';
  clearanceLevel: 'confidential' | 'secret' | 'top_secret';
  contactInfo?: {
    phone?: string;
    email?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  physicalDescription?: {
    height?: number;
    weight?: number;
    eyeColor?: string;
    hairColor?: string;
    distinguishingMarks?: string;
  };
  caseAssignments?: Array<{
    caseId?: Case | string;
    crimeId?: OffenderOffence | string;
    assignedDate?: string;
    role: 'lead_investigator' | 'co_investigator' | 'support' | 'supervisor';
    status: 'active' | 'completed' | 'transferred' | 'closed';
    notes?: string;
  }>;
  performance?: {
    totalCases?: number;
    solvedCases?: number;
    currentCases?: number;
    ratings?: Array<{
      date: string;
      rating: number;
      notes?: string;
      reviewedBy?: User | string;
    }>;
    certifications?: Array<{
      name: string;
      issuingOrganization: string;
      issueDate: string;
      expiryDate?: string;
      certificateNumber?: string;
    }>;
    training?: Array<{
      courseName: string;
      institution: string;
      completionDate: string;
      certificate?: string;
    }>;
  };
  medicalInfo?: {
    mentalHealthStatus?: 'stable' | 'treatment_required' | 'medication_required' | 'hospitalized';
    physicalHealthStatus?: 'good' | 'fair' | 'poor' | 'critical';
    medications?: Array<{ name: string; dosage: string; frequency: string }>;
    allergies?: string[];
    medicalNotes?: string;
    fitnessForDuty?: boolean;
    lastFitnessTest?: string;
  };
  statusInfo: {
    isActive: boolean;
    lastActiveDate?: string;
    onDuty: boolean;
    currentLocation?: string;
    availability: 'available' | 'on_case' | 'on_leave' | 'off_duty';
  };
  profilePhoto?: string;
  photos?: Array<{
    url: string;
    type: 'badge_photo' | 'profile' | 'identification' | 'other';
    description?: string;
    uploadedAt: string;
  }>;
  documents?: Array<{
    url: string;
    type: 'id_copy' | 'passport_copy' | 'badge_copy' | 'certificate' | 'medical_record' | 'other';
    description?: string;
    uploadedAt: string;
  }>;
  organisationId: string;
  createdBy: User | string;
  lastModifiedBy?: User | string;
  tags?: string[];
  notes?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
  // Direct access properties for frontend compatibility
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Virtual fields
  fullPseudonym?: string;
  age?: number;
  yearsOfService?: number;
}

export interface AgentFormData {
  pseudonym: {
    firstName: string;
    lastName: string;
    codeName?: string;
  };
  realIdentity?: {
    firstName?: string;
    lastName?: string;
    nationalId?: string;
    dateOfBirth?: string;
    placeOfBirth?: string;
  };
  department: string;
  user?: string;
  rank: 'detective' | 'senior_detective' | 'supervisor' | 'commander' | 'director';
  specialization: 'homicide' | 'narcotics' | 'fraud' | 'cybercrime' | 'terrorism' | 'organized_crime' | 'general' | 'other';
  employmentDate: string;
  status?: 'active' | 'on_leave' | 'suspended' | 'retired' | 'transferred';
  clearanceLevel?: 'confidential' | 'secret' | 'top_secret';
  contactInfo?: {
    phone?: string;
    email?: string;
    emergencyContact?: {
      name?: string;
      relationship?: string;
      phone?: string;
    };
  };
  physicalDescription?: {
    height?: number;
    weight?: number;
    eyeColor?: string;
    hairColor?: string;
    distinguishingMarks?: string;
  };
  statusInfo?: {
    isActive?: boolean;
    onDuty?: boolean;
    availability?: 'available' | 'on_case' | 'on_leave' | 'off_duty';
  };
  notes?: string;
}

// Form data interfaces
export interface OffenderFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    middleName?: string;
    dateOfBirth: string;
    placeOfBirth?: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    nationalId?: string;
    passportNumber?: string;
    phoneNumber?: string;
    email?: string;
  };
  physicalDescription?: {
    height?: number;
    weight?: number;
    eyeColor?: string;
    hairColor?: string;
    skinTone?: string;
    distinguishingMarks?: string;
  };
  address?: {
    current?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    permanent?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
  familyInfo?: {
    maritalStatus?: string;
    spouse?: { name?: string; phone?: string; address?: string };
    emergencyContact?: { name?: string; relationship?: string; phone?: string; address?: string };
  };
  riskAssessment?: {
    level: 'low' | 'medium' | 'high' | 'critical';
    notes?: string;
  };
  status?: {
    isActive?: boolean;
    isInCustody?: boolean;
    custodyLocation?: string;
  };
  notes?: string;
}

export interface OffenceCatalogueFormData {
  name: string;
  description: string;
  code: string;
  category: string;
  severity: string;
  riskLevel: string;
  penaltyRange?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  notes?: string;
}

export interface CaseFormData {
  caseNumber: string;
  title: string;
  description: string;
  caseType: string;
  priority: string;
  offenders: Array<{
    offenderId: string;
    role: string;
  }>;
  offences: Array<{
    offenceCatalogueId: string;
    count: number;
    dateCommitted: string;
    location?: string;
  }>;
  court?: {
    courtId?: string;
    judge?: string;
    prosecutor?: string;
    defenseAttorney?: string;
  };
  notes?: string;
}

export interface CourtFormData {
  name: string;
  code: string;
  description?: string;
  type: string;
  jurisdiction: string;
  level: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  caseManagement?: {
    maxCaseLoad?: number;
  };
  budget?: {
    annual?: number;
  };
  notes?: string;
}

// Victim Interface
export interface Victim {
  _id: string;
  personalInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    nationalId?: string;
    passportNumber?: string;
    phoneNumber?: string;
    email?: string;
  };
  physicalDescription?: {
    height?: number;
    weight?: number;
    eyeColor?: string;
    hairColor?: string;
    skinTone?: string;
    distinguishingMarks?: string;
  };
  address?: {
    current?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      coordinates?: {
        latitude?: number;
        longitude?: number;
      };
    };
    permanent?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
      coordinates?: {
        latitude?: number;
        longitude?: number;
      };
    };
  };
  status: {
    isActive: boolean;
    isDeceased: boolean;
    dateOfDeath?: string;
    causeOfDeath?: string;
    isMinor: boolean;
    guardianInfo?: {
      name?: string;
      relationship?: string;
      contactInfo?: {
        phone?: string;
        email?: string;
      };
    };
  };
  impactAssessment?: {
    physicalInjuries?: Array<{
      type?: string;
      severity?: 'minor' | 'moderate' | 'severe' | 'critical';
      description?: string;
      medicalTreatment?: string;
      recoveryStatus?: 'recovered' | 'ongoing' | 'permanent';
    }>;
    psychologicalImpact?: {
      traumaLevel?: 'none' | 'mild' | 'moderate' | 'severe';
      counselingRequired?: boolean;
      notes?: string;
    };
    financialImpact?: {
      medicalExpenses?: number;
      lostWages?: number;
      propertyDamage?: number;
      otherExpenses?: number;
    };
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  caseInfo: {
    victimId: string;
    caseNumbers?: string[];
    assignedOfficer?: string;
    assignedProsecutor?: string;
    assignedSocialWorker?: string;
  };
  notes?: string;
  tags?: string[];
  organisationId: string;
  createdBy: string;
  lastModifiedBy?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

// OffenderOffence (Crime) Interface
export interface OffenderOffence {
  _id: string;
  crimeInfo: {
    crimeId: string;
    caseNumber: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
  };
  dateTime: {
    dateCommitted: string;
    timeCommitted?: string;
    dateReported: string;
    dateArrested?: string;
    dateCharged?: string;
    dateConvicted?: string;
    dateSentenced?: string;
  };
  location: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    coordinates?: {
      latitude?: number;
      longitude?: number;
    };
    locationType?: 'residential' | 'commercial' | 'public' | 'private' | 'vehicle' | 'online' | 'other';
    specificLocation?: string;
  };
  offender: string | Offender;
  offenceCatalogue: string | OffenceCatalogue;
  victims?: Array<{
    victim: string | Victim;
    relationshipToOffender?: 'stranger' | 'acquaintance' | 'family' | 'friend' | 'colleague' | 'neighbor' | 'romantic' | 'other';
    victimImpact?: {
      physicalInjury?: boolean;
      psychologicalImpact?: 'none' | 'mild' | 'moderate' | 'severe';
      financialLoss?: number;
    };
  }>;
  legal: {
    status: 'reported' | 'under_investigation' | 'charged' | 'trial' | 'convicted' | 'acquitted' | 'dismissed' | 'plea_bargain';
    severity: 'minor' | 'moderate' | 'serious' | 'major' | 'felony';
    charges?: Array<{
      charge: string;
      statute?: string;
      penalty?: string;
    }>;
    court?: string | Court;
    judge?: {
      name?: string;
      id?: string;
    };
    prosecutor?: {
      name?: string;
      id?: string;
    };
    defenseAttorney?: {
      name?: string;
      id?: string;
    };
    verdict?: 'guilty' | 'not_guilty' | 'no_contest' | 'dismissed' | 'pending';
    sentence?: {
      type?: 'prison' | 'probation' | 'fine' | 'community_service' | 'suspended' | 'dismissed' | 'other';
      duration?: string;
      fine?: number;
      conditions?: string[];
    };
  };
  investigation?: {
    assignedOfficer?: string;
    assignedDetective?: string;
    evidence?: Array<{
      type?: 'physical' | 'digital' | 'witness' | 'documentary' | 'forensic' | 'other';
      description?: string;
      collectedDate?: string;
      location?: string;
      status?: 'collected' | 'analyzed' | 'presented' | 'dismissed';
    }>;
    witnesses?: Array<{
      name?: string;
      contactInfo?: string;
      statement?: string;
      credibility?: 'high' | 'medium' | 'low';
    }>;
    suspects?: string[];
    motive?: string;
    method?: string;
  };
  financialImpact?: {
    propertyDamage?: number;
    stolenValue?: number;
    investigationCost?: number;
    courtCosts?: number;
    victimCompensation?: number;
  };
  media?: {
    isPublic?: boolean;
    mediaCoverage?: 'none' | 'local' | 'national' | 'international';
    pressReleases?: Array<{
      date?: string;
      content?: string;
      issuedBy?: string;
    }>;
  };
  riskAssessment?: {
    threatLevel?: 'low' | 'medium' | 'high' | 'critical';
    recidivismRisk?: 'low' | 'medium' | 'high';
    publicSafetyRisk?: 'low' | 'medium' | 'high' | 'critical';
  };
  notes?: string;
  tags?: string[];
  isActive: boolean;
  organisationId: string;
  createdBy: string;
  lastModifiedBy?: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    version: number;
  };
}

// Form Data Interfaces
export interface VictimFormData {
  personalInfo: {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'other';
    nationality: string;
    nationalId?: string;
    passportNumber?: string;
    phoneNumber?: string;
    email?: string;
  };
  physicalDescription?: {
    height?: number;
    weight?: number;
    eyeColor?: string;
    hairColor?: string;
    skinTone?: string;
    distinguishingMarks?: string;
  };
  address?: {
    current?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    permanent?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  };
  status: {
    isActive: boolean;
    isDeceased: boolean;
    dateOfDeath?: string;
    causeOfDeath?: string;
    isMinor: boolean;
    guardianInfo?: {
      name?: string;
      relationship?: string;
      contactInfo?: {
        phone?: string;
        email?: string;
      };
    };
  };
  emergencyContact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  caseInfo: {
    caseNumbers?: string[];
    assignedOfficer?: string;
    assignedProsecutor?: string;
    assignedSocialWorker?: string;
  };
  notes?: string;
  tags?: string[];
}

export interface OffenderOffenceFormData {
  crimeInfo: {
    caseNumber: string;
    title: string;
    description: string;
    category: string;
    subcategory?: string;
  };
  dateTime: {
    dateCommitted: string;
    timeCommitted?: string;
    dateReported: string;
    dateArrested?: string;
    dateCharged?: string;
    dateConvicted?: string;
    dateSentenced?: string;
  };
  location: {
    street?: string;
    city: string;
    state: string;
    country: string;
    postalCode?: string;
    locationType?: 'residential' | 'commercial' | 'public' | 'private' | 'vehicle' | 'online' | 'other';
    specificLocation?: string;
  };
  offender: string;
  offenceCatalogue: string;
  victims?: Array<{
    victim: string;
    relationshipToOffender?: 'stranger' | 'acquaintance' | 'family' | 'friend' | 'colleague' | 'neighbor' | 'romantic' | 'other';
    victimImpact?: {
      physicalInjury?: boolean;
      psychologicalImpact?: 'none' | 'mild' | 'moderate' | 'severe';
      financialLoss?: number;
    };
  }>;
  legal: {
    status: 'reported' | 'under_investigation' | 'charged' | 'trial' | 'convicted' | 'acquitted' | 'dismissed' | 'plea_bargain';
    severity: 'minor' | 'moderate' | 'serious' | 'major' | 'felony';
    charges?: Array<{
      charge: string;
      statute?: string;
      penalty?: string;
    }>;
    court?: string;
    judge?: {
      name?: string;
      id?: string;
    };
    prosecutor?: {
      name?: string;
      id?: string;
    };
    defenseAttorney?: {
      name?: string;
      id?: string;
    };
    verdict?: 'guilty' | 'not_guilty' | 'no_contest' | 'dismissed' | 'pending';
    sentence?: {
      type?: 'prison' | 'probation' | 'fine' | 'community_service' | 'suspended' | 'dismissed' | 'other';
      duration?: string;
      fine?: number;
      conditions?: string[];
    };
  };
  investigation?: {
    assignedOfficer?: string;
    assignedDetective?: string;
    evidence?: Array<{
      type?: 'physical' | 'digital' | 'witness' | 'documentary' | 'forensic' | 'other';
      description?: string;
      collectedDate?: string;
      location?: string;
      status?: 'collected' | 'analyzed' | 'presented' | 'dismissed';
    }>;
    witnesses?: Array<{
      name?: string;
      contactInfo?: string;
      statement?: string;
      credibility?: 'high' | 'medium' | 'low';
    }>;
    suspects?: string[];
    motive?: string;
    method?: string;
  };
  financialImpact?: {
    propertyDamage?: number;
    stolenValue?: number;
    investigationCost?: number;
    courtCosts?: number;
    victimCompensation?: number;
  };
  media?: {
    isPublic?: boolean;
    mediaCoverage?: 'none' | 'local' | 'national' | 'international';
  };
  riskAssessment?: {
    threatLevel?: 'low' | 'medium' | 'high' | 'critical';
    recidivismRisk?: 'low' | 'medium' | 'high';
    publicSafetyRisk?: 'low' | 'medium' | 'high' | 'critical';
  };
  notes?: string;
  tags?: string[];
}
