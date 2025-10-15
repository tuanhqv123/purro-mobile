import AsyncStorage from '@react-native-async-storage/async-storage';
import { SupportedLanguage, DEFAULT_LANGUAGE } from '@/locales';

const LANGUAGE_KEY = '@purro:language';

export const languageStorage = {
  async getLanguage(): Promise<SupportedLanguage> {
    try {
      const language = await AsyncStorage.getItem(LANGUAGE_KEY);
      return (language as SupportedLanguage) || DEFAULT_LANGUAGE;
    } catch (error) {
      console.error('Failed to get language from storage:', error);
      return DEFAULT_LANGUAGE;
    }
  },

  async setLanguage(language: SupportedLanguage): Promise<void> {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Failed to save language to storage:', error);
    }
  },
};
