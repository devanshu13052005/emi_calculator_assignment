'use client';

import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { AmortizationRow } from '@/lib/types';

interface Props {
  rows: AmortizationRow[];
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: number;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(value));

function CustomTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className="rounded-lg border border-border px-3 py-2 text-sm shadow-lg"
      style={{ backgroundColor: 'var(--tooltip-bg)', color: 'var(--text-primary)' }}
    >
      <p className="mb-1 font-semibold">Month {label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }}>
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export function AmortizationChart({ rows }: Props) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (rows.length === 0) {
    return (
      <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
        No amortization chart available
      </div>
    );
  }

  const getInterval = (totalMonths: number) => {
    if (totalMonths <= 12) return 0;
    if (totalMonths <= 24) return 2;
    if (totalMonths <= 48) return 5;
    return 11;
  };

  const interval = getInterval(rows.length);
  const chartHeight = isMobile ? 240 : 360;

  const data = rows.map((row) => ({
    month: row.month,
    principal: Math.round(row.principalPayment),
    interest: Math.round(row.interestPayment),
  }));

  return (
    <div style={{ height: chartHeight }} className="w-full min-w-0 transition-all duration-300">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          margin={{ top: 12, right: 16, left: 12, bottom: isMobile ? 0 : 12 }}
          barCategoryGap={rows.length > 36 ? "5%" : "15%"}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" vertical={false} />
          <XAxis
            dataKey="month"
            interval={interval}
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--chart-grid)' }}
            label={isMobile ? undefined : { value: 'Month', position: 'insideBottom', offset: -5, fill: 'var(--text-secondary)', fontSize: 12 }}
          />
          <YAxis
            width={64}
            tickFormatter={(value) => {
              if (value >= 100000) return `₹${Math.round(value / 100000)}L`;
              if (value >= 1000) return `₹${Math.round(value / 1000)}K`;
              return `₹${value}`;
            }}
            tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--muted)', opacity: 0.35 }} />
          <Legend wrapperStyle={{ color: 'var(--text-primary)', fontSize: 13, paddingTop: 12 }} />
          <Bar
            dataKey="principal"
            name="Principal"
            stackId="emi"
            fill="var(--color-chart-principal)"
            stroke="var(--border)"
            strokeWidth={1}
            isAnimationActive={false}
          />
          <Bar
            dataKey="interest"
            name="Interest"
            stackId="emi"
            fill="var(--color-interest)"
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
