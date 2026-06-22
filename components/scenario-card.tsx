'use client';

import { calculateEMI } from '@/lib/calculations';
import { SyncedSlider } from '@/components/synced-slider';
import { ComparisonLoan } from '@/lib/types';

interface ScenarioCardProps {
  loan: ComparisonLoan;
  onUpdate: (updates: Partial<ComparisonLoan>) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  isBestValue?: boolean;
}

export function ScenarioCard({
  loan,
  onUpdate,
  onRemove,
  showRemove = false,
  isBestValue = false,
}: ScenarioCardProps) {
  const calculation = calculateEMI({ principal: loan.principal, rate: loan.rate, tenure: loan.tenure });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      className={`relative border rounded-lg p-6 transition-all ${
        isBestValue
          ? 'border-2 bg-green-50 dark:bg-muted shadow-lg'
          : 'border-border bg-card'
      }`}
      style={isBestValue ? { borderColor: 'var(--color-interest-saved)' } : undefined}
    >
      {/* Best Value Badge */}
      {isBestValue && (
        <div className="absolute -top-3 left-4">
          <span className="text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#dcfce7', color: '#166534', fontWeight: 700 }}>
            BEST VALUE
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-4 pt-2">
        <div className="flex-1">
          <input
            type="text"
            value={loan.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="text-lg font-bold text-foreground bg-transparent border-none focus:outline-none focus:ring-0 p-0 w-full"
          />
        </div>
        {showRemove && (
          <button
            onClick={onRemove}
            className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded hover:bg-destructive/20"
          >
            Remove
          </button>
        )}
      </div>

      {/* Sliders */}
      <div className="space-y-4 mb-6 pb-6 border-b border-border">
        <SyncedSlider
          label="Amount"
          value={loan.principal}
          onChange={(value) => onUpdate({ principal: value })}
          min={10000}
          max={5000000}
          step={10000}
          prefix="₹"
          showInput={true}
        />

        <SyncedSlider
          label="Rate"
          value={loan.rate}
          onChange={(value) => onUpdate({ rate: value })}
          min={1}
          max={36}
          step={0.1}
          suffix="%"
          showInput={true}
        />

        <SyncedSlider
          label="Tenure"
          value={loan.tenure}
          onChange={(value) => onUpdate({ tenure: value })}
          min={1}
          max={84}
          step={1}
          suffix="mo"
          showInput={true}
        />
      </div>

      {/* Results */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Monthly EMI</span>
          <span className="text-lg font-bold" style={{ color: 'var(--color-emi)' }}>
            {formatCurrency(calculation.emi)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Interest</span>
          <span className="text-lg font-semibold" style={{ color: 'var(--color-interest)' }}>
            {formatCurrency(calculation.totalInterest)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Payable</span>
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(calculation.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
