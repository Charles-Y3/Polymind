export type Language = 'en' | 'zh-CN' | 'zh-TW';

export interface LanguageOption {
  code: Language;
  label: string;
  shortLabel: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', shortLabel: 'EN', flag: '🇺🇸' },
  { code: 'zh-CN', label: '简体中文', shortLabel: '简', flag: '🇨🇳' },
  { code: 'zh-TW', label: '繁體中文', shortLabel: '繁', flag: '🇹🇼' },
];
