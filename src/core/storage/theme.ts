import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemeMode } from '@/theme';

const THEME_KEY = '@purro:theme';

export const themeStorage = {
  async getTheme(): Promise<ThemeMode> {
    try {
      const theme = await AsyncStorage.getItem(THEME_KEY);
      return (theme as ThemeMode) || 'auto';
    } catch (error) {
      console.error('Failed to get theme from storage:', error);
      return 'auto';
    }
  },

  async setTheme(theme: ThemeMode): Promise<void> {
    try {
      await AsyncStorage.setItem(THEME_KEY, theme);
    } catch (error) {
      console.error('Failed to save theme to storage:', error);
    }
  },
};
