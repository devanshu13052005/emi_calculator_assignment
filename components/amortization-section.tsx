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

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Amortization Schedule</h3>
          <p className="text-sm text-muted-foreground">Month-by-month principal & interest breakdown</p>
        </div>
        
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
      </div>

      {view === 'table' ? (
        <AmortizationTable schedule={schedule} />
      ) : (
        <AmortizationChart rows={schedule} />
      )}
    </div>
  );
}
