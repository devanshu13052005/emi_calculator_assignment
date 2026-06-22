'use client';

import { calculateEMI } from '@/lib/calculations';

interface SensitivityGridProps {
  principal: number;
  rate: number;
  tenure: number;
}

export function SensitivityGrid({ principal, rate, tenure }: SensitivityGridProps) {
  const rateOffsets = [-3, -2, -1, 0, 1, 2, 3];
  const tenureOffsets = [-24, -12, -6, 0, 6, 12, 24];

  const rateVariations = Array.from(new Set(
    rateOffsets
      .map((offset) => rate + offset)
      .map((r) => Math.max(1, Math.min(36, r)))
  )).sort((a, b) => a - b);

  const tenureVariations = Array.from(new Set(
    tenureOffsets
      .map((offset) => tenure + offset)
      .map((t) => Math.max(1, Math.min(84, t)))
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

  const cellBorder = { borderColor: 'var(--chart-grid)' };

  return (
    <div className="bg-card dark:bg-muted border border-border rounded-lg p-6 overflow-x-auto">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-foreground">Sensitivity Analysis</h3>
        <p className="text-sm text-muted-foreground">See how your EMI changes with different rates and tenures</p>
      </div>

      <div className="table-shell min-w-[600px]">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr>
              <th className="p-2 border bg-muted text-left" style={cellBorder}>
                Rate \ Tenure
              </th>
              {tenureVariations.map((t) => (
                <th key={t} className="p-2 border bg-muted text-center" style={cellBorder}>
                  {formatTenure(t)} {t === tenure ? '(Current)' : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rateVariations.map((r) => (
              <tr key={r}>
                <th className="p-2 border bg-muted text-left" style={cellBorder}>
                  {r.toFixed(1)}% {r === rate ? '(Current)' : ''}
                </th>
                {tenureVariations.map((t) => {
                  const isCurrent = t === tenure && r === rate;
                  const { emi } = calculateEMI({ principal, rate: r, tenure: t });

                  return (
                    <td
                      key={`${r}-${t}`}
                      className={`p-2 border text-center transition-colors ${
                        isCurrent
                          ? 'bg-primary text-primary-foreground font-bold shadow-sm'
                          : 'hover:bg-muted/50'
                      }`}
                      style={!isCurrent ? { ...cellBorder, color: 'var(--text-primary)' } : cellBorder}
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
