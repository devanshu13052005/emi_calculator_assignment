'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyTheme(newTheme: Theme) {
  if (typeof document === 'undefined') return;
  const html = document.documentElement;
  
  // Set data-theme attribute for CSS variables
  html.setAttribute('data-theme', newTheme);
  
  // Also update class for compatibility
  html.classList.remove('dark', 'light');
  if (newTheme === 'dark') {
    html.classList.add('dark');
  } else {
    html.classList.add('light');
  }
  
  localStorage.setItem('emi-theme', newTheme);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    // Get theme from localStorage or system preference
    const savedTheme = localStorage.getItem('emi-theme') as Theme | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = (savedTheme || (prefersDark ? 'dark' : 'light')) as Theme;
    
    setThemeState(initialTheme);
    applyTheme(initialTheme);
    setMounted(true);
    
    // Listen for theme changes from other tabs
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('emi-theme-sync');
        channel.onmessage = (event) => {
          if (event.data.type === 'THEME_CHANGED') {
            setThemeState(event.data.theme);
            applyTheme(event.data.theme);
          }
        };
        return () => channel.close();
      } catch (e) {
        // BroadcastChannel not supported
      }
    }
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    applyTheme(newTheme);
    
    // Broadcast to other tabs
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channel = new BroadcastChannel('emi-theme-sync');
        channel.postMessage({ type: 'THEME_CHANGED', theme: newTheme });
        channel.close();
      } catch (e) {
        // BroadcastChannel not supported
      }
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState(prev => {
      const newTheme = prev === 'light' ? 'dark' : 'light';
      applyTheme(newTheme);
      return newTheme;
    });
  }, []);

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
