"use client";

import {
  Bar,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  ComposedChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL } from "@/shared/lib/formatters";

const FALLBACK_COLORS = [
  "#38bdf8",
  "#f97316",
  "#a78bfa",
  "#14b8a6",
  "#ef4444",
  "#eab308",
  "#f43f5e",
  "#94a3b8",
];

const AXIS = { fill: "#a1a1aa", fontSize: 11 };
const GRID = { stroke: "#27272a", strokeDasharray: "3 3" };

function formatAxisBRL(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `R$${value / 1_000_000}M`;
  if (abs >= 1_000) return `R$${(value / 1_000).toFixed(abs >= 10_000 ? 0 : 1)}k`;
  return `R$${Math.round(value)}`;
}

function ChartEmpty({ message }: { message: string }) {
  return (
    <div className="flex h-64 items-center justify-center px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

export function CategoryExpenseChart({
  data,
}: {
  data: { name: string; total: number; color: string | null }[];
}) {
  const chartData = data
    .filter((item) => item.total > 0)
    .slice(0, 8)
    .map((item, i) => ({
      name: item.name,
      total: Number(item.total) || 0,
      fill: item.color || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
    }));

  if (!chartData.length) {
    return <ChartEmpty message="Sem despesas neste mês ainda." />;
  }

  const total = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8">
      <div className="h-44 w-44 shrink-0 sm:h-48 sm:w-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              paddingAngle={2}
              stroke="transparent"
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatBRL(Number(value))}
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 8,
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-3">
        {chartData.map((item) => {
          const pct = total > 0 ? Math.round((item.total / total) * 100) : 0;
          return (
            <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ background: item.fill }}
                />
                <span className="truncate text-muted-foreground">{item.name}</span>
              </span>
              <span className="shrink-0 tabular-nums text-foreground">
                {formatBRL(item.total)}
                <span className="text-muted-foreground"> · {pct}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function IncomeExpenseChart({
  data,
}: {
  data: {
    label: string;
    month?: string;
    income: number;
    salary?: number;
    otherIncome?: number;
    expense: number;
    balance?: number;
  }[];
}) {
  const chartData = data.map((row) => {
    const salary = Number(row.salary ?? 0) || 0;
    const otherIncome =
      Number(row.otherIncome ?? Math.max(0, (Number(row.income) || 0) - salary)) || 0;
    const expense = Number(row.expense) || 0;
    const income = salary + otherIncome;
    return {
      label: row.label,
      salary,
      otherIncome,
      income,
      expense,
      balance: Number(row.balance ?? income - expense) || 0,
    };
  });

  const hasData = chartData.some((row) => row.income > 0 || row.expense > 0);

  if (!hasData) {
    return <ChartEmpty message="Sem lançamentos nos últimos 6 meses." />;
  }

  const maxValue = Math.max(...chartData.flatMap((r) => [r.income, r.expense]), 1);

  return (
    <div className="space-y-3">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height={256}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid {...GRID} vertical={false} />
            <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} />
            <YAxis
              tick={AXIS}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={formatAxisBRL}
              domain={[0, Math.ceil(maxValue * 1.15)]}
            />
            <Tooltip
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  salary: "Salário",
                  otherIncome: "Outras receitas",
                  expense: "Despesas",
                  balance: "Saldo do mês",
                };
                return [formatBRL(Number(value)), labels[String(name)] ?? String(name)];
              }}
              labelFormatter={(label) => String(label)}
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 8,
                color: "#fafafa",
              }}
            />
            <Legend
              formatter={(value) => {
                const labels: Record<string, string> = {
                  salary: "Salário",
                  otherIncome: "Outras receitas",
                  expense: "Despesas",
                  balance: "Saldo",
                };
                return labels[value] ?? value;
              }}
              wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }}
            />
            <Bar
              dataKey="salary"
              name="salary"
              stackId="income"
              fill="#14b8a6"
              radius={[0, 0, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="otherIncome"
              name="otherIncome"
              stackId="income"
              fill="#2dd4bf"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Bar
              dataKey="expense"
              name="expense"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
              maxBarSize={28}
            />
            <Line
              type="monotone"
              dataKey="balance"
              name="balance"
              stroke="#a78bfa"
              strokeWidth={2}
              dot={{ r: 3, fill: "#a78bfa" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-teal-500/10 px-2 py-1.5">
          <p className="text-muted-foreground">Salário</p>
          <p className="font-semibold text-teal-400">
            {formatBRL(chartData.reduce((s, r) => s + r.salary, 0))}
          </p>
        </div>
        <div className="rounded-lg bg-teal-500/5 px-2 py-1.5">
          <p className="text-muted-foreground">Outras receitas</p>
          <p className="font-semibold text-teal-300/90">
            {formatBRL(chartData.reduce((s, r) => s + r.otherIncome, 0))}
          </p>
        </div>
        <div className="rounded-lg bg-orange-500/10 px-2 py-1.5">
          <p className="text-muted-foreground">Despesas</p>
          <p className="font-semibold text-orange-400">
            {formatBRL(chartData.reduce((s, r) => s + r.expense, 0))}
          </p>
        </div>
        <div className="rounded-lg bg-violet-500/10 px-2 py-1.5">
          <p className="text-muted-foreground">Saldo 6 meses</p>
          <p className="font-semibold text-violet-300">
            {formatBRL(chartData.reduce((s, r) => s + r.balance, 0))}
          </p>
        </div>
      </div>
    </div>
  );
}
