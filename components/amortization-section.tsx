'use client';

import { useState } from 'react';
import { AmortizationRow } from '@/lib/types';
import { AmortizationTable } from '@/components/amortization-table';
import { AmortizationChart } from '@/components/amortization-chart';

interface Props {
  schedule: AmortizationRow[];
}

export function AmortizationSection({ schedule }: Props) {
  const [view, setView] = useState<'table' | 'chart'>('table');

  const handleExportCSV = () => {
    if (!schedule || schedule.length === 0) return;

    const headers = ['Month', 'EMI', 'Principal', 'Interest', 'Prepayment', 'Balance'];
    const rows = schedule.map((row) => [
      row.month,
      Math.round(row.emi),
      Math.round(row.principalPayment),
      Math.round(row.interestPayment),
      Math.round(row.prepaymentAmount || 0),
      Math.round(row.balance)
    ].join(','));

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'amortization_schedule.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Amortization Schedule</h3>
          <p className="text-sm text-muted-foreground">Month-by-month principal & interest breakdown</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Toggle Buttons */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setView('table')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'table'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Table
            </button>
            <button
              onClick={() => setView('chart')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                view === 'chart'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              Chart
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium bg-secondary text-secondary-foreground rounded-lg border border-border hover:bg-muted transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {view === 'table' ? (
        <AmortizationTable schedule={schedule} />
      ) : (
        <AmortizationChart rows={schedule} />
      )}
    </div>
  );
}
