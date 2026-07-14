"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL } from "@/shared/lib/formatters";

const FALLBACK_COLORS = [
  "#14b8a6",
  "#f97316",
  "#ef4444",
  "#a78bfa",
  "#38bdf8",
  "#eab308",
  "#f43f5e",
  "#94a3b8",
];

export function CategoryExpenseChart({
  data,
}: {
  data: { name: string; total: number; color: string | null }[];
}) {
  if (!data.length) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Sem despesas neste mês ainda.
      </p>
    );
  }

  const chartData = data.slice(0, 8).map((item, i) => ({
    ...item,
    fill: item.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  return (
    <div className="space-y-4">
      <div className="mx-auto h-52 w-full max-w-xs">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={80}
              paddingAngle={2}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => formatBRL(Number(value))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="space-y-2">
        {chartData.map((item) => (
          <li key={item.name} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ background: item.fill }}
              />
              <span className="truncate">{item.name}</span>
            </span>
            <span className="shrink-0 font-medium">{formatBRL(item.total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function IncomeExpenseChart({
  data,
}: {
  data: { label: string; income: number; expense: number }[];
}) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer>
        <BarChart data={data} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `R$${v}`} width={56} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => formatBRL(Number(value))} />
          <Bar dataKey="income" name="Receitas" fill="#14b8a6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expense" name="Despesas" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
