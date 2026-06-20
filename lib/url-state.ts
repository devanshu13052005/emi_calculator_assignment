'use client';

import { AppState } from './types';
import { useEMIStore } from './store';

/**
 * Generate a URL-encoded state string
 */
export function generateUrlState(state: Partial<AppState>): string {
  const stateToEncode = {
    singleLoan: state.singleLoan,
    singleOutput: state.singleOutput,
    activeTab: state.activeTab,
  };

  try {
    return btoa(JSON.stringify(stateToEncode));
  } catch (e) {
    console.error('Failed to encode state to URL', e);
    return '';
  }
}

/**
 * Generate shareable URL with state
 */
export function generateShareableUrl(state: Partial<AppState>): string {
  if (typeof window === 'undefined') return '';

  const encodedState = generateUrlState(state);
  const baseUrl = window.location.origin + window.location.pathname;

  return `${baseUrl}?state=${encodedState}`;
}

/**
 * Copy shareable URL to clipboard
 */
export async function copyShareableUrlToClipboard(): Promise<boolean> {
  const store = useEMIStore.getState();
  const url = generateShareableUrl({
    singleLoan: store.singleLoan,
    singleOutput: store.singleOutput,
    activeTab: store.activeTab,
  });

  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (e) {
    console.error('Failed to copy URL to clipboard', e);
    return false;
  }
}

/**
 * Load state from URL parameter
 */
export function loadStateFromUrl(): void {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);
  const stateParam = params.get('state');

  if (stateParam) {
    useEMIStore.getState().loadFromUrl(stateParam);
  }
}

/**
 * Update URL without page reload
 */
export function updateUrlWithState(): void {
  if (typeof window === 'undefined') return;

  const store = useEMIStore.getState();
  const url = generateShareableUrl({
    singleLoan: store.singleLoan,
    singleOutput: store.singleOutput,
    activeTab: store.activeTab,
  });

  window.history.replaceState({ path: url }, '', url);
}
