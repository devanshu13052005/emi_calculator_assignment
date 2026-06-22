'use client';

import { useTheme } from '@/components/theme-provider';
import { useTabIdentity } from '@/lib/useTabIdentity';
import { useState, useEffect } from 'react';

export function AppNavbar() {
  const { theme, toggleTheme } = useTheme();
  const { tabId, activeTabCount, isLeader } = useTabIdentity();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav className="w-full bg-card border-b sticky top-0 z-50" style={{ borderColor: 'var(--border)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between flex-nowrap gap-2">
          <h1 className="font-bold truncate text-[clamp(18px,5vw,28px)]" style={{ color: 'var(--text-primary)', fontWeight: 700 }}>
            EMI Workspace
          </h1>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {mounted && (
              <div className="text-xs text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                <span
                  className="border font-semibold text-[11px] sm:text-[13px] px-1.5 py-0.5 sm:px-2 sm:py-1"
                  style={{
                    backgroundColor: 'var(--highlight-bg)',
                    color: 'var(--accent-blue)',
                    borderColor: '#c7d2fe',
                    borderRadius: 8,
                  }}
                >
                  {tabId}
                </span>
                {isLeader && (
                  <span
                    className="px-1.5 py-0.5 sm:px-2 sm:py-1 border"
                    style={{
                      backgroundColor: '#dcfce7',
                      color: '#166534',
                      borderColor: '#86efac',
                      borderRadius: 6,
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                    }}
                  >
                    LEADER
                  </span>
                )}
                <span className="hidden sm:flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--color-interest-saved)' }} />
                  {activeTabCount} {activeTabCount === 1 ? 'tab' : 'tabs'}
                </span>
              </div>
            )}
            <button
              onClick={toggleTheme}
              className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted transition-all"
              aria-label="Toggle theme"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="theme-toggle-icon w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              ) : (
                <svg className="theme-toggle-icon is-dark w-5 h-5 text-foreground" fill="currentColor" viewBox="0 0 20 20">
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
