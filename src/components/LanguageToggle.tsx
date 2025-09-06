import React from 'react';
import { Language } from '../types';

interface LanguageToggleProps {
  currentLanguage: Language;
  onLanguageChange: (language: Language) => void;
}

const LanguageToggle: React.FC<LanguageToggleProps> = ({ 
  currentLanguage, 
  onLanguageChange 
}) => {
  return (
    <div className="flex items-center space-x-2">
      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => onLanguageChange('bn')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            currentLanguage === 'bn'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          বাংলা
        </button>
        <button
          onClick={() => onLanguageChange('en')}
          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200 ${
            currentLanguage === 'en'
              ? 'bg-blue-500 text-white'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          English
        </button>
      </div>
    </div>
  );
};

export default LanguageToggle;