'use client';

import { useEffect, useRef, useState } from 'react';

export interface SyncMessage {
  type: 'HEARTBEAT';
  tabId: string;
  timestamp?: number;
}

const PRESENCE_CHANNEL = 'emi-tab-presence';
const HEARTBEAT_INTERVAL = 2000;
const TAB_TIMEOUT = 5000;

function generateTabId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  return 'Tab ' + chars[Math.floor(Math.random() * 26)] + digits[Math.floor(Math.random() * 10)];
}

export function useTabIdentity(): {
  tabId: string;
  activeTabCount: number;
  isLeader: boolean;
} {
  const [tabId] = useState<string>(generateTabId);
  const [presenceMap, setPresenceMap] = useState<Record<string, number>>({});
  const channelRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef(tabId);

  useEffect(() => {
    let cancelled = false;
    if (typeof window === 'undefined') return;
    if (!('BroadcastChannel' in window)) {
      console.warn('[useTabIdentity] BroadcastChannel not supported');
      return;
    }

    try {
      const channel = new BroadcastChannel(PRESENCE_CHANNEL);
      channelRef.current = channel;

      channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        if (cancelled) return;
        const msg = event.data;
        if (msg.type !== 'HEARTBEAT') return;
        if (msg.tabId === tabIdRef.current) return;
        setPresenceMap((prev) => ({
          ...prev,
          [msg.tabId]: msg.timestamp ?? Date.now(),
        }));
      };

      const beat = () => {
        if (cancelled) return;
        const now = Date.now();
        setPresenceMap((prev) => ({
          ...prev,
          [tabIdRef.current]: now,
        }));
        channel.postMessage({
          type: 'HEARTBEAT',
          tabId: tabIdRef.current,
          timestamp: now,
        } as SyncMessage);
      };

      beat();
      const heartbeatTimer = setInterval(beat, HEARTBEAT_INTERVAL);

      const evictTimer = setInterval(() => {
        if (cancelled) return;
        const cutoff = Date.now() - TAB_TIMEOUT;
        setPresenceMap((prev) => {
          const next = { ...prev };
          let changed = false;
          for (const id of Object.keys(next)) {
            if (next[id] < cutoff) {
              delete next[id];
              changed = true;
            }
          }
          return changed ? next : prev;
        });
      }, 3000);

      return () => {
        cancelled = true;
        clearInterval(heartbeatTimer);
        clearInterval(evictTimer);
        channel.close();
        channelRef.current = null;
      };
    } catch (e) {
      console.warn('[useTabIdentity] BroadcastChannel error:', e);
    }
  }, []);

  const allTabIds = Object.keys(presenceMap).sort();
  const isLeader = allTabIds[0] === tabId;

  return {
    tabId,
    activeTabCount: allTabIds.length,
    isLeader,
  };
}
