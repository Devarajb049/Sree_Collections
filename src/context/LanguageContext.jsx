import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const LANG_STORAGE_KEY = 'sree_lang_pref';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved === 'te' ? 'te' : 'en';
    } catch (e) {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, language);
    } catch (e) {
      console.warn('Could not save language preference:', e);
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => (prev === 'en' ? 'te' : 'en'));
  };

  /**
   * Helper translation function.
   * If translation for current language exists, returns it; otherwise falls back to English.
   */
  const t = (enText, teText) => {
    if (language === 'te' && teText) {
      return teText;
    }
    return enText;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
