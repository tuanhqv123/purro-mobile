export const SUPPORTED_LANGUAGES = ['en', 'vi'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export const FALLBACK_LANGUAGE: SupportedLanguage = 'en';
