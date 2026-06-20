'use client';

import { EMIInput } from '@/lib/types';
import { formatNumber } from '@/lib/calculations';

interface EMIInputProps {
  value: EMIInput;
  onChange: (updates: Partial<EMIInput>) => void;
  showLabel?: boolean;
}

export function EMIInputComponent({ value, onChange, showLabel = true }: EMIInputProps) {
  return (
    <div className="space-y-6">
      {/* Principal Input */}
      <div>
        {showLabel && (
          <label className="block text-sm font-medium text-foreground mb-2">
            Loan Amount (Principal)
          </label>
        )}
        <div className="relative">
          <span className="absolute left-3 top-3 text-foreground/60">₹</span>
          <input
            type="number"
            value={value.principal}
            onChange={(e) =>
              onChange({ principal: parseFloat(e.target.value) || 0 })
            }
            className="w-full pl-7 pr-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter principal amount"
            min="1"
            step="10000"
          />
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatNumber(value.principal, 0)}
        </p>
      </div>

      {/* Interest Rate Input */}
      <div>
        {showLabel && (
          <label className="block text-sm font-medium text-foreground mb-2">
            Annual Interest Rate (%)
          </label>
        )}
        <div className="relative">
          <input
            type="number"
            value={value.rate}
            onChange={(e) => onChange({ rate: parseFloat(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter interest rate"
            min="0"
            step="0.1"
            max="50"
          />
          <span className="absolute right-3 top-3 text-foreground/60">%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {formatNumber(value.rate, 2)}%
        </p>
      </div>

      {/* Tenure Input */}
      <div>
        {showLabel && (
          <label className="block text-sm font-medium text-foreground mb-2">
            Loan Tenure (Months)
          </label>
        )}
        <div className="relative">
          <input
            type="number"
            value={value.tenure}
            onChange={(e) => onChange({ tenure: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Enter tenure"
            min="1"
            step="1"
            max="600"
          />
          <span className="absolute right-3 top-3 text-foreground/60">months</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          {Math.round(value.tenure / 12)} years {value.tenure % 12} months
        </p>
      </div>
    </div>
  );
}
