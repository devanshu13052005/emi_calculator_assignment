'use client';

import { useEffect, useState } from 'react';
import { useEMIStore } from '@/lib/store';
import { calculateEMI, generateAmortizationSchedule } from '@/lib/calculations';
import { SyncedSlider } from '@/components/synced-slider';
import { AmortizationTable } from '@/components/amortization-table';
import { PrepaymentEntry } from '@/lib/types';

export function PrepaymentEMIMode() {
  const store = useEMIStore();
  const [newMonth, setNewMonth] = useState(12);
  const [newAmount, setNewAmount] = useState(100000);

  useEffect(() => {
    store.setActiveTab('prepayment');
  }, []);

  const loan = store.singleLoan;
  const calculation = calculateEMI({ principal: loan.principal, rate: loan.rate, tenure: loan.tenure });
  const schedule = generateAmortizationSchedule({ principal: loan.principal, rate: loan.rate, tenure: loan.tenure }, store.prepaymentEntries);
  
  // Calculate prepayment impact
  const originalMonths = loan.tenure;
  const adjustedMonths = schedule[schedule.length - 1].month;
  const originalInterest = calculation.totalInterest;
  const adjustedInterest = schedule.reduce((sum, row) => sum + row.interestPayment, 0);
  
  const prepaymentImpact = {
    interestSavings: Math.max(0, originalInterest - adjustedInterest),
    tenureReduction: originalMonths - adjustedMonths,
    newTenure: adjustedMonths / 12,
    newTotalInterest: adjustedInterest,
    adjustedSchedule: schedule,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleAddPrepayment = () => {
    if (newMonth > 0 && newAmount > 0) {
      // Check if entry for this month already exists
      const exists = store.prepaymentEntries.some((e) => e.month === newMonth);
      if (exists) {
        alert('Prepayment for this month already exists');
        return;
      }

      const entry: PrepaymentEntry = { month: newMonth, amount: newAmount };
      const newEntries = [...store.prepaymentEntries, entry].sort(
        (a, b) => a.month - b.month
      );
      store.updatePrepaymentEntries(newEntries);

      setNewMonth(newMonth + 12);
      setNewAmount(100000);
    }
  };

  const handleRemovePrepayment = (month: number) => {
    store.removePrepaymentEntry(month);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Loan Details & Prepayment Input */}
      <div className="lg:col-span-1 space-y-6">
        {/* Loan Details */}
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 sticky top-24">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Prepayment Planner</h3>
            <p className="text-sm text-muted-foreground">Schedule lump-sum prepayments and see interest saved</p>
          </div>

          {/* Add Prepayment Section */}
          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-semibold text-foreground mb-4">Add a one-time prepayment</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Month</label>
                <input
                  type="number"
                  value={newMonth}
                  onChange={(e) => setNewMonth(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max={loan.tenure}
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Month"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Amount (₹)</label>
                <input
                  type="number"
                  value={newAmount}
                  onChange={(e) => setNewAmount(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="10000"
                  className="w-full px-3 py-2 border border-input rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="100000"
                />
              </div>

              <button
                onClick={handleAddPrepayment}
                className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Prepayment List */}
          {store.prepaymentEntries.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No prepayments yet. Add one above to see the impact.
            </div>
          )}

          {store.prepaymentEntries.length > 0 && (
            <div className="border-t border-border pt-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">Scheduled Prepayments</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {store.prepaymentEntries.map((entry) => (
                  <div
                    key={entry.month}
                    className="flex justify-between items-center bg-muted/50 p-3 rounded-lg"
                  >
                    <span className="text-sm text-foreground">
                      Month {entry.month}: {formatCurrency(entry.amount)}
                    </span>
                    <button
                      onClick={() => handleRemovePrepayment(entry.month)}
                      className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded hover:bg-destructive/20"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Results & Schedule */}
      <div className="lg:col-span-2 space-y-6">
        {/* Prepayment Impact */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Prepayment Impact</h3>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-xs font-medium text-green-600 uppercase mb-1">Interest Saved</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(prepaymentImpact.interestSavings)}
              </p>
            </div>

            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-600 uppercase mb-1">Tenure Reduced By</p>
              <p className="text-2xl font-bold text-blue-700">
                {prepaymentImpact.tenureReduction === 0 ? '–' : `${prepaymentImpact.tenureReduction} mo`}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Original Tenure</p>
              <p className="font-semibold text-foreground">{loan.tenure} yr</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">New Tenure</p>
              <p className="font-semibold text-foreground">{prepaymentImpact.newTenure} yr</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Original Interest</p>
              <p className="font-semibold text-foreground">{formatCurrency(calculation.totalInterest)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">New Interest</p>
              <p className="font-semibold text-foreground">{formatCurrency(prepaymentImpact.newTotalInterest)}</p>
            </div>
          </div>
        </div>

        {/* Adjusted Schedule */}
        {prepaymentImpact.adjustedSchedule && (
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Adjusted Schedule</h3>
            <p className="text-sm text-muted-foreground mb-4">Amortization reflecting your prepayments</p>
            <AmortizationTable schedule={prepaymentImpact.adjustedSchedule} />
          </div>
        )}
      </div>
    </div>
  );
}
