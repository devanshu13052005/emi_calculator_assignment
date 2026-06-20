'use client';

import { EMIOutput } from '@/lib/types';
import { formatCurrency, formatNumber } from '@/lib/calculations';

interface EMIOutputProps {
  output: EMIOutput | null;
  title?: string;
}

export function EMIOutputComponent({ output, title = 'EMI Summary' }: EMIOutputProps) {
  if (!output) {
    return (
      <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
        No calculation available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Monthly EMI */}
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Monthly EMI</p>
          <p className="text-2xl font-bold text-primary">
            {formatCurrency(output.emi)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            {formatNumber(output.emi, 2)} per month
          </p>
        </div>

        {/* Total Amount */}
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">Total Amount</p>
          <p className="text-2xl font-bold text-accent">
            {formatCurrency(output.totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Payable over loan tenure
          </p>
        </div>

        {/* Total Interest */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm font-medium text-muted-foreground mb-1">
            Total Interest
          </p>
          <p className="text-2xl font-bold text-destructive">
            {formatCurrency(output.totalInterest)}
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Cost of borrowing
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Principal Amount:</span>
          <span className="font-medium text-foreground">
            {formatCurrency(output.totalAmount - output.totalInterest)}
          </span>
        </div>
        <div className="flex justify-between text-sm border-t border-muted pt-2">
          <span className="text-muted-foreground">Interest Cost:</span>
          <span className="font-medium text-foreground">
            {formatCurrency(output.totalInterest)}
          </span>
        </div>
        <div className="flex justify-between text-sm text-xs pt-2">
          <span className="text-muted-foreground">Interest %:</span>
          <span className="font-medium text-foreground">
            {formatNumber(output.interestPercent, 2)}%
          </span>
        </div>
      </div>
    </div>
  );
}
