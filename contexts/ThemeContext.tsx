import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';

const THEME_STORAGE_KEY = '@ronaldify_theme';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceLight: string;
  primary: string;
  primaryLight: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  gold: string;
  black: string;
  gradientStart: string;
  gradientMiddle: string;
  gradientEnd: string;
}

const darkColors: ThemeColors = {
  background: '#0F0F1A',
  surface: '#1A1A2E',
  surfaceLight: '#252540',
  primary: '#00D084',
  primaryLight: '#00D08420',
  secondary: '#6C63FF',
  accent: '#FFD700',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B80',
  border: '#2A2A40',
  success: '#00D084',
  error: '#FF6B6B',
  warning: '#FFB800',
  gold: '#FFD700',
  black: '#000000',
  gradientStart: '#0F0F1A',
  gradientMiddle: '#1A1A2E',
  gradientEnd: '#0F0F1A',
};

const lightColors: ThemeColors = {
  background: '#F5F5F7',
  surface: '#FFFFFF',
  surfaceLight: '#E8E8ED',
  primary: '#00B070',
  primaryLight: '#00B07020',
  secondary: '#5A52E0',
  accent: '#E6B800',
  text: '#1A1A2E',
  textSecondary: '#6B6B80',
  textMuted: '#9999A5',
  border: '#E0E0E5',
  success: '#00B070',
  error: '#E05555',
  warning: '#E6A600',
  gold: '#E6B800',
  black: '#000000',
  gradientStart: '#F5F5F7',
  gradientMiddle: '#FFFFFF',
  gradientEnd: '#F5F5F7',
};

export const [ThemeProvider, useTheme] = createContextHook(() => {
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const stored = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark') {
        setThemeMode(stored);
      }
    } catch (error) {
      console.log('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
      console.log('Theme saved:', mode);
    } catch (error) {
      console.log('Error saving theme:', error);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = themeMode === 'dark' ? 'light' : 'dark';
    setTheme(newMode);
  }, [themeMode, setTheme]);

  const isDark = themeMode === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return {
    themeMode,
    isDark,
    colors,
    setTheme,
    toggleTheme,
    isLoading,
  };
});
