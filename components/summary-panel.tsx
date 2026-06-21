'use client';

interface SummaryPanelProps {
  monthlyEMI: number;
  totalInterest: number;
  totalAmount: number;
  principal: number;
}

export function SummaryPanel({
  monthlyEMI,
  totalInterest,
  totalAmount,
  principal,
}: SummaryPanelProps) {
  const principalPercentage = (principal / totalAmount) * 100;
  const interestPercentage = (totalInterest / totalAmount) * 100;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-1">Summary</h3>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase">Monthly EMI</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-emi)' }}>{formatCurrency(monthlyEMI)}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase">Total Interest</div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-interest)' }}>{formatCurrency(totalInterest)}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase">Total Payable</div>
          <div className="text-2xl font-bold text-foreground">{formatCurrency(totalAmount)}</div>
        </div>
      </div>

      {/* Principal vs Interest Breakdown */}
      <div className="bg-card border border-border rounded-lg p-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-foreground mb-1">Principal vs Interest</h4>
          <p className="text-xs text-muted-foreground">Formula: (Principal ÷ Total Payable) × 100</p>
        </div>
        
        {/* Stacked Bar Chart */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-10 bg-muted rounded-full overflow-hidden flex shadow-inner">
            {/* Principal Segment */}
            <div
              className="transition-all duration-500 flex items-center justify-center"
              style={{ 
                width: `${principalPercentage}%`, 
                minWidth: principalPercentage > 5 ? 'auto' : '0',
                backgroundColor: 'var(--color-principal)'
              }}
              title={`Principal: ${formatCurrency(principal)} (${principalPercentage.toFixed(1)}%)`}
            >
              {principalPercentage > 15 && (
                <span className="text-xs font-bold text-background mix-blend-exclusion">{principalPercentage.toFixed(0)}%</span>
              )}
            </div>
            {/* Interest Segment */}
            <div
              className="transition-all duration-500 flex items-center justify-center"
              style={{ 
                width: `${interestPercentage}%`, 
                minWidth: interestPercentage > 5 ? 'auto' : '0',
                backgroundColor: 'var(--color-interest)'
              }}
              title={`Interest: ${formatCurrency(totalInterest)} (${interestPercentage.toFixed(1)}%)`}
            >
              {interestPercentage > 15 && (
                <span className="text-xs font-bold text-white">{interestPercentage.toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Legend with Values */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-principal)' }}></div>
              <span className="text-xs font-medium text-muted-foreground uppercase">Principal</span>
            </div>
            <div className="text-sm font-bold text-foreground">{formatCurrency(principal)}</div>
            <div className="text-xs text-muted-foreground mt-1">{principalPercentage.toFixed(1)}%</div>
          </div>
          <div className="bg-muted border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-interest)' }}></div>
              <span className="text-xs font-medium text-muted-foreground uppercase">Interest</span>
            </div>
            <div className="text-sm font-bold text-foreground">{formatCurrency(totalInterest)}</div>
            <div className="text-xs text-muted-foreground mt-1">{interestPercentage.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
