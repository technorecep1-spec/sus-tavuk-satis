import React from 'react';
import { Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageChange = (newLanguage: 'tr' | 'en') => {
    setLanguage(newLanguage);
  };

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
        <Globe size={20} />
        <span className="text-sm font-medium">
          {language === 'tr' ? 'TR' : 'EN'}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        <div className="py-2">
          <button
            onClick={() => handleLanguageChange('tr')}
            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
              language === 'tr' 
                ? 'bg-primary-100 text-primary-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🇹🇷 Türkçe
          </button>
          <button
            onClick={() => handleLanguageChange('en')}
            className={`block w-full text-left px-4 py-2 text-sm transition-colors ${
              language === 'en' 
                ? 'bg-primary-100 text-primary-700 font-medium' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            🇺🇸 English
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;

