'use client';

import { calculateEMI } from '@/lib/calculations';

interface SensitivityGridProps {
  principal: number;
  rate: number;
  tenure: number;
}

export function SensitivityGrid({ principal, rate, tenure }: SensitivityGridProps) {
  // Use exact rate and tenure offsets as per assignment
  const rateOffsets = [-3, -2, -1, 0, 1, 2, 3];
  const tenureOffsets = [-24, -12, -6, 0, 6, 12, 24];

  // Calculate actual bounds, clamp them, and deduplicate
  const rateVariations = Array.from(new Set(
    rateOffsets
      .map(offset => rate + offset)
      .map(r => Math.max(1, Math.min(36, r))) // Clamp to 1% - 36%
  )).sort((a, b) => a - b);

  const tenureVariations = Array.from(new Set(
    tenureOffsets
      .map(offset => tenure + offset)
      .map(t => Math.max(1, Math.min(84, t))) // Clamp to 1 - 84 months
  )).sort((a, b) => a - b);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  };

  const formatTenure = (months: number) => {
    const y = Math.floor(months / 12);
    const m = months % 12;
    if (y > 0 && m > 0) return `${y} yr ${m} mo`;
    if (y > 0) return `${y} yr`;
    return `${m} mo`;
  };

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
              {rateVariations.map((r) => (
                <th
                  key={r}
                  className={`text-center px-2 py-2 font-semibold border-b border-border whitespace-nowrap ${
                    r === rate ? 'text-primary' : 'text-foreground'
                  }`}
                >
                  {r}%
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tenureVariations.map((t) => (
              <tr key={t}>
                <td className={`px-2 py-2 font-medium border-b border-border whitespace-nowrap ${
                  t === currentMonths ? 'text-primary' : 'text-foreground'
                }`}>
                  {formatTenure(t)}
                </td>
                {rateVariations.map((r) => {
                  const emi = calculateEMI({ principal, rate: r, tenure: t }).emi;
                  const isCurrent = Math.abs(r - rate) < 0.01 && t === currentMonths;

                  return (
                    <td
                      key={`${t}-${r}`}
                      className={`text-center px-2 py-2 border-b border-border ${
                        isCurrent
                          ? 'bg-primary/20 text-primary font-bold rounded shadow-inner'
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
