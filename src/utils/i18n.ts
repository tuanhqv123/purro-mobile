import i18n, { TFunction } from 'i18next';
import {
  initReactI18next,
  useTranslation as useI18nTranslation,
} from 'react-i18next';

import enTranslations from '@/locales/en/translations.json';
import viTranslations from '@/locales/vi/translations.json';
import { FALLBACK_LANGUAGE } from '@/locales';
import { languageStorage } from '@/core/storage/language';

export const initI18n = async () => {
  const savedLanguage = await languageStorage.getLanguage();

  await i18n.use(initReactI18next).init({
    compatibilityJSON: 'v3',
    resources: {
      en: {
        translation: enTranslations,
      },
      vi: {
        translation: viTranslations,
      },
    },
    lng: savedLanguage,
    fallbackLng: FALLBACK_LANGUAGE,
    interpolation: {
      escapeValue: false,
    },
  });
};

export type TranslationKey =
  | 'common.ok'
  | 'common.cancel'
  | 'common.continue'
  | 'common.back'
  | 'common.next'
  | 'common.confirm'
  | 'welcome.title'
  | 'welcome.subtitle'
  | 'welcome.createWallet'
  | 'welcome.importWallet'
  | 'welcome.termsText'
  | 'seedPhrase.display.title'
  | 'seedPhrase.display.subtitle'
  | 'seedPhrase.display.confirmation'
  | 'seedPhrase.display.warning'
  | 'seedPhrase.verify.title'
  | 'seedPhrase.verify.subtitle'
  | 'password.create.title'
  | 'password.create.subtitle'
  | 'password.create.passwordLabel'
  | 'password.create.confirmLabel'
  | 'password.create.passwordPlaceholder'
  | 'password.create.confirmPlaceholder'
  | 'password.create.requirement'
  | 'password.create.enableBiometrics'
  | 'password.create.validation.tooShort'
  | 'password.create.validation.mismatch'
  | 'unlock.title'
  | 'unlock.subtitle'
  | 'unlock.passwordLabel'
  | 'unlock.passwordPlaceholder'
  | 'unlock.unlockButton'
  | 'unlock.forgotPassword'
  | 'unlock.useBiometrics'
  | 'unlock.error.incorrect'
  | 'home.title'
  | 'home.balance'
  | 'settings.title'
  | 'wallet.create.success.title'
  | 'wallet.create.success.subtitle'
  | 'wallet.create.success.button'
  | 'errors.generic.title'
  | 'errors.generic.message';

interface UseTranslationResult {
  t: TFunction;
  i18n: typeof i18n;
}

export const useTranslation = (): UseTranslationResult => {
  return useI18nTranslation();
};

export default i18n;
