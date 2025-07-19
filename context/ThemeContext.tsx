import React, { createContext, useContext, useEffect, useState } from 'react';
import { themes, defaultTheme } from '@/constants/themes';
import { Theme, ThemeName } from '@/types/global';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';

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
    // Load theme from user profile when user is available
    if (user?.theme_preference) {
      setThemeName(user.theme_preference as ThemeName);
    }
  }, [user]);

  const setTheme = async (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    
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