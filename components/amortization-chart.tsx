'use client';

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

// Custom tooltip component
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)',
      border: '1px solid var(--border)',
      borderRadius: '8px',
      padding: '12px',
      color: 'var(--foreground)',
    }}>
      <p style={{ fontWeight: 600, marginBottom: 6 }}>Month {label}</p>
      {payload.map((entry: any) => (
        <p key={entry.name} style={{ color: entry.color, margin: '2px 0' }}>
          {entry.name}: ₹{Math.round(entry.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

export function AmortizationChart({ rows }: Props) {
  // For long tenures, only show every Nth bar to avoid overcrowding
  // Show all bars if tenure <= 24, every 2nd if <= 48, every 3rd if > 48
  const interval = rows.length <= 24 ? 0 : rows.length <= 48 ? 1 : 2;

  const data = rows.map(row => ({
    month: row.month,
    Principal: row.principalPayment,
    Interest: row.interestPayment,
  }));

  return (
    <div style={{ width: '100%', height: 360 }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
          barCategoryGap="20%"
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--border)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: 'var(--border)' }}
            interval={interval}
            label={{
              value: 'Month',
              position: 'insideBottom',
              offset: -5,
              fill: 'var(--muted-foreground)',
              fontSize: 12,
            }}
          />
          <YAxis
            tickFormatter={(value) => {
              if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
              if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
              return `₹${value}`;
            }}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              color: 'var(--foreground)',
              fontSize: 13,
              paddingTop: 12,
            }}
          />
          {/* Principal bar — stacked on bottom */}
          <Bar
            dataKey="Principal"
            stackId="emi"
            fill="var(--color-principal)"
            radius={[0, 0, 0, 0]}
            name="Principal"
          />
          {/* Interest bar — stacked on top */}
          <Bar
            dataKey="Interest"
            stackId="emi"
            fill="var(--color-interest)"
            radius={[4, 4, 0, 0]}
            name="Interest"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
