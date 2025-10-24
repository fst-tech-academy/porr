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
