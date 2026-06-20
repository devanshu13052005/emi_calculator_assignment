'use client';

import { useEffect, useRef } from 'react';
import type { AppState, SyncMessage } from '@/lib/types';
import { useEMIStore } from '@/lib/store';

const CHANNEL_NAME = 'emi-workspace-sync';

/**
 * Cross-tab state sync via BroadcastChannel.
 *
 * Every tab broadcasts its own state changes — no leader requirement.
 * Uses isApplyingRemoteState ref to prevent infinite broadcast loops:
 * receive message → setState → state changes → would broadcast again → loop
 */
export function useTabSync(tabId: string): void {
  const channelRef = useRef<BroadcastChannel | null>(null);

  // CRITICAL: prevents re-broadcasting state changes that came from another tab
  const isApplyingRemoteState = useRef(false);

  const tabIdRef = useRef(tabId);
  tabIdRef.current = tabId;

  // Initialize channel and set up listeners — runs once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Graceful fallback if browser does not support BroadcastChannel
    if (!('BroadcastChannel' in window)) {
      console.warn('[TabSync] BroadcastChannel not supported. Cross-tab sync disabled.');
      return;
    }

    const channel = new BroadcastChannel(CHANNEL_NAME);
    channelRef.current = channel;

    channel.onmessage = (event: MessageEvent<SyncMessage>) => {
      const msg = event.data;

      // Always ignore messages sent by this same tab
      if (msg.senderId === tabIdRef.current) return;

      if (msg.type === 'STATE_UPDATE' && msg.payload) {
        // Mark that we are applying remote state — do NOT broadcast this change back
        isApplyingRemoteState.current = true;
        useEMIStore.getState().replaceState(msg.payload as AppState);
        // Reset flag after React's render cycle completes
        requestAnimationFrame(() => {
          isApplyingRemoteState.current = false;
        });
      }

      if (msg.type === 'REQUEST_STATE') {
        // Another tab just opened and wants current state — send it
        const currentState = useEMIStore.getState();
        // Extract only serializable state (no functions)
        const stateToSend = extractSyncableState(currentState);
        channel.postMessage({
          type: 'STATE_RESPONSE',
          senderId: tabIdRef.current,
          payload: stateToSend,
          timestamp: Date.now(),
        } as SyncMessage);
      }

      if (msg.type === 'STATE_RESPONSE' && msg.payload) {
        // We received state from an existing tab on first load
        isApplyingRemoteState.current = true;
        useEMIStore.getState().replaceState(msg.payload as AppState);
        requestAnimationFrame(() => {
          isApplyingRemoteState.current = false;
        });
      }
    };

    // On mount: ask existing tabs for their current state.
    // This is what makes a new tab "inherit" the current workspace state.
    channel.postMessage({
      type: 'REQUEST_STATE',
      senderId: tabIdRef.current,
      timestamp: Date.now(),
    } as SyncMessage);

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []); // only run once on mount

  // Subscribe to Zustand store changes and broadcast to other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const unsubscribe = useEMIStore.subscribe((state) => {
      // CRITICAL: skip broadcast if this state change came FROM another tab
      if (isApplyingRemoteState.current) return;
      if (!channelRef.current) return;

      const stateToSend = extractSyncableState(state);

      try {
        channelRef.current.postMessage({
          type: 'STATE_UPDATE',
          senderId: tabIdRef.current,
          payload: stateToSend,
          timestamp: Date.now(),
        } as SyncMessage);
      } catch (e) {
        console.warn('[TabSync] Error broadcasting state:', e);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);
}

/**
 * Extract only the data fields from the store (exclude functions, history).
 * This is what gets sent over BroadcastChannel.
 */
function extractSyncableState(state: ReturnType<typeof useEMIStore.getState>): Partial<AppState> {
  return {
    singleLoan: state.singleLoan,
    singleOutput: state.singleOutput,
    comparisonLoans: state.comparisonLoans,
    comparisonResults: state.comparisonResults,
    prepaymentLoan: state.prepaymentLoan,
    prepaymentEntries: state.prepaymentEntries,
    prepaymentResult: state.prepaymentResult,
    activeTab: state.activeTab,
    comparisonCount: state.comparisonCount,
    theme: state.theme,
    urlState: state.urlState,
    lastUpdate: state.lastUpdate,
  };
}
