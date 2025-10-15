import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, LightTheme, ThemeColors } from './colors';
import { themeStorage } from '@/core/storage/theme';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: ThemeColors;
  mode: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('auto');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    themeStorage.getTheme().then(savedTheme => {
      setMode(savedTheme);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!isLoading) {
      if (mode === 'auto') {
        setIsDark(systemColorScheme === 'dark');
      } else {
        setIsDark(mode === 'dark');
      }
    }
  }, [mode, systemColorScheme, isLoading]);

  const handleSetTheme = async (newMode: ThemeMode) => {
    setMode(newMode);
    await themeStorage.setTheme(newMode);
  };

  const theme = isDark ? DarkTheme : LightTheme;

  const value: ThemeContextType = {
    theme,
    mode,
    isDark,
    setTheme: handleSetTheme,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};
