'use client';

import { calculateEMI } from '@/lib/calculations';

interface SensitivityGridProps {
  principal: number;
  rate: number;
  tenure: number;
}

export function SensitivityGrid({ principal, rate, tenure }: SensitivityGridProps) {
  const rateVariations = [-2, -1, 0, 1, 2, 3, 4];
  const tenureVariations = [
    { label: '2 yr', months: 24 },
    { label: '3 yr', months: 36 },
    { label: '3 yr 6 mo', months: 42 },
    { label: '4 yr', months: 48 },
    { label: '4 yr 6 mo', months: 54 },
    { label: '5 yr', months: 60 },
    { label: '6 yr', months: 72 },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const currentEMI = calculateEMI({ principal, rate, tenure }).emi;
  const currentMonths = tenure;

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="mb-4">
        <h4 className="text-sm font-medium text-foreground mb-1">Sensitivity Analysis</h4>
        <p className="text-xs text-muted-foreground">EMI across rate × tenure – current values highlighted</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="text-left px-2 py-2 font-semibold text-foreground border-b border-border">Tenure \ Rate</th>
              {rateVariations.map((variation) => (
                <th
                  key={variation}
                  className="text-center px-2 py-2 font-semibold text-foreground border-b border-border whitespace-nowrap"
                >
                  {rate + variation}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenureVariations.map((tenureItem) => (
              <tr key={tenureItem.months}>
                <td className="px-2 py-2 font-medium text-foreground border-b border-border whitespace-nowrap">
                  {tenureItem.label}
                </td>
                {rateVariations.map((rateVar) => {
                  const newRate = rate + rateVar;
                  const newTenure = tenureItem.months;
                  const emi = calculateEMI({ principal, rate: newRate, tenure: newTenure }).emi;
                  const isCurrent = Math.abs(newRate - rate) < 0.1 && newTenure === currentMonths;

                  return (
                    <td
                      key={`${tenureItem.months}-${rateVar}`}
                      className={`text-center px-2 py-2 border-b border-border ${
                        isCurrent
                          ? 'bg-primary/10 text-primary font-semibold rounded'
                          : 'text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {formatCurrency(emi)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
