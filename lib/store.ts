'use client';

import { create } from 'zustand';
import { AppState, EMIInput, ComparisonLoan, PrepaymentEntry } from './types';
import {
  calculateEMI,
  compareTwoLoans,
  calculatePrepayment,
} from './calculations';

const DEFAULT_SINGLE_LOAN: EMIInput = {
  principal: 1000000,
  rate: 8.5,
  tenure: 48, // 4 years in months (max 84)
};

const DEFAULT_COMPARISON_LOAN: ComparisonLoan = {
  id: '',
  name: '',
  principal: 1000000,
  rate: 8.5,
  tenure: 60, // 5 years in months
};

const clampTenure = (value: number) => Math.min(84, Math.max(1, Math.round(value)));

const clampLoanTenure = <T extends EMIInput>(loan: T): T => ({
  ...loan,
  tenure: clampTenure(loan.tenure),
});

const INITIAL_STATE: AppState = {
  singleLoan: DEFAULT_SINGLE_LOAN,
  singleOutput: calculateEMI(DEFAULT_SINGLE_LOAN),

  comparisonLoans: [],
  comparisonResults: null,

  prepaymentLoan: DEFAULT_SINGLE_LOAN,
  prepaymentEntries: [],
  prepaymentResult: null,

  activeTab: 'single',
  comparisonCount: 2,

  theme: 'light',

  history: [],
  historyIndex: -1,

  urlState: null,
  isTabLeader: false,
  lastUpdate: Date.now(),
};

interface StoreActions {
  // Single EMI Mode
  updateSingleLoan: (updates: Partial<EMIInput>) => void;
  resetSingleLoan: () => void;

  // Comparison Mode
  updateComparisonLoans: (loans: ComparisonLoan[]) => void;
  updateComparisonLoan: (id: string, updates: Partial<ComparisonLoan>) => void;
  addComparisonLoan: () => void;
  removeComparisonLoan: (id: string) => void;
  setComparisonCount: (count: 2 | 3) => void;

  // Prepayment Mode
  updatePrepaymentLoan: (updates: Partial<EMIInput>) => void;
  updatePrepaymentEntries: (entries: PrepaymentEntry[]) => void;
  addPrepaymentEntry: (entry: PrepaymentEntry) => void;
  removePrepaymentEntry: (month: number) => void;

  // Tab Navigation
  setActiveTab: (tab: 'single' | 'compare' | 'prepayment') => void;

  // Theme
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;
  clearHistory: () => void;

  // URL State
  setUrlState: (state: string) => void;
  loadFromUrl: (state: string) => void;

  // Tab Leadership
  setTabLeader: (isLeader: boolean) => void;
  updateLastUpdate: () => void;

  // Cross-tab sync
  replaceState: (state: Partial<AppState>) => void;

  // General
  resetState: () => void;
}

export const useEMIStore = create<AppState & StoreActions>()(
  (set, get) => ({
    ...INITIAL_STATE,

    // Single EMI Mode
    updateSingleLoan: (updates) =>
      set((state) => {
        let newTenure = updates.tenure;
        if (newTenure !== undefined) {
          newTenure = clampTenure(newTenure);
        }
        const newLoan = { ...state.singleLoan, ...updates, ...(newTenure !== undefined && { tenure: newTenure }) };
        return {
          singleLoan: newLoan,
          singleOutput: calculateEMI(newLoan),
          lastUpdate: Date.now(),
        };
      }),

    resetSingleLoan: () =>
      set({
        singleLoan: DEFAULT_SINGLE_LOAN,
        singleOutput: calculateEMI(DEFAULT_SINGLE_LOAN),
      }),

    // Comparison Mode
    updateComparisonLoans: (loans) =>
      set((state) => {
        const clampedLoans = loans.map(clampLoanTenure);
        const comparisonResults =
          clampedLoans.length === 2 ? compareTwoLoans(clampedLoans[0], clampedLoans[1]) : null;
        return {
          comparisonLoans: clampedLoans,
          comparisonResults,
          lastUpdate: Date.now(),
        };
      }),

    updateComparisonLoan: (id, updates) =>
      set((state) => {
        let newTenure = updates.tenure;
        if (newTenure !== undefined) {
          newTenure = clampTenure(newTenure);
        }
        const newLoans = state.comparisonLoans.map((loan) =>
          loan.id === id ? { ...loan, ...updates, ...(newTenure !== undefined && { tenure: newTenure }) } : loan
        );
        const comparisonResults =
          newLoans.length === 2
            ? compareTwoLoans(newLoans[0], newLoans[1])
            : null;
        return {
          comparisonLoans: newLoans,
          comparisonResults,
          lastUpdate: Date.now(),
        };
      }),

    addComparisonLoan: () =>
      set((state) => {
        const newId = `loan-${Date.now()}`;
        const loanCount = state.comparisonLoans.length + 1;
        const newLoans = [
          ...state.comparisonLoans,
          { ...DEFAULT_COMPARISON_LOAN, id: newId, name: `Loan ${loanCount}` },
        ];
        return {
          comparisonLoans: newLoans,
          lastUpdate: Date.now(),
        };
      }),

    removeComparisonLoan: (id) =>
      set((state) => {
        const newLoans = state.comparisonLoans.filter((loan) => loan.id !== id);
        const comparisonResults =
          newLoans.length === 2
            ? compareTwoLoans(newLoans[0], newLoans[1])
            : null;
        return {
          comparisonLoans: newLoans,
          comparisonResults,
          lastUpdate: Date.now(),
        };
      }),

    setComparisonCount: (count) =>
      set({
        comparisonCount: count,
        comparisonLoans: [],
        comparisonResults: null,
      }),

    // Prepayment Mode
    updatePrepaymentLoan: (updates) =>
      set((state) => {
        let newTenure = updates.tenure;
        if (newTenure !== undefined) {
          newTenure = clampTenure(newTenure);
        }
        const newLoan = { ...state.prepaymentLoan, ...updates, ...(newTenure !== undefined && { tenure: newTenure }) };
        const prepaymentResult = calculatePrepayment(
          newLoan,
          state.prepaymentEntries
        );
        return {
          prepaymentLoan: newLoan,
          prepaymentResult,
          lastUpdate: Date.now(),
        };
      }),

    updatePrepaymentEntries: (entries) =>
      set((state) => {
        const prepaymentResult = calculatePrepayment(
          state.prepaymentLoan,
          entries
        );
        return {
          prepaymentEntries: entries,
          prepaymentResult,
          lastUpdate: Date.now(),
        };
      }),

    addPrepaymentEntry: (entry) =>
      set((state) => {
        const newEntries = [...state.prepaymentEntries, entry];
        const prepaymentResult = calculatePrepayment(
          state.prepaymentLoan,
          newEntries
        );
        return {
          prepaymentEntries: newEntries,
          prepaymentResult,
          lastUpdate: Date.now(),
        };
      }),

    removePrepaymentEntry: (month) =>
      set((state) => {
        const newEntries = state.prepaymentEntries.filter((e) => e.month !== month);
        const prepaymentResult = calculatePrepayment(
          state.prepaymentLoan,
          newEntries
        );
        return {
          prepaymentEntries: newEntries,
          prepaymentResult,
          lastUpdate: Date.now(),
        };
      }),

    // Tab Navigation
    setActiveTab: (tab) => set({ activeTab: tab, lastUpdate: Date.now() }),

    // Theme
    setTheme: (theme) => set({ theme, lastUpdate: Date.now() }),
    toggleTheme: () =>
      set((state) => ({
        theme: state.theme === 'light' ? 'dark' : 'light',
        lastUpdate: Date.now(),
      })),

    // Undo/Redo (simplified version)
    undo: () => {
      const state = get();
      if (state.historyIndex > 0) {
        const previousState = state.history[state.historyIndex - 1];
        const { historyIndex, ...restoredState } = previousState;
        set({
          ...restoredState,
          historyIndex: state.historyIndex - 1,
        });
      }
    },

    redo: () => {
      const state = get();
      if (state.historyIndex < state.history.length - 1) {
        const nextState = state.history[state.historyIndex + 1];
        const { historyIndex, ...restoredState } = nextState;
        set({
          ...restoredState,
          historyIndex: state.historyIndex + 1,
        });
      }
    },

    clearHistory: () =>
      set({
        history: [],
        historyIndex: -1,
      }),

    // URL State
    setUrlState: (urlState) => set({ urlState }),

    loadFromUrl: (urlState) => {
      try {
        const decoded = JSON.parse(atob(urlState)) as Partial<AppState>;
        const singleLoan = decoded.singleLoan
          ? clampLoanTenure(decoded.singleLoan)
          : INITIAL_STATE.singleLoan;

        set({
          singleLoan,
          singleOutput: calculateEMI(singleLoan),
          activeTab: decoded.activeTab || 'single',
          lastUpdate: Date.now(),
        });
      } catch (e) {
        console.error('Failed to load state from URL', e);
      }
    },

    // Tab Leadership
    setTabLeader: (isLeader) => set({ isTabLeader: isLeader }),
    updateLastUpdate: () => set({ lastUpdate: Date.now() }),

    // Cross-tab sync: replace entire state from another tab
    replaceState: (incoming) => {
      // Merge the incoming state, skipping history and internal fields
      const { history, historyIndex, isTabLeader, ...syncableState } = incoming as AppState;
      if (syncableState.singleLoan) {
        syncableState.singleLoan = clampLoanTenure(syncableState.singleLoan);
      }
      if (syncableState.prepaymentLoan) {
        syncableState.prepaymentLoan = clampLoanTenure(syncableState.prepaymentLoan);
      }
      if (syncableState.comparisonLoans) {
        syncableState.comparisonLoans = syncableState.comparisonLoans.map(clampLoanTenure);
      }
      if (syncableState.singleLoan) {
        syncableState.singleOutput = calculateEMI(syncableState.singleLoan);
      }
      if (syncableState.prepaymentLoan) {
        syncableState.prepaymentResult = calculatePrepayment(
          syncableState.prepaymentLoan,
          syncableState.prepaymentEntries || []
        );
      }
      set({
        ...syncableState,
        lastUpdate: Date.now(),
      });
    },

    // General
    resetState: () => set(INITIAL_STATE),
  })
);
