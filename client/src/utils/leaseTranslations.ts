export interface LeaseTranslations {
  // Header
  title: string;
  leaseId: string;
  generatedOn: string;

  // Sections
  partiesSection: string;
  propertySection: string;
  leaseTermsSection: string;
  occupancySection: string;
  utilitiesSection: string;
  rulesSection: string;
  brokerSection: string;
  guarantorsSection: string;
  importantTermsSection: string;
  signaturesSection: string;

  // Party labels
  landlord: string;
  tenant: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  nationality: string;

  // Property labels
  propertyAddress: string;
  propertyType: string;
  bedrooms: string;
  bathrooms: string;
  squareFootage: string;
  monthlyRent: string;

  // Lease terms labels
  leaseStartDate: string;
  leaseEndDate: string;
  leaseDuration: string;
  noticePeriod: string;
  earlyTerminationFee: string;
  renewalOptions: string;
  available: string;
  notAvailable: string;
  months: string;
  days: string;

  // Occupancy labels
  numberOfOccupants: string;
  occupantsText: string;
  additionalOccupants: string;
  petInformation: string;
  age: string;

  // Utilities labels
  utilitiesIncluded: string;
  tenantResponsibilities: string;
  noUtilitiesIncluded: string;
  allUtilitiesIncluded: string;

  // Rules labels
  smokingPolicy: string;
  notAllowed: string;
  allowed: string;
  designatedAreasOnly: string;
  smokingText: string;
  noiseRestrictions: string;
  quietHours: string;
  additionalRestrictions: string;
  standardNoiseRestrictions: string;
  guestPolicy: string;
  overnightGuests: string;
  maxStay: string;
  unlimited: string;
  nights: string;
  noticeRequired: string;
  yes: string;
  no: string;

  // Broker labels
  broker: string;
  contact: string;

  // Guarantors labels
  guarantors: string;

  // Important terms labels
  paymentTerms: string;
  paymentTermsText: string;
  securityDeposit: string;
  securityDepositText: string;
  maintenanceAndRepairs: string;
  maintenanceText: string;
  termination: string;
  terminationText: string;

  // Signature labels
  signatureAgreementText: string;
  landlordSignature: string;
  tenantSignature: string;
  witnessSignature: string;
  signedOn: string;
  notSigned: string;

  // Footer labels
  generatedElectronically: string;
  status: string;
  contactText: string;
}

export const englishTranslations: LeaseTranslations = {
  title: 'RESIDENTIAL LEASE AGREEMENT',
  leaseId: 'Lease ID',
  generatedOn: 'Generated on',

  partiesSection: 'PARTIES TO THIS AGREEMENT',
  propertySection: 'PROPERTY INFORMATION',
  leaseTermsSection: 'LEASE TERMS',
  occupancySection: 'OCCUPANCY DETAILS',
  utilitiesSection: 'UTILITIES AND MAINTENANCE',
  rulesSection: 'RULES AND REGULATIONS',
  brokerSection: 'BROKER INFORMATION',
  guarantorsSection: 'GUARANTORS',
  importantTermsSection: 'IMPORTANT TERMS AND CONDITIONS',
  signaturesSection: 'DIGITAL SIGNATURES',

  landlord: 'LANDLORD',
  tenant: 'TENANT',
  name: 'Name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  dateOfBirth: 'Date of Birth',
  nationality: 'Nationality',

  propertyAddress: 'Property Address',
  propertyType: 'Property Type',
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  squareFootage: 'Square Footage',
  monthlyRent: 'Monthly Rent',

  leaseStartDate: 'Lease Start Date',
  leaseEndDate: 'Lease End Date',
  leaseDuration: 'Lease Duration',
  noticePeriod: 'Notice Period',
  earlyTerminationFee: 'Early Termination Fee',
  renewalOptions: 'Renewal Options',
  available: 'Available',
  notAvailable: 'Not Available',
  months: 'months',
  days: 'days',

  numberOfOccupants: 'Number of Occupants',
  occupantsText: 'This property is leased for',
  additionalOccupants: 'Additional Occupants',
  petInformation: 'Pet Information',
  age: 'Age',

  utilitiesIncluded: 'Utilities Included',
  tenantResponsibilities: 'Tenant Responsibilities',
  noUtilitiesIncluded: 'No utilities are included in the rent.',
  allUtilitiesIncluded: 'All utilities are included in the rent.',

  smokingPolicy: 'Smoking Policy',
  notAllowed: 'NOT ALLOWED',
  allowed: 'ALLOWED',
  designatedAreasOnly: 'ALLOWED IN DESIGNATED AREAS ONLY',
  smokingText: 'Smoking is',
  noiseRestrictions: 'Noise Restrictions',
  quietHours: 'Quiet Hours',
  additionalRestrictions: 'Additional Restrictions',
  standardNoiseRestrictions: 'Standard noise restrictions apply.',
  guestPolicy: 'Guest Policy',
  overnightGuests: 'Overnight guests are',
  maxStay: 'Maximum stay',
  unlimited: 'unlimited',
  nights: 'nights',
  noticeRequired: 'Notice required',
  yes: 'Yes',
  no: 'No',

  broker: 'Broker',
  contact: 'Contact',

  guarantors: 'Guarantors',

  paymentTerms: 'Payment Terms',
  paymentTermsText: 'Rent is due on the first day of each month. Late payments may incur additional fees as specified in local regulations.',
  securityDeposit: 'Security Deposit',
  securityDepositText: "A security deposit equivalent to one month's rent is required and will be held in accordance with local laws.",
  maintenanceAndRepairs: 'Maintenance and Repairs',
  maintenanceText: 'The landlord is responsible for maintaining the property in habitable condition. Tenants must report maintenance issues promptly.',
  termination: 'Termination',
  terminationText: 'Either party may terminate this lease with',

  signatureAgreementText: 'By signing below, all parties agree to the terms and conditions outlined in this lease agreement.',
  landlordSignature: 'Landlord Signature',
  tenantSignature: 'Tenant Signature',
  witnessSignature: 'Witness Signature',
  signedOn: 'Signed on',
  notSigned: 'Not signed',

  generatedElectronically: 'This lease agreement was generated electronically on',
  status: 'Status',
  contactText: 'For questions regarding this lease, please contact the landlord or property management company.',
};

export const somaliTranslations: LeaseTranslations = {
  title: 'HESHIISKA KIRADA GURIGA',
  leaseId: 'Lambarka Heshiiska',
  generatedOn: 'La sameeyay',

  partiesSection: 'DHINACYADA HESHIISKAN',
  propertySection: 'MACLUUMAADKA GURIGA',
  leaseTermsSection: 'SHURUUDAHA HESHIISKA',
  occupancySection: 'FAAHFAAHINTA DADKA DEGANAANAYA',
  utilitiesSection: 'ADEEGYADA IYO DAYACTIRKA',
  rulesSection: 'XEERARKA IYO NIDAAMYADA',
  brokerSection: 'MACLUUMAADKA DALLAALKA',
  guarantorsSection: 'DAMMAANADYADA',
  importantTermsSection: 'SHURUUDAHA MUHIIMKA AH',
  signaturesSection: 'SAXIIXYADA DHIJITAALKA AH',

  landlord: 'MILKIILAHA GURIGA',
  tenant: 'KIRAYSTA',
  name: 'Magaca',
  email: 'Emailka',
  phone: 'Telefoonka',
  address: 'Cinwaanka',
  dateOfBirth: 'Taariikhda Dhalashada',
  nationality: 'Jinsiyadda',

  propertyAddress: 'Cinwaanka Guriga',
  propertyType: 'Nooca Guriga',
  bedrooms: 'Qolalka Jiifka',
  bathrooms: 'Qolalka Musqulaha',
  squareFootage: 'Baaxadda',
  monthlyRent: 'Kirada Bishii',

  leaseStartDate: 'Taariikhda Bilawga Heshiiska',
  leaseEndDate: 'Taariikhda Dhammaadka Heshiiska',
  leaseDuration: 'Mudada Heshiiska',
  noticePeriod: 'Mudada Ogaysiinta',
  earlyTerminationFee: 'Lacagta Joojinta Hore',
  renewalOptions: 'Doorashada Cusboonaysiinta',
  available: 'Waa La Heli Karaa',
  notAvailable: 'Lama Heli Karo',
  months: 'bilo',
  days: 'maalmood',

  numberOfOccupants: 'Tirada Dadka Deganaanaya',
  occupantsText: 'Gurigan waxaa loo kiraystay',
  additionalOccupants: 'Dadka Dheeraadka Ah',
  petInformation: 'Macluumaadka Xayawaanka',
  age: 'Da\'da',

  utilitiesIncluded: 'Adeegyada Ku Jira',
  tenantResponsibilities: 'Mas\'uuliyadaha Kiraysta',
  noUtilitiesIncluded: 'Ma jiraan adeegyo ku jira kirada.',
  allUtilitiesIncluded: 'Dhammaan adeegyadu waxay ku jiraan kirada.',

  smokingPolicy: 'Xeerka Sigaarka',
  notAllowed: 'MA OGGOLA',
  allowed: 'WAA LA OGGOL YAHAY',
  designatedAreasOnly: 'WAA LA OGGOL YAHAY MEELAHA CAYIMAN KALIYA',
  smokingText: 'Sigaarku waa',
  noiseRestrictions: 'Xaddidaadka Qaylada',
  quietHours: 'Saacadaha Aamusnaanta',
  additionalRestrictions: 'Xaddidaad Dheeraad Ah',
  standardNoiseRestrictions: 'Xaddidaadka caadiga ah ee qaylada ayaa lagu dhaqmaa.',
  guestPolicy: 'Xeerka Martida',
  overnightGuests: 'Martida habeenka jooga',
  maxStay: 'Ugu badnaan joogista',
  unlimited: 'xaddi la\'aan',
  nights: 'habeen',
  noticeRequired: 'Ogoysiin loo baahan yahay',
  yes: 'Haa',
  no: 'Maya',

  broker: 'Dallaalka',
  contact: 'Xiriirka',

  guarantors: 'Dammaanadyada',

  paymentTerms: 'Shuruudaha Lacag Bixinta',
  paymentTermsText: 'Kirada waa in la bixiyaa maalinta koowaad ee bil kasta. Bixinta daahsan waxay keeni kartaa lacag dheeraad ah sida ku qoran xeerarka maxalliga ah.',
  securityDeposit: 'Amaanka Lacagta',
  securityDepositText: 'Lacagta ammaanka oo u dhiganta hal bil kirad ayaa loo baahan yahay waxaana lagu hayn doonaa sida waafaqsan sharciyada maxalliga ah.',
  maintenanceAndRepairs: 'Dayactirka iyo Hagaajinta',
  maintenanceText: 'Milkiilaha guriga ayaa mas\'uul ka ah inuu guriga ilaaliyol xaalad dadku ku noolaan karaan. Kiraysta waa inuu si dhakhso leh u sheegaa arrimo dayactir ah.',
  termination: 'Joojinta',
  terminationText: 'Labada dhinac midkood ayaa joojiyi kara heshiiskan iyagoo bixinaya',

  signatureAgreementText: 'Saxiixa hoosta ka, dhammaan dhinacyadu waxay ku heshiiyaan shuruudaha iyo xaaladaha ku qoran heshiiskan kirada.',
  landlordSignature: 'Saxiixa Milkiilaha Guriga',
  tenantSignature: 'Saxiixa Kiraysta',
  witnessSignature: 'Saxiixa Markhaatiga',
  signedOn: 'Lagu saxeexay',
  notSigned: 'Lama saxiixin',

  generatedElectronically: 'Heshiiskan kirada waxaa si elektaroonig ah loogu sameeyay',
  status: 'Xaalada',
  contactText: 'Su\'aalaha ku saabsan heshiiskan, fadlan la xiriir milkiilaha guriga ama shirkadda maamulka hantida.',
};

export const getTranslations = (language: 'en' | 'so'): LeaseTranslations => {
  return language === 'so' ? somaliTranslations : englishTranslations;
};


