# EMI Workspace

A production-grade Loan EMI Calculator built as a frontend internship 
assignment. Multiple browser tabs share the same calculator state in 
real-time — change any input in one tab and every other open tab updates 
instantly, with no server, no polling, and no page refresh.

## Live Demo

[emi-calculator-frontend-rho.vercel.app](https://emi-calculator-frontend-rho.vercel.app)

## Features

### Core Features
- **EMI Calculator** — Loan amount, interest rate and tenure inputs with 
  synced sliders and number fields. Computes EMI, total interest, total 
  payable and principal vs interest split instantly.
- **Amortization Schedule** — Full month-by-month breakdown of principal, 
  interest and balance. Paginated table (12 rows per page) with break-even 
  month highlighted. Toggle between table and stacked bar chart view.
- **Loan Comparison Mode** — Compare up to 3 loan scenarios side by side. 
  Best value scenario (lowest total payable) is automatically highlighted.
- **What-If Sensitivity Table** — 7×7 grid showing EMI across ±3% rate 
  and ±24 month tenure variations around current inputs. Updates live.
- **Prepayment Planner** — Schedule one-time lump-sum prepayments, see 
  interest saved and tenure reduced compared to original plan.
- **Export CSV** — Download the full amortization schedule as a CSV file.

### Cross-Tab Sync (Core Technical Feature)
- All state syncs across browser tabs in real-time using the 
  **BroadcastChannel API** — no server, no localStorage hacks, no polling.
- Synced state includes: calculator inputs, active mode, comparison 
  scenarios, prepayments and theme.
- **Tab Identity** — Each tab displays a unique ID (e.g. "Tab A3").
- **Live Tab Count** — Shows how many tabs are currently open. Updates 
  within seconds when a tab opens or closes (heartbeat + presence map).
- **Leader Election** — The tab with the lexicographically smallest ID 
  is the leader. New tabs request current state from the leader on open. 
  When the leader closes, the next tab takes over automatically.
- **Theme Sync** — Dark/light mode toggle propagates to all open tabs 
  simultaneously.

### Bonus Features
- **URL State Encoding** — Calculator inputs encoded in URL query params 
  (?amount=&rate=&tenure=) for shareable links.
- **Cross-Tab Undo** — Ctrl+Z in any tab reverts the last change across 
  all open tabs.

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 14 (App Router) | Framework |
| TypeScript (strict mode) | Type safety |
| Tailwind CSS | Styling |
| Recharts | Amortization bar chart |
| BroadcastChannel API | Cross-tab real-time sync |

## Calculation Formulas

All calculations use the standard **reducing-balance method** — interest 
is charged on the outstanding balance each month, not the original principal.

**EMI Formula:**
EMI = P × r × (1 + r)^n / ((1 + r)^n − 1)
where:

P = Principal (loan amount)

r = Monthly interest rate = annual rate / 12 / 100

n = Tenure in months

**Derived values:**
Total Amount Payable = EMI × n

Total Interest Payable = (EMI × n) − P

Principal % = P / (EMI × n) × 100

Interest % = Total Interest / (EMI × n) × 100

**Verification example:**
P = ₹15,00,000 | Rate = 11% p.a. | Tenure = 48 months

EMI = ₹38,768

Total Payable = ₹18,60,878

Total Interest = ₹3,60,878

Principal = 80.6% | Interest = 19.4%

## Project Structure
src/

├── app/

│   ├── layout.tsx              # Root layout with theme provider

│   ├── page.tsx                # Main page

│   └── globals.css             # CSS variables for light/dark theme

├── components/

│   ├── layout/

│   │   └── Header.tsx          # Tab ID, tab count, leader badge, theme toggle

│   ├── ui/

│   │   ├── SliderInput.tsx     # Synced number input + range slider

│   │   ├── TabsNav.tsx         # Single / Compare / Prepayment switcher

│   │   └── ThemeToggle.tsx     # Dark/light toggle

│   ├── calculator/

│   │   ├── InputPanel.tsx      # Loan inputs

│   │   ├── SummaryCards.tsx    # EMI, interest, total payable cards

│   │   ├── PrincipalBar.tsx    # Principal vs interest visual bar

│   │   └── SensitivityTable.tsx# 7×7 rate × tenure grid

│   ├── amortization/

│   │   ├── AmortizationSection.tsx  # Toggle + export wrapper

│   │   ├── AmortizationTable.tsx    # Paginated table

│   │   └── AmortizationChart.tsx    # Stacked bar chart (Recharts)

│   ├── compare/

│   │   └── CompareMode.tsx     # Loan comparison scenarios

│   └── prepayment/

│       └── PrepaymentPlanner.tsx    # Prepayment scheduler

├── hooks/

│   ├── useTabSync.ts           # BroadcastChannel state sync

│   ├── useTabIdentity.ts       # Tab ID + heartbeat presence

│   ├── useTabLeader.ts         # Leader election

│   └── useUndoHistory.ts       # Cross-tab undo

├── lib/

│   ├── emi.ts                  # Pure EMI calculation functions

│   ├── amortization.ts         # Amortization schedule builder

│   └── formatters.ts           # Indian currency formatter

├── types/

│   └── index.ts                # All TypeScript interfaces

└── context/

└── AppStateContext.tsx     # Global state with useReducer

## Getting Started

**Prerequisites:** Node.js 18+

**Installation:**
```bash
git clone https://github.com/devanshu13052005/emi-calculator-frontend.git
cd emi-calculator-frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Build for production:**
```bash
npm run build
```

## Testing Cross-Tab Sync

1. Open the app at http://localhost:3000
2. Open a second browser tab with the same URL
3. Change the loan amount in Tab 1 — Tab 2 updates instantly
4. Toggle dark mode in Tab 1 — Tab 2 switches theme simultaneously
5. Notice the tab count updates from "1 tab" to "2 tabs"
6. Close Tab 1 — Tab 2 count drops back to "1 tab" within 5 seconds
7. The LEADER badge always shows on exactly one tab

## Color Scheme

| Value | Dark Mode | Light Mode |
|-------|-----------|------------|
| Monthly EMI | Yellow `#fbbf24` | Amber `#b45309` |
| Principal | White `#ffffff` | Navy `#1e3a5f` |
| Interest | Red `#f87171` | Red `#dc2626` |
| Interest Saved | Green `#34d399` | Green `#059669` |

## Deployment

Deployed on **Vercel** with automatic deployments on every push to `main`.
