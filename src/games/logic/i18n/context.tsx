import React, { createContext, useContext, useState } from 'react';
import { Language, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { TRANSLATIONS, TranslationKey } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: LanguageOption[];
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_LANG_KEY = 'machine_mind_language_v1';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_LANG_KEY) as Language | null;
      if (saved && (saved === 'en' || saved === 'zh-CN' || saved === 'zh-TW')) {
        return saved;
      }
      const navLang = navigator.language || '';
      if (navLang.startsWith('zh-TW') || navLang.startsWith('zh-HK') || navLang.startsWith('zh-MO')) {
        return 'zh-TW';
      }
      if (navLang.startsWith('zh')) {
        return 'zh-CN';
      }
    }
    return 'en';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_LANG_KEY, newLang);
    }
  };

  const t = (key: TranslationKey, params?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let str = langDict[key] || TRANSLATIONS.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return str;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        t,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
};
