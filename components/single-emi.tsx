'use client';

import { useEffect } from 'react';
import { useEMIStore } from '@/lib/store';
import { calculateEMI, generateAmortizationSchedule } from '@/lib/calculations';
import { SyncedSlider } from '@/components/synced-slider';
import { SummaryPanel } from '@/components/summary-panel';
import { SensitivityGrid } from '@/components/sensitivity-grid';
import { AmortizationSection } from '@/components/amortization-section';

export function SingleEMIMode() {
  const store = useEMIStore();
  const loan = store.singleLoan;

  useEffect(() => {
    store.setActiveTab('single');
  }, []);

  // Calculate EMI and related values
  const calculation = calculateEMI({ principal: loan.principal, rate: loan.rate, tenure: loan.tenure });
  const amortizationSchedule = generateAmortizationSchedule({ principal: loan.principal, rate: loan.rate, tenure: loan.tenure });

  const handlePrincipalChange = (value: number) => {
    store.updateSingleLoan({ principal: value });
  };

  const handleRateChange = (value: number) => {
    store.updateSingleLoan({ rate: value });
  };

  const handleTenureChange = (value: number) => {
    store.updateSingleLoan({ tenure: value });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Sidebar - Loan Details */}
      <div className="lg:col-span-1">
        <div className="bg-card border border-border rounded-lg p-6 space-y-6 sticky top-24">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Loan Details</h3>
            <p className="text-sm text-muted-foreground">Adjust and watch every tab update</p>
          </div>

          {/* Loan Amount Slider */}
          <SyncedSlider
            label="Loan Amount"
            value={loan.principal}
            onChange={handlePrincipalChange}
            min={10000}
            max={5000000}
            step={10000}
            prefix="₹"
            showInput={true}
          />

          {/* Interest Rate Slider */}
          <SyncedSlider
            label="Interest Rate (p.a.)"
            value={loan.rate}
            onChange={handleRateChange}
            min={1}
            max={36}
            step={0.1}
            suffix="%"
            showInput={true}
          />

          {/* Tenure Slider */}
          <SyncedSlider
            label="Tenure"
            value={loan.tenure}
            onChange={handleTenureChange}
            min={1}
            max={84}
            step={1}
            suffix="mo"
            showInput={true}
          />
        </div>
      </div>

      {/* Right Column - Summary & Schedule */}
      <div className="lg:col-span-2 space-y-6">
        <SummaryPanel
          monthlyEMI={calculation.emi}
          totalInterest={calculation.totalInterest}
          totalAmount={calculation.totalAmount}
          principal={loan.principal}
        />

        {/* Sensitivity Analysis */}
        <SensitivityGrid principal={loan.principal} rate={loan.rate} tenure={loan.tenure} />

        {/* Amortization Schedule */}
        <AmortizationSection schedule={amortizationSchedule} />
      </div>
    </div>
  );
}
