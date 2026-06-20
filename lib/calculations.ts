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
 * EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
 * where P = principal, r = monthly rate, n = number of months
 *
 * Special case: if rate === 0, then EMI = P / n
 */
export function calculateEMI(input: EMIInput): EMIOutput {
  const { principal, rate, tenure } = input;

  // Validate inputs
  if (principal <= 0 || tenure <= 0) {
    return {
      emi: 0,
      totalAmount: principal,
      totalInterest: 0,
      principalPercent: 100,
      interestPercent: 0,
    };
  }

  if (rate <= 0) {
    // Simple division for 0% interest
    const emi = principal / tenure;
    return {
      emi,
      totalAmount: principal,
      totalInterest: 0,
      principalPercent: 100,
      interestPercent: 0,
    };
  }

  const monthlyRate = rate / 12 / 100;
  const powerTerm = Math.pow(1 + monthlyRate, tenure);
  const numerator = principal * monthlyRate * powerTerm;
  const denominator = powerTerm - 1;
  const emi = numerator / denominator;

  const totalAmount = emi * tenure;
  const totalInterest = totalAmount - principal;

  // Percentages based on total payable (NOT on principal)
  const principalPercent = (principal / totalAmount) * 100;
  const interestPercent = (totalInterest / totalAmount) * 100;

  return {
    emi,
    totalAmount,
    totalInterest,
    principalPercent,
    interestPercent,
  };
}

/**
 * Generate complete amortization schedule using reducing-balance method.
 *
 * Prepayment strategy: reduce-tenure (EMI stays fixed, loan ends sooner).
 * Prepayments are applied at the START of the scheduled month, BEFORE interest
 * is charged on the remaining balance.
 *
 * Edge cases handled:
 * - Prepayment > remaining balance → capped at balance, loan ends that month
 * - Multiple prepayments in same month → summed
 * - Prepayment month > tenure → ignored
 */
export function generateAmortizationSchedule(
  input: EMIInput,
  prepayments: PrepaymentEntry[] = []
): AmortizationRow[] {
  const { principal, rate, tenure } = input;
  const monthlyRate = rate / 12 / 100;
  const emiOutput = calculateEMI(input);
  const emi = emiOutput.emi;

  const schedule: AmortizationRow[] = [];
  let balance = principal;
  let cumulativePrincipal = 0;
  let cumulativeInterest = 0;
  let breakEvenFound = false;

  // Aggregate prepayments by month (sum multiple entries for same month)
  const prepaymentMap = new Map<number, number>();
  for (const p of prepayments) {
    const existing = prepaymentMap.get(p.month) || 0;
    prepaymentMap.set(p.month, existing + p.amount);
  }

  for (let month = 1; month <= tenure * 2 && balance > 0.01; month++) {
    // Step 1: Apply prepayment FIRST, before interest is charged
    let prepaymentAmount = prepaymentMap.get(month) || 0;
    // Cap prepayment at remaining balance
    prepaymentAmount = Math.min(prepaymentAmount, balance);
    balance = balance - prepaymentAmount;

    // If prepayment wiped out the balance entirely
    if (balance <= 0.01) {
      cumulativePrincipal += prepaymentAmount;

      const isBreakEven = !breakEvenFound && cumulativePrincipal >= cumulativeInterest;
      if (isBreakEven) breakEvenFound = true;

      schedule.push({
        month,
        principalPayment: 0,
        interestPayment: 0,
        prepaymentAmount,
        emi: 0,
        balance: 0,
        cumulativePrincipal,
        cumulativeInterest,
        isBreakEven,
      });
      break;
    }

    // Step 2: Calculate interest on the (possibly reduced) balance
    const interestPayment = balance * monthlyRate;
    let principalPayment = emi - interestPayment;

    // Adjust for final payment — if principal portion exceeds balance
    if (principalPayment >= balance) {
      principalPayment = balance;
    }

    balance = balance - principalPayment;
    if (balance < 0.01) balance = 0;

    cumulativePrincipal += principalPayment + prepaymentAmount;
    cumulativeInterest += interestPayment;

    const isBreakEven = !breakEvenFound && cumulativePrincipal >= cumulativeInterest;
    if (isBreakEven) breakEvenFound = true;

    schedule.push({
      month,
      principalPayment,
      interestPayment,
      prepaymentAmount,
      emi: interestPayment + principalPayment,
      balance: Math.max(0, balance),
      cumulativePrincipal,
      cumulativeInterest,
      isBreakEven,
    });

    if (balance <= 0) break;
  }

  return schedule;
}

/**
 * Calculate prepayment impact by comparing original vs prepayment schedules.
 *
 * interestSaved = originalTotalInterest - newTotalInterest
 * tenureReduced = originalSchedule.length - prepaymentSchedule.length
 */
export function calculatePrepayment(
  input: EMIInput,
  prepayments: PrepaymentEntry[]
): PrepaymentResult {
  const originalOutput = calculateEMI(input);
  const originalSchedule = generateAmortizationSchedule(input, []);
  const prepaymentSchedule = generateAmortizationSchedule(input, prepayments);

  const originalTotalInterest = originalSchedule.reduce(
    (sum, row) => sum + row.interestPayment,
    0
  );
  const newTotalInterest = prepaymentSchedule.reduce(
    (sum, row) => sum + row.interestPayment,
    0
  );

  const originalTenure = originalSchedule.length;
  const newTenure = prepaymentSchedule.length;

  const newTotalAmount = prepaymentSchedule.reduce(
    (sum, row) => sum + row.emi + row.prepaymentAmount,
    0
  );

  return {
    emi: originalOutput.emi,
    totalAmount: newTotalAmount,
    totalInterest: newTotalInterest,
    principalPercent: originalOutput.principalPercent,
    interestPercent: originalOutput.interestPercent,
    originalTenure,
    newTenure,
    tenureReduction: originalTenure - newTenure,
    interestSavings: originalTotalInterest - newTotalInterest,
    amortizationSchedule: prepaymentSchedule,
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
 * Format currency for display using Indian number system.
 * All values rounded to nearest integer at display time.
 */
export function formatCurrency(amount: number, locale = 'en-IN'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
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
