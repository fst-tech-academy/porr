// Quick test to verify translations are working
import { getTranslations } from './leaseTranslations';

export const testTranslations = () => {
  console.log('=== TESTING TRANSLATIONS ===');
  
  const englishT = getTranslations('en');
  console.log('English title:', englishT.title);
  console.log('English landlord:', englishT.landlord);
  console.log('English tenant:', englishT.tenant);
  
  const somaliT = getTranslations('so');
  console.log('Somali title:', somaliT.title);
  console.log('Somali landlord:', somaliT.landlord);
  console.log('Somali tenant:', somaliT.tenant);
  
  console.log('Are they different?', englishT.title !== somaliT.title);
  console.log('===========================');
  
  return {
    english: englishT,
    somali: somaliT
  };
};


