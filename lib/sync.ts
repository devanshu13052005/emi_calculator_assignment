'use client';

import { AppState } from './types';
import { useEMIStore } from './store';

const CHANNEL_NAME = 'emi-workspace-sync';
const LEADER_HEARTBEAT_INTERVAL = 1000; // 1 second
const LEADER_TIMEOUT = 3000; // 3 seconds

interface SyncMessage {
  type: 'state-update' | 'leader-heartbeat' | 'leader-election';
  payload: Partial<AppState>;
  timestamp: number;
  tabId: string;
}

class CrossTabSync {
  private channel: BroadcastChannel | null = null;
  private tabId: string;
  private isLeader: boolean = false;
  private lastLeaderHeartbeat: number = 0;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private leaderCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.tabId = this.generateTabId();
    this.isLeader = false;
  }

  private generateTabId(): string {
    if (typeof window === 'undefined') return '';
    return `tab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  public initialize(): void {
    if (typeof window === 'undefined') return;

    try {
      this.channel = new BroadcastChannel(CHANNEL_NAME);

      this.channel.onmessage = (event) => {
        const message: SyncMessage = event.data;

        if (message.tabId === this.tabId) return; // Ignore own messages

        switch (message.type) {
          case 'state-update':
            this.handleStateUpdate(message);
            break;
          case 'leader-heartbeat':
            this.handleLeaderHeartbeat(message);
            break;
          case 'leader-election':
            this.handleLeaderElection(message);
            break;
        }
      };

      // Initiate leader election
      this.startLeaderElection();

      // Start leader heartbeat interval
      this.startHeartbeatInterval();

      // Start leader check interval
      this.startLeaderCheckInterval();
    } catch (error) {
      console.warn('BroadcastChannel not available, cross-tab sync disabled', error);
    }
  }

  public cleanup(): void {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
    if (this.leaderCheckInterval) clearInterval(this.leaderCheckInterval);
    if (this.channel) this.channel.close();
  }

  private startLeaderElection(): void {
    this.broadcastMessage({
      type: 'leader-election',
      payload: {},
      timestamp: Date.now(),
      tabId: this.tabId,
    });

    // Wait a bit to see if another tab claims leadership
    setTimeout(() => {
      if (!this.isLeader && Date.now() - this.lastLeaderHeartbeat > LEADER_TIMEOUT) {
        this.becomeLeader();
      }
    }, 500);
  }

  private becomeLeader(): void {
    console.log('[CrossTabSync] This tab is now the leader');
    this.isLeader = true;
    useEMIStore.setState({ isTabLeader: true });
  }

  private startHeartbeatInterval(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isLeader) {
        const state = useEMIStore.getState();
        this.broadcastMessage({
          type: 'leader-heartbeat',
          payload: {
            lastUpdate: state.lastUpdate,
          },
          timestamp: Date.now(),
          tabId: this.tabId,
        });
      }
    }, LEADER_HEARTBEAT_INTERVAL);
  }

  private startLeaderCheckInterval(): void {
    this.leaderCheckInterval = setInterval(() => {
      if (this.isLeader) return;

      if (Date.now() - this.lastLeaderHeartbeat > LEADER_TIMEOUT) {
        console.log('[CrossTabSync] Leader heartbeat timeout, initiating new election');
        this.startLeaderElection();
      }
    }, LEADER_TIMEOUT / 2);
  }

  private handleStateUpdate(message: SyncMessage): void {
    if (!this.isLeader) {
      // Only non-leaders accept state updates from the channel
      useEMIStore.setState(message.payload);
    }
  }

  private handleLeaderHeartbeat(message: SyncMessage): void {
    this.lastLeaderHeartbeat = message.timestamp;
    if (this.isLeader) {
      this.isLeader = false;
      useEMIStore.setState({ isTabLeader: false });
    }
  }

  private handleLeaderElection(message: SyncMessage): void {
    if (this.isLeader && message.tabId > this.tabId) {
      // Another tab with higher ID is running, step down
      this.isLeader = false;
      useEMIStore.setState({ isTabLeader: false });
    }
  }

  public broadcastStateUpdate(state: Partial<AppState>): void {
    if (!this.isLeader) return; // Only leader broadcasts updates

    this.broadcastMessage({
      type: 'state-update',
      payload: state,
      timestamp: Date.now(),
      tabId: this.tabId,
    });
  }

  private broadcastMessage(message: SyncMessage): void {
    if (this.channel) {
      try {
        this.channel.postMessage(message);
      } catch (error) {
        console.error('[CrossTabSync] Failed to broadcast message', error);
      }
    }
  }

  public getTabId(): string {
    return this.tabId;
  }

  public isTabLeader(): boolean {
    return this.isLeader;
  }
}

// Singleton instance
let syncInstance: CrossTabSync | null = null;

export function initializeCrossTabSync(): CrossTabSync {
  if (!syncInstance) {
    syncInstance = new CrossTabSync();
    syncInstance.initialize();
  }
  return syncInstance;
}

export function getCrossTabSync(): CrossTabSync | null {
  return syncInstance;
}

export function cleanupCrossTabSync(): void {
  if (syncInstance) {
    syncInstance.cleanup();
    syncInstance = null;
  }
}
