import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const LanguageSwitcher: React.FC = () => {
  const { currentLanguage, changeLanguage, t } = useLanguage();

  const languages = [
    { code: 'en', name: t('language.english'), flag: '🇺🇸' },
    { code: 'so', name: t('language.somali'), flag: '🇸🇴' }
  ];

  return (
    <div className="flex items-center space-x-2">
      <Select value={currentLanguage} onValueChange={changeLanguage}>
        <SelectTrigger className="w-32 bg-slate-50/90 dark:bg-slate-800 backdrop-blur-sm border-slate-200 dark:border-slate-700 focus:border-blue-900 dark:focus:border-blue-700 focus:ring-blue-900/20 dark:focus:ring-blue-700/20 text-slate-900 dark:text-slate-200">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-50/95 dark:bg-slate-800 backdrop-blur-sm border-slate-200 dark:border-slate-700">
          {languages.map((lang) => (
            <SelectItem 
              key={lang.code} 
              value={lang.code} 
              className="text-slate-900 dark:text-slate-200 data-[highlighted]:bg-blue-500 data-[highlighted]:text-white data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
            >
              <div className="flex items-center space-x-2">
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSwitcher;
