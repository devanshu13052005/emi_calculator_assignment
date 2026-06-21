'use client';

import { useEffect } from 'react';
import { useEMIStore } from '@/lib/store';
import { calculateEMI } from '@/lib/calculations';
import { ScenarioCard } from '@/components/scenario-card';
import { ComparisonLoan } from '@/lib/types';

export function ComparisonEMIMode() {
  const store = useEMIStore();

  useEffect(() => {
    store.setActiveTab('compare');
    // Initialize comparison loans if they don't exist
    if (store.comparisonLoans.length === 0) {
      const id1 = `loan-${Date.now()}-1`;
      const id2 = `loan-${Date.now()}-2`;
      store.updateComparisonLoans([
        { ...store.singleLoan, id: id1, name: 'Conservative', tenure: 60 },
        { ...store.singleLoan, id: id2, name: 'Aggressive', tenure: 24 },
      ]);
    }
  }, []);

  const handleLoanUpdate = (id: string, updates: Partial<ComparisonLoan>) => {
    store.updateComparisonLoan(id, updates);
  };

  // Calculate best value (lowest total cost)
  const loanResults = store.comparisonLoans.map((loan) => {
    const calc = calculateEMI({ principal: loan.principal, rate: loan.rate, tenure: loan.tenure });
    return {
      id: loan.id,
      emi: calc.emi,
      totalCost: calc.totalAmount,
    };
  });

  const bestValueId = loanResults.length > 0
    ? loanResults.reduce((best, current) =>
        current.totalCost < best.totalCost ? current : best
      ).id
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Compare Scenarios</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Configure up to 3 scenarios – the lowest total cost is highlighted
        </p>
      </div>

      {/* Add Scenario Button */}
      {store.comparisonLoans.length < 3 && (
        <button
          onClick={() => {
            const newId = `loan-${Date.now()}`;
            store.updateComparisonLoans([
              ...store.comparisonLoans,
              { ...store.singleLoan, id: newId, name: `Scenario ${store.comparisonLoans.length + 1}` },
            ]);
          }}
          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          + Add Scenario
        </button>
      )}

      {/* Scenario Cards Grid */}
      <div className={`grid gap-4 ${
        store.comparisonLoans.length === 2
          ? 'grid-cols-1 lg:grid-cols-2'
          : 'grid-cols-1 lg:grid-cols-3'
      }`}>
        {store.comparisonLoans.map((loan) => (
          <ScenarioCard
            key={loan.id}
            loan={loan}
            onUpdate={(updates) => handleLoanUpdate(loan.id, updates)}
            onRemove={() => store.removeComparisonLoan(loan.id)}
            showRemove={store.comparisonLoans.length > 2}
            isBestValue={loan.id === bestValueId}
          />
        ))}
      </div>
    </div>
  );
}
