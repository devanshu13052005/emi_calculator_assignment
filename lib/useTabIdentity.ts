'use client';

import { useEffect, useRef, useState } from 'react';

export interface SyncMessage {
  type: 'HEARTBEAT';
  senderId: string;
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
    if (typeof window === 'undefined') return;
    if (!('BroadcastChannel' in window)) {
      console.warn('[useTabIdentity] BroadcastChannel not supported');
      return;
    }

    try {
      const channel = new BroadcastChannel(PRESENCE_CHANNEL);
      channelRef.current = channel;

      // Listen for heartbeats from other tabs
      channel.onmessage = (event: MessageEvent<SyncMessage>) => {
        const msg = event.data;
        if (msg.type === 'HEARTBEAT' && msg.senderId !== tabIdRef.current) {
          setPresenceMap((prev) => ({
            ...prev,
            [msg.senderId]: msg.timestamp ?? Date.now(),
          }));
        }
      };

      // Send own heartbeat immediately and then every 2 seconds
      const sendHeartbeat = () => {
        setPresenceMap((prev) => ({
          ...prev,
          [tabIdRef.current]: Date.now(),
        }));
        channel.postMessage({
          type: 'HEARTBEAT',
          senderId: tabIdRef.current,
          timestamp: Date.now(),
        } as SyncMessage);
      };

      sendHeartbeat();
      const heartbeatInterval = setInterval(sendHeartbeat, HEARTBEAT_INTERVAL);

      // Evict stale tabs every 3 seconds
      const evictInterval = setInterval(() => {
        const now = Date.now();
        setPresenceMap((prev) => {
          const updated = { ...prev };
          Object.entries(updated).forEach(([id, lastSeen]) => {
            if (now - lastSeen > TAB_TIMEOUT) delete updated[id];
          });
          return updated;
        });
      }, 3000);

      return () => {
        clearInterval(heartbeatInterval);
        clearInterval(evictInterval);
        channel.close();
        channelRef.current = null;
      };
    } catch (e) {
      console.warn('[useTabIdentity] BroadcastChannel error:', e);
    }
  }, []);

  const allTabIds = Object.keys(presenceMap).sort();
  const isLeader = allTabIds.length === 0 || allTabIds[0] === tabId;

  return {
    tabId,
    activeTabCount: Object.keys(presenceMap).length,
    isLeader,
  };
}
