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
      <div>
        <h3 className="text-lg font-bold text-foreground mb-1">Summary</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase">Monthly EMI</div>
          <div className="font-bold text-[clamp(20px,5vw,28px)]" style={{ color: 'var(--color-emi)' }}>{formatCurrency(monthlyEMI)}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase">Total Interest</div>
          <div className="font-bold text-[clamp(20px,5vw,28px)]" style={{ color: 'var(--color-interest)' }}>{formatCurrency(totalInterest)}</div>
        </div>

        <div className="bg-card border border-border rounded-lg p-4">
          <div className="text-xs font-medium text-muted-foreground mb-2 uppercase">Total Payable</div>
          <div className="font-bold text-foreground text-[clamp(20px,5vw,28px)]">{formatCurrency(totalAmount)}</div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        <div>
          <h4 className="text-sm font-bold text-foreground mb-1">Principal vs Interest</h4>
          <p className="text-xs text-muted-foreground">Formula: (Principal / Total Payable) x 100</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="principal-bar flex-1 bg-muted overflow-hidden flex shadow-inner">
            <div
              className="principal-segment flex items-center justify-center"
              style={{
                width: `${principalPercentage}%`,
                minWidth: principalPercentage > 5 ? 'auto' : '0',
              }}
              title={`Principal: ${formatCurrency(principal)} (${principalPercentage.toFixed(1)}%)`}
            >
              {principalPercentage > 15 && (
                <span className="text-[10px] font-bold" style={{ color: 'var(--text-secondary)' }}>{principalPercentage.toFixed(0)}%</span>
              )}
            </div>
            <div
              className="interest-segment flex items-center justify-center"
              style={{
                width: `${interestPercentage}%`,
                minWidth: interestPercentage > 5 ? 'auto' : '0',
              }}
              title={`Interest: ${formatCurrency(totalInterest)} (${interestPercentage.toFixed(1)}%)`}
            >
              {interestPercentage > 15 && (
                <span className="text-[10px] font-bold text-white">{interestPercentage.toFixed(0)}%</span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-chart-principal)' }} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.08em]">Principal</span>
            </div>
            <div className="text-sm font-bold" style={{ color: 'var(--color-principal)' }}>{formatCurrency(principal)}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{principalPercentage.toFixed(1)}%</div>
          </div>
          <div className="bg-muted border border-border rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: 'var(--color-interest)' }} />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.08em]">Interest</span>
            </div>
            <div className="text-sm font-bold" style={{ color: 'var(--color-interest)' }}>{formatCurrency(totalInterest)}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{interestPercentage.toFixed(1)}%</div>
          </div>
        </div>
      </div>
    </div>
  );
}
