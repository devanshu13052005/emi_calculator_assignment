import {
  EMIInput,
  EMIOutput,
  AmortizationRow,
  ComparisonLoan,
  ComparisonResult,
  PrepaymentEntry,
  PrepaymentResult,
} from './types';

/**
 * Calculate standard EMI using the formula:
 * EMI = P * r * (1 + r)^n / ((1 + r)^n - 1)
 * where P = principal, r = monthly rate, n = number of months
 */
export function calculateEMI(input: EMIInput): EMIOutput {
  const { principal, rate, tenure } = input;

  // Validate inputs
  if (principal <= 0 || tenure <= 0) {
    return {
      emi: 0,
      totalAmount: principal,
      totalInterest: 0,
    };
  }

  if (rate <= 0) {
    // Simple division for 0% interest
    const emi = principal / tenure;
    return {
      emi,
      totalAmount: principal,
      totalInterest: 0,
    };
  }

  const monthlyRate = rate / 100 / 12;
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, tenure);
  const denominator = Math.pow(1 + monthlyRate, tenure) - 1;
  const emi = numerator / denominator;

  const totalAmount = emi * tenure;
  const totalInterest = totalAmount - principal;

  return {
    emi: Number(emi.toFixed(2)),
    totalAmount: Number(totalAmount.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
  };
}

/**
 * Generate complete amortization schedule
 */
export function generateAmortizationSchedule(
  input: EMIInput,
  prepayments: PrepaymentEntry[] = []
): AmortizationRow[] {
  const { principal, rate, tenure } = input;
  const monthlyRate = rate / 100 / 12;
  const emiOutput = calculateEMI(input);
  const emi = emiOutput.emi;

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let month = 1;

  // Create a map for quick prepayment lookup
  const prepaymentMap = new Map(prepayments.map((p) => [p.month, p.amount]));

  while (balance > 0 && month <= tenure * 2) {
    // Safety check to prevent infinite loops
    const interestPayment = Number((balance * monthlyRate).toFixed(2));
    let principalPayment = Number((emi - interestPayment).toFixed(2));

    // Handle prepayment if any
    const prepaymentAmount = prepaymentMap.get(month) || 0;
    principalPayment += prepaymentAmount;

    // Adjust for final payment
    if (balance - principalPayment < 0.01) {
      principalPayment = balance;
    }

    balance = Number((balance - principalPayment).toFixed(2));

    schedule.push({
      month,
      principalPayment,
      interestPayment,
      emi: Number((interestPayment + principalPayment).toFixed(2)),
      balance: Math.max(0, balance),
    });

    if (balance <= 0) break;
    month++;
  }

  return schedule;
}

/**
 * Calculate prepayment impact
 */
export function calculatePrepayment(
  input: EMIInput,
  prepayments: PrepaymentEntry[]
): PrepaymentResult {
  const originalOutput = calculateEMI(input);
  const schedule = generateAmortizationSchedule(input, prepayments);

  const newTenure = schedule.length;
  const originalTenure = input.tenure;
  const totalAmount = schedule.reduce((sum, row) => sum + row.emi, 0);
  const totalInterest = schedule.reduce((sum, row) => sum + row.interestPayment, 0);

  return {
    emi: originalOutput.emi,
    totalAmount: Number(totalAmount.toFixed(2)),
    totalInterest: Number(totalInterest.toFixed(2)),
    originalTenure,
    newTenure,
    tenureReduction: originalTenure - newTenure,
    interestSavings: Number(
      (originalOutput.totalInterest - totalInterest).toFixed(2)
    ),
    amortizationSchedule: schedule,
  };
}

/**
 * Compare two loans
 */
export function compareTwoLoans(
  loan1: ComparisonLoan,
  loan2: ComparisonLoan
): ComparisonResult {
  const output1 = calculateEMI(loan1);
  const output2 = calculateEMI(loan2);

  const timeDifference = Math.abs(loan2.tenure - loan1.tenure);
  const costDifference = Math.abs(output2.totalAmount - output1.totalAmount);
  const interestDifference = Math.abs(output2.totalInterest - output1.totalInterest);
  const emiDifference = Math.abs(output2.emi - output1.emi);

  return {
    loan1,
    loan2,
    output1,
    output2,
    timeDifference,
    costDifference,
    interestDifference,
    emiDifference,
  };
}

/**
 * Compare three loans
 */
export function compareThreeLoans(
  loans: ComparisonLoan[]
): { pair1: ComparisonResult; pair2: ComparisonResult; pair3: ComparisonResult } {
  if (loans.length !== 3) {
    throw new Error('Three loans comparison requires exactly 3 loans');
  }

  return {
    pair1: compareTwoLoans(loans[0], loans[1]),
    pair2: compareTwoLoans(loans[1], loans[2]),
    pair3: compareTwoLoans(loans[0], loans[2]),
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format number with commas for display
 */
export function formatNumber(num: number, decimals = 2): string {
  return Number(num.toFixed(decimals)).toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse currency string to number
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
