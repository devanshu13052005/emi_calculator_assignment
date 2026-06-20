'use client';

import { useEffect, useState } from 'react';
import { useEMIStore } from '@/lib/store';
import { SingleEMIMode } from '@/components/single-emi';
import { ComparisonEMIMode } from '@/components/comparison-emi';
import { PrepaymentEMIMode } from '@/components/prepayment-emi';
import { BonusFeatures } from '@/components/bonus-features';
import { AppNavbar } from '@/components/app-navbar';
import { loadStateFromUrl } from '@/lib/url-state';
import { useTabSync } from '@/lib/useTabSync';
import { useTabIdentity } from '@/lib/useTabIdentity';

export default function Page() {
  const store = useEMIStore();
  const [mounted, setMounted] = useState(false);

  // Initialize Tab Identity (gets Tab A/B, leader status, active count)
  const { tabId, activeTabCount, isLeader } = useTabIdentity();
  
  // Initialize Cross-Tab State Sync
  useTabSync(tabId);

  useEffect(() => {
    setMounted(true);
    // Load state from URL if present
    loadStateFromUrl();
  }, []);

  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <AppNavbar />

      {/* Tab Navigation */}
      <div className="border-b border-border bg-background/50 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => store.setActiveTab('single')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                store.activeTab === 'single'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Single EMI
            </button>
            <button
              onClick={() => store.setActiveTab('compare')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                store.activeTab === 'compare'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Compare Loans
            </button>
            <button
              onClick={() => store.setActiveTab('prepayment')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                store.activeTab === 'prepayment'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              Prepayment
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {mounted && (
          <>
            {store.activeTab === 'single' && <SingleEMIMode />}
            {store.activeTab === 'compare' && <ComparisonEMIMode />}
            {store.activeTab === 'prepayment' && <PrepaymentEMIMode />}
          </>
        )}
      </div>

      {/* Bonus Features */}
      <BonusFeatures />

      {/* Footer */}
      <footer className="border-t border-border bg-background/50 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            Open this page in a second tab — inputs, theme, and mode stay in sync via the BroadcastChannel API.
          </p>
        </div>
      </footer>
    </main>
  );
}
