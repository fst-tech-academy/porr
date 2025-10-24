import { Lease, Property, Tenant, Landlord, Broker, TenantGuarantor } from '../types';
import { getTranslations, LeaseTranslations } from './leaseTranslations';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export interface LeaseDocumentData {
  lease: Lease;
  property: Property;
  tenant: Tenant;
  landlord: Landlord;
  broker?: Broker;
  guarantors?: TenantGuarantor[];
}

export const generateLeaseDocumentHTML = (data: LeaseDocumentData, language: 'en' | 'so' = 'en'): string => {
  try {
    console.log('=== GENERATING LEASE DOCUMENT ===');
    console.log('Language parameter:', language);
    console.log('Language type:', typeof language);
  const { lease, property, tenant, landlord, broker, guarantors } = data;
    console.log('Lease digital signature data:', lease.digitalSignature);
    const t = getTranslations(language);
    console.log('Translations object:', t);
    console.log('Title (should be in selected language):', t.title);
    console.log('Landlord label:', t.landlord);
    console.log('Tenant label:', t.tenant);
    console.log('Parties section label:', t.partiesSection);
    console.log('=================================');
    
    console.log('Step 1: Defining formatDate function...');
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
    console.log('Step 1: formatDate function defined');

    console.log('Step 2: Defining formatCurrency function...');
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
    console.log('Step 2: formatCurrency function defined');

    console.log('Step 3: Defining getSignatureStatus function...');
  const getSignatureStatus = (signature: any) => {
    if (signature?.signed) {
        return `✓ ${t.signedOn} ${formatDate(signature.signedAt)}`;
      }
      return `☐ ${t.notSigned}`;
    };
    console.log('Step 3: getSignatureStatus function defined');

    console.log('Step 4: Defining getSignatureImage function...');
    const getSignatureImage = (signature: any) => {
      console.log('Checking signature:', signature);
      const signatureImage = signature?.signatureData || signature?.signatureUrl;
      if (signature?.signed && signatureImage) {
        console.log('Signature image found:', signatureImage ? 'Yes' : 'No');
        return `<img src="${signatureImage}" alt="Signature" style="max-width: 200px; max-height: 60px; margin: 10px auto; display: block;" />`;
      }
      console.log('No signature image data available');
      return '';
    };
    console.log('Step 4: getSignatureImage function defined');

    console.log('Step 5: About to generate HTML template...');
    
    // Validate data before generating template
    console.log('Validating data objects...');
    console.log('Lease:', lease);
    console.log('Property:', property);
    console.log('Tenant:', tenant);
    console.log('Landlord:', landlord);
    console.log('Broker:', broker);
    console.log('Guarantors:', guarantors);
    
    let htmlContent: string;
    try {
      console.log('Starting template string generation...');
      console.log('Creating header...');
      const header = `${t.title} - ${lease.leaseId}`;
      console.log('Header created:', header);
      console.log('Creating full HTML...');
      
      console.log('Creating full HTML template with safe property access...');
      htmlContent = `
<!DOCTYPE html>
<html lang="${language === 'so' ? 'so' : 'en'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${header}</title>
    <style>
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.8;
            max-width: 800px;
            margin: 0 auto;
            padding: 60px 50px 40px 50px;
            color: #000;
            background: white;
            box-sizing: border-box;
            font-size: 12px;
            min-height: 100vh;
        }
        .document-header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 30px;
            margin-bottom: 40px;
        }
        .document-header h1 {
            color: #000;
            font-size: 18px;
            margin: 0 0 15px 0;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .document-header h2 {
            color: #000;
            font-size: 16px;
            margin: 15px 0;
            font-weight: normal;
        }
        .document-header .lease-info {
            margin: 20px 0 0 0;
            font-size: 12px;
            color: #000;
        }
        .section {
            margin-bottom: 60px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .section-title {
            color: #000;
            font-weight: bold;
            font-size: 14px;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 1px solid #000;
            padding-bottom: 10px;
        }
        .subsection-title {
            color: #000;
            font-weight: bold;
            font-size: 16px;
            margin: 30px 0 20px 0;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .party-info {
            display: block;
            margin-bottom: 50px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .party {
            margin-bottom: 40px;
            padding: 0;
            border: none;
            background: none;
            box-shadow: none;
        }
        .party h3 {
            margin: 0 0 20px 0;
            color: #000;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .party p {
            margin: 12px 0;
            font-size: 12px;
            line-height: 1.6;
        }
        .property-details {
            background: none;
            border: none;
            padding: 0;
            margin-bottom: 50px;
        }
        .property-details h3 {
            margin: 0 0 20px 0;
            color: #000;
            font-size: 14px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .property-details p {
            margin: 12px 0;
            font-size: 12px;
            line-height: 1.6;
        }
        .clause {
            margin-bottom: 40px;
            border: none;
            background: none;
            box-shadow: none;
        }
        .clause-title {
            background: none;
            padding: 0;
            font-weight: bold;
            border: none;
            color: #000;
            font-size: 14px;
            margin-bottom: 15px;
        }
        .clause-content {
            padding: 0;
            line-height: 1.6;
            color: #000;
            font-size: 12px;
            margin-bottom: 25px;
        }
        .clause-content ul {
            margin: 20px 0;
            padding-left: 30px;
        }
        .clause-content li {
            margin-bottom: 12px;
        }
        .legal-provisions {
            background: none;
            border: none;
            padding: 0;
            margin: 60px 0;
        }
        .legal-provisions h3 {
            color: #000;
            font-size: 18px;
            margin: 0 0 30px 0;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 1px;
            border-bottom: 2px solid #000;
            padding-bottom: 15px;
        }
        .signature-section {
            margin-top: 50px;
            border-top: 1px solid #000;
            padding-top: 20px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .signature-grid {
            display: block;
            margin-top: 20px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .signature-item {
            text-align: left;
            border: none;
            padding: 0;
            background: none;
            box-shadow: none;
            min-height: auto;
            margin-bottom: 30px;
            page-break-inside: avoid;
            break-inside: avoid;
        }
        .signature-item h4 {
            margin: 0 0 10px 0;
            color: #000;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .signature-status {
            margin-top: 15px;
            padding: 0;
            border: none;
            font-weight: normal;
            font-size: 12px;
            color: #000;
        }
        .signature-status.signed {
            background: none;
            color: #000;
            border: none;
        }
        .signature-status.unsigned {
            background: none;
            color: #000;
            border: none;
        }
        .signature-line {
            border-bottom: 1px solid #000;
            margin: 15px 0;
            height: 30px;
        }
        .footer {
            margin-top: 80px;
            padding-top: 30px;
            border-top: 1px solid #000;
            font-size: 12px;
            color: #000;
            text-align: left;
            line-height: 1.5;
        }
        .footer p {
            margin: 12px 0;
        }
        .highlight {
            background: none;
            padding: 0;
            font-weight: bold;
        }
        .notary-section {
            background: none;
            border: none;
            padding: 0;
            margin-top: 60px;
        }
        .notary-section h3 {
            color: #000;
            font-size: 14px;
            margin: 0 0 20px 0;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        .page-break {
            page-break-before: always;
            break-before: always;
        }
        @media print {
            body { 
                margin: 0; 
                padding: 50px; 
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .no-print { display: none; }
            .section, .signature-section, .signature-item, .party-info {
                page-break-inside: avoid !important;
                break-inside: avoid !important;
            }
        }
    </style>
</head>
<body>
    <div class="document-header">
        <h1>${language === 'so' ? 'HEERKA KIRAYGA' : 'LEASE AGREEMENT'}</h1>
        <h2>${language === 'so' ? 'LAMBARKA HEERKA KIRAYGA' : 'LEASE AGREEMENT NUMBER'}: ${lease.leaseId}</h2>
        <div class="lease-info">
            <p><strong>${language === 'so' ? 'TARIIKHDA LA SAXAY' : 'DATE OF EXECUTION'}:</strong> ${formatDate(new Date().toISOString())}</p>
            <p><strong>${language === 'so' ? 'TARIIKHDA BILAABANTA' : 'EFFECTIVE DATE'}:</strong> ${formatDate(lease?.leaseTerms?.startDate || new Date().toISOString())}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">${language === 'so' ? 'QAYBTAAN HEERKA' : 'PARTIES TO THIS AGREEMENT'}</div>
        <div class="party-info">
            <div class="party">
                <h3>${language === 'so' ? 'MULKIYAHAA/GURIGA LEH' : 'LANDLORD/HOMEOWNER'}</h3>
                <p><strong>${language === 'so' ? 'Magaca Buuxa' : 'Full Name'}:</strong> ${landlord?.personalInfo?.firstName || 'N/A'} ${landlord?.personalInfo?.lastName || 'N/A'}</p>
                <p><strong>${language === 'so' ? 'Cinwaanka' : 'Address'}:</strong> ${landlord?.contactInfo?.address?.street || 'N/A'}, ${landlord?.contactInfo?.address?.city || 'N/A'}, ${landlord?.contactInfo?.address?.state || 'N/A'} ${landlord?.contactInfo?.address?.postalCode || 'N/A'}</p>
                <p><strong>${language === 'so' ? 'Telefoonka' : 'Phone'}:</strong> ${landlord?.contactInfo?.phone || 'N/A'}</p>
                <p><strong>${language === 'so' ? 'Iimeylka' : 'Email'}:</strong> ${landlord?.contactInfo?.email || 'N/A'}</p>
            </div>
            
            <div class="party">
                <h3>${language === 'so' ? 'KIRAYAHA' : 'TENANT/RENTER'}</h3>
                <p><strong>${language === 'so' ? 'Magaca Buuxa' : 'Full Name'}:</strong> ${tenant?.personalInfo?.firstName || 'N/A'} ${tenant?.personalInfo?.lastName || 'N/A'}</p>
                <p><strong>${language === 'so' ? 'Cinwaanka' : 'Address'}:</strong> ${tenant?.contactInfo?.address?.street || 'N/A'}, ${tenant?.contactInfo?.address?.city || 'N/A'}, ${tenant?.contactInfo?.address?.state || 'N/A'} ${tenant?.contactInfo?.address?.postalCode || 'N/A'}</p>
                <p><strong>${language === 'so' ? 'Telefoonka' : 'Phone'}:</strong> ${tenant?.contactInfo?.phone || 'N/A'}</p>
                <p><strong>${language === 'so' ? 'Iimeylka' : 'Email'}:</strong> ${tenant?.contactInfo?.email || 'N/A'}</p>
                <p><strong>${language === 'so' ? 'Tariikhda Dhalashada' : 'Date of Birth'}:</strong> ${formatDate(tenant?.personalInfo?.dateOfBirth || new Date().toISOString())}</p>
                <p><strong>${language === 'so' ? 'Jinsiyadda' : 'Nationality'}:</strong> ${tenant?.personalInfo?.nationality || 'N/A'}</p>
            </div>
        </div>
    </div>

    <div class="section">
        <div class="section-title">${language === 'so' ? 'MACLUUMAADKA HANTIDA' : 'PROPERTY INFORMATION'}</div>
        <div class="property-details">
            <h3>${language === 'so' ? 'CINWAANKA HANTIDA KIRAYGA' : 'RENTAL PROPERTY ADDRESS'}</h3>
            <p><strong>${language === 'so' ? 'Cinwaanka Hantida' : 'Property Address'}:</strong> ${property?.address?.street || 'N/A'}, ${property?.address?.city || 'N/A'}, ${property?.address?.state || 'N/A'} ${property?.address?.postalCode || 'N/A'}</p>
            <p><strong>${language === 'so' ? 'Nooca Hantida' : 'Property Type'}:</strong> ${property?.propertyType || 'N/A'}</p>
            <p><strong>${language === 'so' ? 'Qolalka Hurdo' : 'Bedrooms'}:</strong> ${property?.bedrooms || 'N/A'}</p>
            <p><strong>${language === 'so' ? 'Musqulaha' : 'Bathrooms'}:</strong> ${property?.bathrooms || 'N/A'}</p>
            <p><strong>${language === 'so' ? 'Meelaha' : 'Square Footage'}:</strong> ${property?.squareFootage || 'N/A'} sq ft</p>
            <p><strong>${language === 'so' ? 'Kirayga Bishii' : 'Monthly Rent'}:</strong> ${formatCurrency(property?.monthlyRent || 0)}</p>
        </div>
    </div>

    <div class="section">
        <div class="section-title">${language === 'so' ? 'SHURUUDDA IYO SHARTAANTA KIRAYGA' : 'LEASE TERMS AND CONDITIONS'}</div>
        
        <div class="subsection-title">1. ${language === 'so' ? 'MUDDADA KIRAYGA' : 'RENTAL TERM'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>Lease Duration:</strong> Monthly basis commencing on ${formatDate(lease?.leaseTerms?.startDate || new Date().toISOString())}</p>
                <p><strong>Initial Term:</strong> One (1) year from the date of signing</p>
                <p><strong>Renewal:</strong> This agreement will NOT automatically renew for a new term</p>
                <p><strong>Proration:</strong> First month's rent will be prorated if the agreement starts partway through the month</p>
                <p><strong>Monthly Terms:</strong> Subsequent monthly terms begin on the first day of each month</p>
            </div>
        </div>

        <div class="subsection-title">2. ${language === 'so' ? 'KIRAYGA IYO SHURUUDDA LACAGTA' : 'RENT AND PAYMENT TERMS'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>${language === 'so' ? 'Kirayga Bishii' : 'Monthly Rent'}:</strong> ${formatCurrency(property?.monthlyRent || 0)} ${language === 'so' ? 'bishii' : 'per month'}</p>
                <p><strong>${language === 'so' ? 'Tariikhda Lacagta' : 'Due Date'}:</strong> ${language === 'so' ? 'Kirayga waa inuu baxaa 1da bishii ama ka hor' : 'Rent is due on or before the 1st day of each month'}</p>
                <p><strong>${language === 'so' ? 'Lacagta Dheeraadka' : 'Late Fee'}:</strong> $50.00 ${language === 'so' ? 'haddii kirayga la helo ka dib 5da bishii' : 'if rent is received after the 5th day of the month'}</p>
                <p><strong>${language === 'so' ? 'Habka Lacag Bixinta' : 'Payment Methods'}:</strong> ${language === 'so' ? 'Wareegid bangiga, sheeg, ama lacag cad' : 'Bank transfer, check, or cash'}</p>
                <p><strong>${language === 'so' ? 'Lacagta Sheegga La Celiyay' : 'Returned Check Fee'}:</strong> $25.00</p>
            </div>
        </div>

        <div class="subsection-title">3. ${language === 'so' ? 'LACAGTA AMAANTA' : 'SECURITY DEPOSIT'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>${language === 'so' ? 'Qadarka Lacagta Amaanta' : 'Security Deposit Amount'}:</strong> ${formatCurrency((property?.monthlyRent || 0) * 1.5)}</p>
                <p><strong>${language === 'so' ? 'Tariikhda Lacagta' : 'Due Date'}:</strong> ${language === 'so' ? 'Lacagta amaanta waa inay la gudbiso maalinta la saxiinayo Heerkan' : 'Security deposit must be submitted on the day of signing this Agreement'}</p>
                <p><strong>${language === 'so' ? 'Ujeedada' : 'Purpose'}:</strong> ${language === 'so' ? 'Lacagta amaanta waxaa loo hayaa si loo xaqiijiyo in kirayaha uu si wanaagsan u fuliyo Heerkan' : 'Security deposit is held for the tenant\'s faithful performance of this Agreement'}</p>
                <p><strong>${language === 'so' ? 'Waqtiga Celinta' : 'Return Timeline'}:</strong> ${language === 'so' ? 'Lacagta amaanta waxaa la celin doonaa kirayaha 30 maalmood ka dib joojinta Heerkan, ka yar wax kasta oo la jareeyo khasaaraha, kiray la bixin, ama lacago kale' : 'Security deposit will be returned to the tenant within 30 days after termination of this Agreement, less any deductions for damages, unpaid rent, or other charges'}</p>
                <p><strong>${language === 'so' ? 'Faaiido' : 'Interest'}:</strong> ${language === 'so' ? 'Lacagta amaanta ma heli faaiido' : 'Security deposit does not accrue interest'}</p>
            </div>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="subsection-title">4. ${language === 'so' ? 'ADEEGYADA IYO KHIDMADA' : 'UTILITIES AND SERVICES'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>${language === 'so' ? 'Adeegyada La Jira' : 'Utilities Included'}:</strong> ${language === 'so' ? 'Biye, ururinta qashinka, dayactirka aasaasiga ah' : 'Water, garbage collection, basic maintenance'}</p>
                <p><strong>${language === 'so' ? 'Adeegyada La Jirin' : 'Utilities Not Included'}:</strong> ${language === 'so' ? 'Korontada, internet, TV cable' : 'Electricity, internet, cable TV'}</p>
                <p><strong>${language === 'so' ? 'Internet/Cable' : 'Internet/Cable'}:</strong> ${language === 'so' ? 'Kirayaha wuxuu mas\'uul ka yahay deynta iyo lacag bixinta' : 'Tenant responsible for setup and payment'}</p>
                <p><strong>${language === 'so' ? 'Ururinta Qashinka' : 'Trash Collection'}:</strong> ${language === 'so' ? 'Waxaa ku jira kirayga' : 'Included in rent'}</p>
            </div>
        </div>

        <div class="subsection-title">5. ${language === 'so' ? 'DEGGANAANSHA IYO ISTICMAALKA' : 'OCCUPANCY AND USE'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>${language === 'so' ? 'Tirada Ugu Badan' : 'Maximum Occupancy'}:</strong> ${language === 'so' ? '1 qof' : '1 person'}</p>
                <p><strong>${language === 'so' ? 'Guriga Ugu Hore' : 'Primary Residence'}:</strong> ${language === 'so' ? 'Qolkan waa inuu loo isticmaalaa kaliya inuu noqdo guriga ugu hore ee kirayaha' : 'This room shall be used as tenant\'s primary residence only'}</p>
                <p><strong>${language === 'so' ? 'Isticmaalka La Mamnuuc' : 'Prohibited Uses'}:</strong> ${language === 'so' ? 'Ma jiraan isticmaalka ganacsiga, kiray kale, ama siin kale oo aan qoraal ahayn' : 'No commercial use, subletting, or assignment without written consent'}</p>
                <p><strong>${language === 'so' ? 'Martida' : 'Guests'}:</strong> ${language === 'so' ? 'Martida habeenka waa inay noqdaan 3 habeen oo isku xigta' : 'Overnight guests limited to 3 consecutive nights'}</p>
            </div>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="subsection-title">6. ${language === 'so' ? 'DAYACTIRKA IYO WAX LAGU CELIYO' : 'MAINTENANCE AND REPAIRS'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>${language === 'so' ? 'Mas\'uuliyadda Kirayaha' : 'Tenant Responsibilities'}:</strong> ${language === 'so' ? 'Qolka nadiif ah, soo sheeg dhibaatooyinka dayactirka si degdeg ah, nadiifinta yar iyo ilaalinta' : 'Keep room clean, report maintenance issues promptly, minor cleaning and upkeep'}</p>
                <p><strong>${language === 'so' ? 'Mas\'uuliyadda Mulkiyaha' : 'Landlord Responsibilities'}:</strong> ${language === 'so' ? 'Dayactirka weyn, dayactirka qaabka, dayactirka aaladaha, dayactirka meelaha guud' : 'Major repairs, structural maintenance, appliance repairs, common area maintenance'}</p>
                <p><strong>${language === 'so' ? 'Soo Sheeg' : 'Reporting'}:</strong> ${language === 'so' ? 'Dhammaan codsiga dayactirka waa inuu la gudbiyaa qoraal' : 'All maintenance requests must be submitted in writing'}</p>
                <p><strong>${language === 'so' ? 'Dayactirka Degdegga' : 'Emergency Repairs'}:</strong> ${language === 'so' ? 'La soo xidhiidh mulkiyaha si degdeg ah dhibaatooyinka degdegga ah' : 'Contact landlord immediately for urgent issues'}</p>
            </div>
        </div>

        <div class="subsection-title">7. ${language === 'so' ? 'GELITAANKA HANTIDA' : 'PROPERTY ACCESS'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>${language === 'so' ? 'Gelitaanka Mulkiyaha' : 'Landlord Access'}:</strong> ${language === 'so' ? 'Mulkiyaha wuu geli karaa meelaha 24 saac oo qoraal ah ka hor:' : 'Landlord may enter the premises with 24-hour written notice for:'}</p>
                <ul>
                    <li>${language === 'so' ? 'Dayactirka iyo ilaalinta' : 'Repairs and maintenance'}</li>
                    <li>${language === 'so' ? 'Baaritaanka hantida' : 'Property inspections'}</li>
                    <li>${language === 'so' ? 'Tusitaanka kirayayaasha la filayo' : 'Showing to prospective tenants'}</li>
                </ul>
                <p><strong>${language === 'so' ? 'Gelitaanka Degdegga' : 'Emergency Access'}:</strong> ${language === 'so' ? 'Mulkiyaha wuu geli karaa aan digniin lahayn haddii ay jirto dhibaato degdegga' : 'Landlord may enter without notice in case of emergency'}</p>
            </div>
        </div>

        <div class="subsection-title">8. ${language === 'so' ? 'XAYAWANADA IYO DUNAYADA' : 'PETS AND ANIMALS'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>${language === 'so' ? 'Siyaasadda Xayawanka' : 'Pet Policy'}:</strong> ${language === 'so' ? 'Ma jiraan xayawaan la ogol yahay oo aan qoraal ahayn' : 'No pets allowed without written permission'}</p>
                <p><strong>${language === 'so' ? 'Lacagta Xayawanka' : 'Pet Deposit'}:</strong> $200.00 ${language === 'so' ? 'haddii xayawanka la ogol yahay' : 'if pets are approved'}</p>
                <p><strong>${language === 'so' ? 'Xaydinta Xayawanka' : 'Pet Restrictions'}:</strong> ${language === 'so' ? 'Waa inay noqdaan kuwo guriga la dhaqan, talaalka hadda jira ayaa loo baahan yahay' : 'Must be housebroken, current vaccinations required'}</p>
            </div>
        </div>

        <div class="subsection-title">9. ${language === 'so' ? 'KAFILKA' : 'INSURANCE'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>${language === 'so' ? 'Kafilkada Kirayaha' : 'Tenant Insurance'}:</strong> ${language === 'so' ? 'Kirayaha waa la dhiiri geliyaa inuu helo kafilkada kirayaha' : 'Tenant is encouraged to obtain renter\'s insurance'}</p>
                <p><strong>${language === 'so' ? 'Kafilkada Mulkiyaha' : 'Landlord Insurance'}:</strong> ${language === 'so' ? 'Mulkiyaha wuxuu ilaaliyaa kafilkada hantida kaliya' : 'Landlord maintains property insurance only'}</p>
                <p><strong>${language === 'so' ? 'Mas\'uuliyadda' : 'Liability'}:</strong> ${language === 'so' ? 'Qayb kasta waa mas\'uul ka tahay mas\'uuliyadeeda' : 'Each party responsible for their own liability'}</p>
            </div>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="section">
        <div class="subsection-title">10. ${language === 'so' ? 'RAXAYNTA IYO DADKA' : 'QUIET ENJOYMENT'}</div>
        <div class="clause">
            <div class="clause-content">
                <p><strong>${language === 'so' ? 'Xaydinta Codka' : 'Noise Restrictions'}:</strong> ${language === 'so' ? 'Saacadaha aamiga 10 PM ilaa 7 AM' : 'Quiet hours 10 PM to 7 AM'}</p>
                <p><strong>${language === 'so' ? 'Nololka Ixtiraamka' : 'Respectful Living'}:</strong> ${language === 'so' ? 'Dhammaan qaybtaan waxay ku heshiiyaan inay ilaaliyaan deegaan nolol ixtiraam leh' : 'All parties agree to maintain a respectful living environment'}</p>
                <p><strong>${language === 'so' ? 'Xalinta Khilaafaadka' : 'Dispute Resolution'}:</strong> ${language === 'so' ? 'Dhibaatooyinka waa inay la hadlaan oo la xaliyaan si wanaagsan' : 'Issues should be discussed and resolved amicably'}</p>
            </div>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="legal-provisions">
        <h3>${language === 'so' ? 'QODOBADA SHARCI' : 'LEGAL PROVISIONS'}</h3>
        
        <div class="subsection-title">11. ${language === 'so' ? 'JOOJINTA IYO LA\'AANTA SHARTAANTA' : 'TERMINATION AND NON-COMPLIANCE'}</div>
        <div class="clause">
            <div class="clause-content">
                <p>${language === 'so' ? 'Haddii la fulin shuruudaha Heerkan, qayb kasta waa inay heli karto inay joojiyo Heerkan haddii qaybta dhibaatada leh ay ku guulaysato inay xaliyaan la\'aanta shartaanta 30 maalmood ka dib dhacdada.' : 'In case of not complying with the terms of this Agreement, either party will be entitled to terminate this Agreement in case the party at fault fails to resolve the non-compliance within 30 days after its occurrence.'}</p>
            </div>
        </div>

        <div class="subsection-title">12. ${language === 'so' ? 'XALINTA KHILAFAADKA' : 'DISPUTE RESOLUTION'}</div>
        <div class="clause">
            <div class="clause-content">
                <p>${language === 'so' ? 'Khilaafaad kasta iyo/ama farqi ka soo baxa ama ku xidhiidha Heerkan waxaa la gudbin doonaa dhexdhexaadnimo sida iyo hoos yimaada sharciga gobolka hantida ku jirto.' : 'Any dispute and/or difference arising out of or related to this Agreement will be submitted to mediation according to, and subject to the laws of the jurisdiction where the property is located.'}</p>
            </div>
        </div>

        <div class="subsection-title">13. ${language === 'so' ? 'SHARCIKA HAYSTA' : 'GOVERNING LAW'}</div>
        <div class="clause">
            <div class="clause-content">
                <p>${language === 'so' ? 'Heerkan waxaa loo hayn doonaa oo loo qeexi doonaa sida sharciga gobolka hantida ku jirto.' : 'This Agreement will be governed by and construed according to the laws of the state where the property is located.'}</p>
            </div>
        </div>

        <div class="subsection-title">14. ${language === 'so' ? 'HEERKA BUUXA' : 'ENTIRE AGREEMENT'}</div>
        <div class="clause">
            <div class="clause-content">
                <p>${language === 'so' ? 'Heerkan waa buuxa oo ku saabsan mawduuca ku jira, wuxuu ka sarreeyaa dhammaan iyo wax kasta oo heer hore, fahamka, iyo shuruudaha, la muujiyay ama la fahmay, qoraal ama af, nooc kasta oo ku saabsan mawduuca ku jira. Shuruudaha la muujiyay waa ay haystaan oo ka sarreeyaan hab kasta oo fulinta iyo/ama isticmaalka ganacsiga oo aan u haboonayn shuruudaha ku jira.' : 'This Agreement is complete and with respect to the subject matter herein, supersedes all and any prior agreements, understandings, and conditions, expressed or implied, written or oral, of any nature with respect to the subject matter herein. The expressed terms control and supersede any course of performance and/or usage of the trade inconsistent with any of the terms herein.'}</p>
            </div>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="legal-provisions">
        <div class="subsection-title">15. ${language === 'so' ? 'KALA JOOJINTA' : 'SEVERABILITY'}</div>
        <div class="clause">
            <div class="clause-content">
                <p>${language === 'so' ? 'Haddii qodob ka mid ah Heerkan la helo inuu ahaa baabac ama/ama aan la fulin karin maxkamad awood u leh, qodobada hadhay waxay sii wadi doonaan in la fuliyo.' : 'In an event where a provision of this Agreement is found to be void and/or unenforceable by a court of competent jurisdiction, then the provisions remaining will continue to be enforced.'}</p>
            </div>
        </div>

        <div class="subsection-title">16. ${language === 'so' ? 'WAX LAGU BEDDELO' : 'AMENDMENTS'}</div>
        <div class="clause">
            <div class="clause-content">
                <p>${language === 'so' ? 'Qaybtaan waxay ku heshiiyaan in wax kasta oo lagu beddelo Heerkan waa inuu noqdaa qoraal oo ay saxiinayaan dhammaan Qaybtaan Heerkan. Sidaas darteed, wax kasta oo Qaybtaan ku beddelan waxaa la adeegi doonaa Heerkan.' : 'The Parties agree that any amendments made to this Agreement must be in writing where they must be signed by both Parties to this Agreement. As such, any amendments made by the Parties will be applied to this Agreement.'}</p>
            </div>
        </div>

        <div class="subsection-title">17. ${language === 'so' ? 'DIGNIINTA' : 'NOTICES'}</div>
        <div class="clause">
            <div class="clause-content">
                <p>${language === 'so' ? 'Dhammaan digniinta loo baahan yahay Heerkan waa inay noqdaan qoraal oo la gaadhsiin doonaa cinwaanka kor ku xusan. Digniinta waxaa la gaadhsiin karaa si gaarka ah, boostada xaqiijis leh, warqad celinta la codsado, ama iimeyl.' : 'All notices required under this Agreement must be in writing and delivered to the addresses listed above. Notices may be delivered by personal delivery, certified mail, return receipt requested, or email.'}</p>
            </div>
        </div>
    </div>

    <div class="page-break"></div>

    <div class="signature-section">
        <div class="section-title">${language === 'so' ? 'SAXDA IYO FULINTA' : 'SIGNATURES AND EXECUTION'}</div>
        <p style="margin-bottom: 60px; font-size: 12px;">${language === 'so' ? 'Qaybtaan waxay ku heshiiyaan shuruudaha iyo shartaanta lagu qoray Heerkan waxaana lagu caddeeyaa saxda hoos ku qoran:' : 'The Parties hereby agree to the terms and conditions set forth in this Agreement and such is demonstrated throughout their signatures below:'}</p>
        
        <div class="signature-grid">
            <div class="signature-item">
                <h4>${language === 'so' ? 'SAXDA MULKIYAHA' : 'LANDLORD SIGNATURE'}</h4>
                ${getSignatureImage(lease?.digitalSignature?.landlordSignature)}
                <div class="signature-line"></div>
                <p style="font-size: 12px; margin: 10px 0;"><strong>${language === 'so' ? 'Magaca' : 'Name'}:</strong> ${landlord?.personalInfo?.firstName || 'N/A'} ${landlord?.personalInfo?.lastName || 'N/A'}</p>
                <p style="font-size: 12px; margin: 10px 0;"><strong>${language === 'so' ? 'Tariikhda' : 'Date'}:</strong> ${lease?.digitalSignature?.landlordSignature?.signed ? formatDate(lease.digitalSignature.landlordSignature.signedAt) : '_____________'}</p>
                <div class="signature-status ${lease?.digitalSignature?.landlordSignature?.signed ? 'signed' : 'unsigned'}">
                    ${getSignatureStatus(lease?.digitalSignature?.landlordSignature)}
                </div>
            </div>
            
            <div class="signature-item">
                <h4>${language === 'so' ? 'SAXDA KIRAYAHA' : 'TENANT SIGNATURE'}</h4>
                ${getSignatureImage(lease?.digitalSignature?.tenantSignature)}
                <div class="signature-line"></div>
                <p style="font-size: 12px; margin: 10px 0;"><strong>${language === 'so' ? 'Magaca' : 'Name'}:</strong> ${tenant?.personalInfo?.firstName || 'N/A'} ${tenant?.personalInfo?.lastName || 'N/A'}</p>
                <p style="font-size: 12px; margin: 10px 0;"><strong>${language === 'so' ? 'Tariikhda' : 'Date'}:</strong> ${lease?.digitalSignature?.tenantSignature?.signed ? formatDate(lease.digitalSignature.tenantSignature.signedAt) : '_____________'}</p>
                <div class="signature-status ${lease?.digitalSignature?.tenantSignature?.signed ? 'signed' : 'unsigned'}">
                    ${getSignatureStatus(lease?.digitalSignature?.tenantSignature)}
                </div>
            </div>
            
            ${broker ? `
            <div class="signature-item">
                <h4>${language === 'so' ? 'SAXDA DILAAYAHA' : 'BROKER SIGNATURE'}</h4>
                ${getSignatureImage(lease?.digitalSignature?.brokerSignature)}
                <div class="signature-line"></div>
                <p style="font-size: 12px; margin: 10px 0;"><strong>${language === 'so' ? 'Magaca' : 'Name'}:</strong> ${broker?.personalInfo?.firstName || 'N/A'} ${broker?.personalInfo?.lastName || 'N/A'}</p>
                <p style="font-size: 12px; margin: 10px 0;"><strong>${language === 'so' ? 'Tariikhda' : 'Date'}:</strong> ${lease?.digitalSignature?.brokerSignature?.signed ? formatDate(lease.digitalSignature.brokerSignature.signedAt) : '_____________'}</p>
                <div class="signature-status ${lease?.digitalSignature?.brokerSignature?.signed ? 'signed' : 'unsigned'}">
                    ${getSignatureStatus(lease?.digitalSignature?.brokerSignature)}
                </div>
            </div>
            ` : ''}
            
            ${guarantors && guarantors.length > 0 ? `
            <div class="signature-item">
                <h4>${language === 'so' ? 'SAXDA KAFILKA' : 'GUARANTOR SIGNATURE'}</h4>
                ${getSignatureImage(lease?.digitalSignature?.guarantorSignature)}
                <div class="signature-line"></div>
                <p style="font-size: 12px; margin: 10px 0;"><strong>${language === 'so' ? 'Magaca' : 'Name'}:</strong> ${guarantors[0]?.personalInfo?.firstName || 'N/A'} ${guarantors[0]?.personalInfo?.lastName || 'N/A'}</p>
                <p style="font-size: 12px; margin: 10px 0;"><strong>${language === 'so' ? 'Tariikhda' : 'Date'}:</strong> ${lease?.digitalSignature?.guarantorSignature?.signed ? formatDate(lease.digitalSignature.guarantorSignature.signedAt) : '_____________'}</p>
                <div class="signature-status ${lease?.digitalSignature?.guarantorSignature?.signed ? 'signed' : 'unsigned'}">
                    ${getSignatureStatus(lease?.digitalSignature?.guarantorSignature)}
                </div>
            </div>
            ` : ''}
        </div>
    </div>

    <div class="page-break"></div>

    <div class="notary-section">
        <h3>${language === 'so' ? 'XAQIIJINTA NOTARY (Haddii ay Dalka Sharciga u Baahdo)' : 'NOTARY ACKNOWLEDGMENT (If Required by State Law)'}</h3>
        <p style="font-size: 12px; margin: 10px 0;">${language === 'so' ? 'Gobolka _____________)' : 'State of _______________)'}</p>
        <p style="font-size: 12px; margin: 10px 0;">${language === 'so' ? 'Degmada _____________)' : 'County of _____________)'}</p>
        <p style="font-size: 12px; margin: 10px 0;">${language === 'so' ? 'Maanta _____ ee _______________, 20__, hortayda ahaan waxay soo baxeen qaybtaan kor ku xusan, aniga oo og inay yihiin dadka magacyadooda ku qoran qoraalka hore, waxayna xaqiijinayeen inay fuliyeen ujeedada ku jirta.' : 'On this _____ day of _______________, 20__, before me personally appeared the above-named parties, known to me to be the persons whose names are subscribed to the foregoing instrument, and acknowledged that they executed the same for the purposes therein contained.'}</p>
        <div style="margin-top: 20px;">
            <p style="font-size: 12px; margin: 8px 0;">_________________________________</p>
            <p style="font-size: 12px; margin: 8px 0;">${language === 'so' ? 'Notary Gaarka ah' : 'Notary Public'}</p>
            <p style="font-size: 12px; margin: 8px 0;">${language === 'so' ? 'Amarkayga wuu dhamaadaa: _______________' : 'My Commission Expires: _______________'}</p>
        </div>
    </div>

    <div class="footer">
        <p><strong>${language === 'so' ? 'QORAALKA DIYAARINAY' : 'DOCUMENT PREPARED BY'}:</strong> ${language === 'so' ? 'Nidaamka Maamulka Kirayga' : 'Lease Management System'}</p>
        <p><strong>${language === 'so' ? 'TARIIKHDA DIYAARINTA' : 'DATE PREPARED'}:</strong> ${formatDate(new Date().toISOString())}</p>
        <p><strong>${language === 'so' ? 'NOOCA' : 'VERSION'}:</strong> 2.0</p>
        <p style="margin-top: 15px; font-style: italic;">${language === 'so' ? 'Heerkan kirayga waa qoraal sharci ahaan xidhiidhiya. Dhammaan qaybtaan waxaa loo talagalay inay si taxaddar leh u eegaan shuruudaha oo ay la tashadaan la taliyayaasha sharci haddii ay u baahdo ka hor inta aysan saxiin.' : 'This lease agreement is a legally binding document. All parties are advised to review the terms carefully and consult with legal counsel if necessary before signing.'}</p>
    </div>
</body>
</html>
  `;
      console.log('Template string created successfully');
    } catch (templateError) {
      console.error('ERROR generating template string:', templateError);
      console.error('Template error details:', templateError instanceof Error ? templateError.message : String(templateError));
      throw templateError;
    }
  
    console.log('HTML template generated successfully');
    console.log('HTML length:', htmlContent.length);
    console.log('HTML preview (first 500 chars):', htmlContent.substring(0, 500));
  
    return htmlContent;
  } catch (error) {
    console.error('ERROR in generateLeaseDocumentHTML:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export const generateLeaseDocumentPDF = async (data: LeaseDocumentData, language: 'en' | 'so' = 'en'): Promise<Blob> => {
  console.log('=== GENERATING PDF ===');
  console.log('Language:', language);
  
  // Create a temporary div element to render the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = generateLeaseDocumentHTML(data, language);
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '-9999px';
  tempDiv.style.width = '700px';
  tempDiv.style.backgroundColor = 'white';
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.overflow = 'visible';
  document.body.appendChild(tempDiv);
    
    try {
      console.log('Rendering HTML to canvas...');
      console.log('Temp div dimensions:', tempDiv.offsetWidth, 'x', tempDiv.offsetHeight);
      console.log('Temp div scroll height:', tempDiv.scrollHeight);
      
      // Wait for fonts and images to load
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: true, // Enable logging to debug
        allowTaint: true, // Allow tainted canvas for signatures
        foreignObjectRendering: false // Disable this as it can cause issues
      });
    
    console.log('Canvas created, size:', canvas.width, 'x', canvas.height);
    
    // Debug: Log canvas data URL (first 100 chars)
    const canvasDataUrl = canvas.toDataURL('image/png');
    console.log('Canvas data URL preview:', canvasDataUrl.substring(0, 100) + '...');
    
    // Check if canvas is blank
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let isBlank = true;
    
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] !== 255 || data[i + 1] !== 255 || data[i + 2] !== 255) {
        isBlank = false;
        break;
      }
    }
    
    if (isBlank) {
      console.warn('Canvas appears to be blank, trying fallback method...');
      // Try a simpler approach
      const fallbackCanvas = await html2canvas(tempDiv, {
        scale: 1,
        backgroundColor: '#ffffff'
      });
      console.log('Fallback canvas created, size:', fallbackCanvas.width, 'x', fallbackCanvas.height);
      canvas.width = fallbackCanvas.width;
      canvas.height = fallbackCanvas.height;
      ctx.drawImage(fallbackCanvas, 0, 0);
    }
    
    // Create PDF with margins
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const marginTop = 15; // 15mm top margin to prevent cutoff
    const marginBottom = 15; // 15mm bottom margin to prevent cutoff
    const marginSide = 15; // 15mm side margins
    const contentWidth = pageWidth - (2 * marginSide); // Available width for content
    const contentHeight = pageHeight - marginTop - marginBottom; // Available height for content
    
    const imgWidth = contentWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
    console.log('PDF content dimensions:', imgWidth, 'x', imgHeight);
    console.log('Available page height:', contentHeight);
    console.log('Content fits on single page?', imgHeight <= contentHeight);
    
    // Create multi-page PDF - split content across multiple pages
    console.log('Creating multi-page PDF');
    
    let yPosition = 0;
    let pageNumber = 1;
    
    while (yPosition < imgHeight) {
      // Add new page for each section
      if (pageNumber > 1) {
        pdf.addPage();
      }
      
      // Calculate how much content fits on this page
      const remainingHeight = imgHeight - yPosition;
      const contentForThisPage = Math.min(remainingHeight, contentHeight);
      
      // Create a new canvas for this page
      const pageCanvas = document.createElement('canvas');
      const pageCtx = pageCanvas.getContext('2d');
      pageCanvas.width = canvas.width;
      pageCanvas.height = Math.min(contentForThisPage * (canvas.width / imgWidth), canvas.height);
      
      if (pageCtx) {
        // Draw the portion of the original canvas for this page
        pageCtx.drawImage(
          canvas,
          0, yPosition * (canvas.width / imgWidth), // source x, y
          canvas.width, pageCanvas.height, // source width, height
          0, 0, // destination x, y
          canvas.width, pageCanvas.height // destination width, height
        );
      }
      
      // Add this page to PDF
      pdf.addImage(pageCanvas.toDataURL('image/png'), 'PNG', marginSide, marginTop, imgWidth, contentForThisPage);
      
      yPosition += contentForThisPage;
      pageNumber++;
      
      console.log(`Added page ${pageNumber - 1}, remaining height: ${imgHeight - yPosition}`);
    }
    
    console.log('PDF generated successfully');
    
    // Clean up
    document.body.removeChild(tempDiv);
    
    return pdf.output('blob');
  } catch (error) {
    console.error('Error generating PDF:', error);
    document.body.removeChild(tempDiv);
    throw error;
  }
};

export const downloadLeaseDocument = async (data: LeaseDocumentData, language: 'en' | 'so' = 'en', filename?: string) => {
  try {
    console.log('=== DOWNLOAD LEASE DOCUMENT ===');
    console.log('Download function called with language:', language);
    console.log('Language type:', typeof language);
    console.log('Language value is "so"?', language === 'so');
    
    console.log('Generating PDF...');
    const pdfBlob = await generateLeaseDocumentPDF(data, language);
    console.log('PDF generated, size:', pdfBlob.size);
    
    console.log('Creating object URL...');
    const url = URL.createObjectURL(pdfBlob);
    console.log('Object URL created:', url);
    
    const languageSuffix = language === 'so' ? '-somali' : '-english';
    const timestamp = new Date().getTime();
  const link = document.createElement('a');
  link.href = url;
    link.download = filename || `lease-agreement-${data.lease.leaseId}${languageSuffix}-${timestamp}.pdf`;
    
    console.log('Downloading file:', link.download);
    console.log('Link href:', link.href);
    console.log('Link download:', link.download);
    
  document.body.appendChild(link);
    console.log('Link appended to body');
    
  link.click();
    console.log('Link clicked');
    
  document.body.removeChild(link);
    console.log('Link removed from body');
    
  URL.revokeObjectURL(url);
    console.log('Object URL revoked');
    
    console.log('Download complete!');
  } catch (error) {
    console.error('Error in downloadLeaseDocument:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
  }
};
