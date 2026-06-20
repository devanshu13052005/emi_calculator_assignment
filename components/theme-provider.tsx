'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useEMIStore } from '@/lib/store';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDOM(newTheme: Theme) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  
  // Set data-theme attribute for CSS variables
  html.setAttribute('data-theme', newTheme);
  
  // Also update class for Tailwind compatibility
  html.classList.remove('dark', 'light');
  html.classList.add(newTheme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  // Connect to Zustand store which now handles cross-tab sync automatically
  const theme = useEMIStore((state) => state.theme);
  const setThemeState = useEMIStore((state) => state.setTheme);
  const toggleThemeState = useEMIStore((state) => state.toggleTheme);

  useEffect(() => {
    // Initial load: Apply system preference if store still has default 'light'
    // but user prefers dark. (Store sync will overwrite this if needed).
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark && theme === 'light' && !mounted) {
       setThemeState('dark');
    }
    
    setMounted(true);
  }, []);

  // Apply theme to DOM whenever it changes in the store
  useEffect(() => {
    if (mounted) {
      applyThemeToDOM(theme);
    }
  }, [theme, mounted]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
  }, [setThemeState]);

  const toggleTheme = useCallback(() => {
    toggleThemeState();
  }, [toggleThemeState]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.error('[useTheme] Must be used within ThemeProvider');
    return {
      theme: 'light',
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  return context;
}
