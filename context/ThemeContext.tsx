import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, defaultTheme } from '@/constants/themes';
import { Theme, ThemeName } from '@/types/global';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { secureStorage, SECURE_STORAGE_KEYS } from '@/lib/secure-storage';

interface ThemeContextType {
  theme: Theme;
  themeName: ThemeName;
  setTheme: (themeName: ThemeName) => Promise<void>;
  isDark: boolean;
}

export const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>(defaultTheme);
  const { user } = useAuth();

  useEffect(() => {
    // Load theme from secure storage and user profile
    const loadTheme = async () => {
      const storedTheme = await secureStorage.getItem(SECURE_STORAGE_KEYS.THEME);
      if (storedTheme) {
        setThemeName(storedTheme as ThemeName);
      } else if (user?.theme_preference) {
        setThemeName(user.theme_preference as ThemeName);
      }
    };
    loadTheme();
  }, [user]);

  const setTheme = async (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    
    // Save to secure storage
    await secureStorage.setItem(SECURE_STORAGE_KEYS.THEME, newThemeName);
    
    // Save to user profile if authenticated
    if (user) {
      await supabase
        .from('profiles')
        .update({ theme_preference: newThemeName })
        .eq('id', user.id);
    }
  };

  const theme = themes[themeName];
  const isDark = themeName === 'solar-dark';

  return (
    <ThemeContext.Provider value={{ theme, themeName, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}