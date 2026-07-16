"use client";

import dynamic from "next/dynamic";

const chartFallback = (
  <div className="flex h-52 items-center justify-center text-sm text-muted-foreground">
    Carregando gráfico…
  </div>
);

export const CategoryExpenseChart = dynamic(
  () => import("./expense-charts").then((m) => m.CategoryExpenseChart),
  { ssr: false, loading: () => chartFallback },
);

export const IncomeExpenseChart = dynamic(
  () => import("./expense-charts").then((m) => m.IncomeExpenseChart),
  { ssr: false, loading: () => chartFallback },
);

export const CashFlowChartLazy = dynamic(
  () => import("./cash-flow-chart").then((m) => m.CashFlowChart),
  { ssr: false, loading: () => chartFallback },
);
