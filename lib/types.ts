// Core EMI Calculation Types
export interface EMIInput {
  principal: number; // Loan amount in currency
  rate: number; // Annual interest rate (%)
  tenure: number; // Loan tenure (months)
}

export interface EMIOutput {
  emi: number; // Monthly EMI amount
  totalAmount: number; // Total amount to be paid
  totalInterest: number; // Total interest amount
  principalPercent: number; // Principal share %
  interestPercent: number; // Interest share %
}

export interface AmortizationRow {
  month: number;
  principalPayment: number;
  interestPayment: number;
  prepaymentAmount: number;
  emi: number;
  balance: number;
  cumulativePrincipal: number;
  cumulativeInterest: number;
  isBreakEven: boolean;
}

// Comparison Mode Types
export interface ComparisonLoan extends EMIInput {
  id: string;
  name: string;
}

export interface ComparisonResult {
  loan1: ComparisonLoan;
  loan2: ComparisonLoan;
  output1: EMIOutput;
  output2: EMIOutput;
  timeDifference: number; // months
  costDifference: number; // currency
  interestDifference: number; // currency
  emiDifference: number; // currency
}

// Prepayment Mode Types
export interface PrepaymentEntry {
  month: number;
  amount: number;
}

export interface PrepaymentResult extends EMIOutput {
  originalTenure: number;
  newTenure: number;
  tenureReduction: number; // months
  interestSavings: number; // currency
  amortizationSchedule: AmortizationRow[];
}

// Store State Types
export interface AppState {
  // Single EMI Mode
  singleLoan: EMIInput;
  singleOutput: EMIOutput | null;

  // Comparison Mode
  comparisonLoans: ComparisonLoan[];
  comparisonResults: ComparisonResult | null;

  // Prepayment Mode
  prepaymentLoan: EMIInput;
  prepaymentEntries: PrepaymentEntry[];
  prepaymentResult: PrepaymentResult | null;

  // UI State
  activeTab: 'single' | 'compare' | 'prepayment';
  comparisonCount: number; // 2 or 3

  // Theme
  theme: 'light' | 'dark';

  // Undo/Redo History
  history: AppState[];
  historyIndex: number;

  // URL State
  urlState: string | null;

  // Tab Leadership
  isTabLeader: boolean;
  lastUpdate: number; // timestamp
}

// Cross-Tab Sync Message
export interface SyncMessage {
  type: 'STATE_UPDATE' | 'REQUEST_STATE' | 'STATE_RESPONSE' | 'HEARTBEAT';
  senderId: string;
  payload?: Partial<AppState>;
  timestamp: number;
}

// Action Types for Store
export interface UpdateSingleLoanAction {
  type: 'UPDATE_SINGLE_LOAN';
  payload: Partial<EMIInput>;
}

export interface UpdateComparisonLoansAction {
  type: 'UPDATE_COMPARISON_LOANS';
  payload: ComparisonLoan[];
}

export interface UpdatePrepaymentAction {
  type: 'UPDATE_PREPAYMENT_LOAN';
  payload: Partial<EMIInput>;
}

export interface UpdatePrepaymentEntriesAction {
  type: 'UPDATE_PREPAYMENT_ENTRIES';
  payload: PrepaymentEntry[];
}

export interface SetActiveTabAction {
  type: 'SET_ACTIVE_TAB';
  payload: 'single' | 'compare' | 'prepayment';
}

export interface ResetStateAction {
  type: 'RESET_STATE';
  payload?: never;
}

export interface ReplaceStateAction {
  type: 'REPLACE_STATE';
  payload: AppState;
}

export type StoreAction =
  | UpdateSingleLoanAction
  | UpdateComparisonLoansAction
  | UpdatePrepaymentAction
  | UpdatePrepaymentEntriesAction
  | SetActiveTabAction
  | ResetStateAction
  | ReplaceStateAction;

// Calculation Result Cache
export interface CalculationCache {
  input: EMIInput;
  output: EMIOutput;
  timestamp: number;
}
