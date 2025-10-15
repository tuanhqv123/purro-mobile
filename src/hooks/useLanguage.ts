import { useCallback } from 'react';
import { useTranslation } from '@/utils/i18n';
import { SupportedLanguage } from '@/locales';
import { languageStorage } from '@/core/storage/language';

export const useLanguage = () => {
  const { i18n } = useTranslation();

  const currentLanguage = i18n.language as SupportedLanguage;

  const changeLanguage = useCallback(
    async (language: SupportedLanguage) => {
      await i18n.changeLanguage(language);
      await languageStorage.setLanguage(language);
    },
    [i18n],
  );

  return {
    currentLanguage,
    changeLanguage,
  };
};
