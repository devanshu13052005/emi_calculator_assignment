'use client';

import { useEffect, useRef } from 'react';
import type { AppState } from './types';

export interface SyncMessage {
  type: 'STATE_UPDATE' | 'REQUEST_STATE' | 'STATE_RESPONSE' | 'HEARTBEAT';
  senderId: string;
  payload?: any;
  timestamp?: number;
}

const SYNC_CHANNEL = 'emi-workspace-sync';

export function useTabSync(
  state: AppState,
  dispatch: (action: any) => void,
  tabId: string
): void {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const isReceivingRef = useRef(false);
  const tabIdRef = useRef(tabId);
  const stateRef = useRef(state);

  // Keep state ref in sync
  stateRef.current = state;
  tabIdRef.current = tabId;

  // Initialize channel once
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!('BroadcastChannel' in window)) {
      console.warn('[useTabSync] BroadcastChannel not supported');
      return;
    }

    try {
      const channel = new BroadcastChannel(SYNC_CHANNEL);
      channelRef.current = channel;

      channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        const msg = event.data;

        // Ignore own messages
        if (msg.senderId === tabIdRef.current) return;

        if (msg.type === 'STATE_UPDATE' && msg.payload) {
          isReceivingRef.current = true;
          dispatch({ type: 'REPLACE_STATE', payload: msg.payload });
          setTimeout(() => {
            isReceivingRef.current = false;
          }, 0);
        }

        if (msg.type === 'REQUEST_STATE') {
          // Respond with current state
          channel.postMessage({
            type: 'STATE_RESPONSE',
            senderId: tabIdRef.current,
            payload: stateRef.current,
            timestamp: Date.now(),
          } as SyncMessage);
        }

        if (msg.type === 'STATE_RESPONSE' && msg.payload) {
          isReceivingRef.current = true;
          dispatch({ type: 'REPLACE_STATE', payload: msg.payload });
          setTimeout(() => {
            isReceivingRef.current = false;
          }, 0);
        }
      };

      // Request current state from other tabs on mount
      channel.postMessage({
        type: 'REQUEST_STATE',
        senderId: tabIdRef.current,
        timestamp: Date.now(),
      } as SyncMessage);

      return () => {
        channel.close();
        channelRef.current = null;
      };
    } catch (e) {
      console.warn('[useTabSync] BroadcastChannel error:', e);
    }
  }, [dispatch]);

  // Broadcast state changes to other tabs
  useEffect(() => {
    // Skip if we just received this state
    if (isReceivingRef.current) return;
    if (!channelRef.current) return;

    try {
      channelRef.current.postMessage({
        type: 'STATE_UPDATE',
        senderId: tabIdRef.current,
        payload: state,
        timestamp: Date.now(),
      } as SyncMessage);
    } catch (e) {
      console.warn('[useTabSync] Error broadcasting state:', e);
    }
  }, [state]);
}
