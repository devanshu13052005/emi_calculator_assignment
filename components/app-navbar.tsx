'use client';

import { useTheme } from '@/components/theme-provider';
import { useEMIStore } from '@/lib/store';
import { useTabIdentity } from '@/lib/useTabIdentity';
import { useState, useEffect } from 'react';

export function AppNavbar() {
  const { theme, toggleTheme } = useTheme();
  const store = useEMIStore();
  const { tabId, activeTabCount, isLeader } = useTabIdentity();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full bg-background border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">EMI Workspace</h1>
          <div className="flex items-center gap-3">
            {mounted && (
              <>
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-muted text-foreground">{tabId}</span>
                  {isLeader && <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded font-semibold">LEADER</span>}
                  <span className="text-muted-foreground">● {activeTabCount} tabs</span>
                </div>
              </>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.536l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.121-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM5.464 5.464a1 1 0 000 1.414l-.707.707A1 1 0 003.343 5.464l.707-.707a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
