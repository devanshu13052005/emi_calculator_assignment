'use client';

import { useEffect, useState } from 'react';
import { copyShareableUrlToClipboard, updateUrlWithState } from '@/lib/url-state';

export function BonusFeatures() {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Update URL whenever state changes
    const timer = setTimeout(() => {
      updateUrlWithState();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleCopyUrl = async () => {
    const success = await copyShareableUrlToClipboard();
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex gap-2 items-center">
      <button
        onClick={handleCopyUrl}
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          copied
            ? 'bg-accent text-accent-foreground'
            : 'bg-primary text-primary-foreground hover:bg-primary/90'
        }`}
        title="Copy shareable URL with current state"
      >
        {copied ? 'Copied!' : 'Share'}
      </button>
    </div>
  );
}
