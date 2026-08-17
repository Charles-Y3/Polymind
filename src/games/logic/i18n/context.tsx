import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, SUPPORTED_LANGUAGES, LanguageOption } from './types';
import { TRANSLATIONS } from './translations';
import { LOCALIZED_WORLDS, LOCALIZED_PUZZLES } from './localizedData';
import { WorldInfo, Puzzle, WorldId } from '../types';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  languages: LanguageOption[];
  t: (key: string, params?: Record<string, string | number>) => string;
  getLocalizedWorld: (world: WorldInfo) => WorldInfo;
  getLocalizedPuzzle: (puzzle: Puzzle) => Puzzle;
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

  const t = (key: string, params?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let str = langDict[key] || TRANSLATIONS.en[key] || key;

    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        str = str.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return str;
  };

  const getLocalizedWorld = (world: WorldInfo): WorldInfo => {
    const worldLoc = LOCALIZED_WORLDS[language]?.[world.id];
    if (!worldLoc) return world;

    return {
      ...world,
      title: worldLoc.title || world.title,
      subtitle: worldLoc.subtitle || world.subtitle,
      description: worldLoc.description || world.description,
    };
  };

  const getLocalizedPuzzle = (puzzle: Puzzle): Puzzle => {
    if (!puzzle) return puzzle;

    // Check static handcrafted puzzle localization map
    const loc = LOCALIZED_PUZZLES[language]?.[puzzle.id];
    const worldLoc = LOCALIZED_WORLDS[language]?.[puzzle.worldId];

    if (loc) {
      return {
        ...puzzle,
        worldTitle: worldLoc?.title || puzzle.worldTitle,
        title: loc.title || puzzle.title,
        description: loc.description || puzzle.description,
        expectedRule: {
          ...puzzle.expectedRule,
          description: loc.ruleDescription || puzzle.expectedRule.description,
        },
        hints: loc.hints || puzzle.hints,
        explanation: loc.explanation || puzzle.explanation,
        ambiguityChallenge: puzzle.ambiguityChallenge
          ? {
              ...puzzle.ambiguityChallenge,
              hypothesisA: loc.ambiguityHypothesisA || puzzle.ambiguityChallenge.hypothesisA,
              hypothesisB: loc.ambiguityHypothesisB || puzzle.ambiguityChallenge.hypothesisB,
            }
          : undefined,
      };
    }

    // Dynamic localization for procedural & daily puzzles
    if (language === 'zh-CN') {
      let title = puzzle.title;
      let desc = puzzle.description;
      if (puzzle.id.startsWith('daily-')) {
        const datePart = puzzle.id.replace('daily-', '');
        title = `每日机器 #${datePart}`;
        desc = `全球每日专属逻辑挑战 (${datePart})。在 3 次机会内破解法则以保持连胜！`;
      } else if (puzzle.id.startsWith('gen-')) {
        title = `程序演算机器 #${puzzle.id.slice(-4)}`;
        desc = '由系统算法动态生成的逻辑核心。观察输入输出，发现转换法则！';
      }

      return {
        ...puzzle,
        title,
        description: desc,
        worldTitle: worldLoc?.title || (puzzle.worldTitle.includes('Tier') ? `无尽实验室 - 阶梯 ${puzzle.worldId}` : '每日机器挑战'),
      };
    }

    if (language === 'zh-TW') {
      let title = puzzle.title;
      let desc = puzzle.description;
      if (puzzle.id.startsWith('daily-')) {
        const datePart = puzzle.id.replace('daily-', '');
        title = `每日機器 #${datePart}`;
        desc = `全球每日專屬邏輯挑戰 (${datePart})。在 3 次機會內破解法則以保持連勝！`;
      } else if (puzzle.id.startsWith('gen-')) {
        title = `程序演算機器 #${puzzle.id.slice(-4)}`;
        desc = '由系統演算法動態產生的邏輯核心。觀察輸入輸出，發現轉換法則！';
      }

      return {
        ...puzzle,
        title,
        description: desc,
        worldTitle: worldLoc?.title || (puzzle.worldTitle.includes('Tier') ? `無盡實驗室 - 階梯 ${puzzle.worldId}` : '每日機器挑戰'),
      };
    }

    return puzzle;
  };

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage,
        languages: SUPPORTED_LANGUAGES,
        t,
        getLocalizedWorld,
        getLocalizedPuzzle,
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
