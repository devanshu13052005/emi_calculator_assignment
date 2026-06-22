'use client';

import { AmortizationRow } from '@/lib/types';
import { formatCurrency } from '@/lib/calculations';
import { useState } from 'react';

interface AmortizationTableProps {
  schedule: AmortizationRow[];
}

export function AmortizationTable({ schedule }: AmortizationTableProps) {
  const [itemsPerPage] = useState(12);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(schedule.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayedSchedule = schedule.slice(startIndex, startIndex + itemsPerPage);

  if (schedule.length === 0) {
    return (
      <div className="bg-muted p-4 rounded-lg text-center text-muted-foreground">
        No amortization schedule available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <div className="table-shell overflow-x-auto border border-border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-medium text-foreground dark:text-[#e2e8f0]">Month</th>
              <th className="px-4 py-3 text-right font-medium text-foreground dark:text-[#e2e8f0]">EMI</th>
              <th className="px-4 py-3 text-right font-medium text-foreground dark:text-[#e2e8f0]">Principal</th>
              <th className="px-4 py-3 text-right font-medium text-foreground dark:text-[#e2e8f0]">Interest</th>
              <th className="px-4 py-3 text-right font-medium text-foreground dark:text-[#e2e8f0]">Balance</th>
            </tr>
          </thead>
          <tbody>
            {displayedSchedule.map((row) => (
              <tr
                key={row.month}
                className={`border-b border-border transition-colors ${
                  row.isBreakEven
                    ? 'break-even-row hover:bg-[#fef9c3] dark:hover:bg-primary/20 border-l-[3px]'
                    : 'hover:bg-muted/50'
                }`}
                style={row.isBreakEven ? { borderLeftColor: 'var(--color-emi)' } : {}}
                title={row.isBreakEven ? 'Break-even month: Cumulative Principal repaid first exceeds Cumulative Interest paid' : undefined}
              >
                <td className="px-4 py-3 font-medium flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  {row.month}
                  {row.isBreakEven && (
                    <span className="break-even-badge text-[10px] px-1.5 py-0.5 rounded uppercase font-bold">
                      Break-even
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-emi)' }}>
                  {formatCurrency(row.emi + (row.prepaymentAmount || 0))}
                  {row.prepaymentAmount > 0 && (
                    <span className="block text-xs mt-1" style={{ color: 'var(--color-interest-saved)' }}>
                      + {formatCurrency(row.prepaymentAmount)} prepay
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: 'var(--color-principal)' }}>
                  {formatCurrency(row.principalPayment)}
                </td>
                <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--color-interest)' }}>
                  {formatCurrency(row.interestPayment)}
                </td>
                <td className="px-4 py-3 text-right font-medium" style={{ color: 'var(--text-primary)' }}>
                  {formatCurrency(row.balance)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="pagination-button px-3 py-2 rounded-lg border bg-background disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary text-primary-foreground'
                      : 'pagination-button border bg-background hover:bg-muted'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="pagination-button px-3 py-2 rounded-lg border bg-background disabled:opacity-50 hover:bg-muted transition-colors"
          >
            Next
          </button>
        </div>
      )}

      {/* Summary */}
      <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground">
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, schedule.length)} of{' '}
        {schedule.length} months | Page {currentPage} of {totalPages}
      </div>
    </div>
  );
}
