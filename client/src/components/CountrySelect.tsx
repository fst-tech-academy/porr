import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { countries } from '../data/countries';
import { useLanguage } from '../contexts/LanguageContext';

interface CountrySelectProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CountrySelect: React.FC<CountrySelectProps> = ({
  value,
  onValueChange,
  placeholder,
  className = '',
  disabled = false
}) => {
  const { t } = useLanguage();

  // Find the selected country to display flag and name
  const selectedCountry = countries.find(country => country.name === value);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger className={`bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:border-blue-900 dark:focus:border-blue-700 focus:ring-blue-900/20 dark:focus:ring-blue-700/20 ${className}`}>
        <SelectValue placeholder={placeholder || t('common.selectCountry')} />
      </SelectTrigger>
      <SelectContent className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 max-h-60">
        {countries.map((country) => (
          <SelectItem
            key={country.code}
            value={country.name}
            className="text-slate-900 hover:bg-slate-900 hover:text-white dark:text-white dark:hover:bg-slate-900 dark:hover:text-white focus:bg-slate-900 focus:text-white dark:focus:bg-slate-900 dark:focus:text-white"
          >
            <div className="flex items-center space-x-2">
              <span className="text-lg">{country.flag}</span>
              <span>{country.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default CountrySelect;



