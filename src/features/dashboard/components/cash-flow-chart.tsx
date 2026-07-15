"use client";

import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL } from "@/shared/lib/formatters";

function formatAxisBRL(value: number) {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `R$${((value / 1_000_000).toFixed(1))}M`;
  if (abs >= 1_000) return `R$${((value / 1_000).toFixed(abs >= 10_000 ? 0 : 1))}k`;
  return `R$${Math.round(value)}`;
}

export function CashFlowChart({
  data,
  meta,
}: {
  data: { label: string; balance: number; income?: number; expense?: number }[];
  meta?: {
    days: number;
    openingBalance: number;
    closingBalance: number;
    periodIncome: number;
    periodExpense: number;
  };
}) {
  const chartData = data.map((row) => ({
    label: row.label,
    balance: Number(row.balance) || 0,
    income: Number(row.income) || 0,
    expense: Number(row.expense) || 0,
  }));

  if (!chartData.length) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground sm:h-64">
        Sem dados para projetar.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height={256}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="cashFlowFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#a1a1aa", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
              tickFormatter={formatAxisBRL}
            />
            <Tooltip
              formatter={(value, name) => {
                const labels: Record<string, string> = {
                  income: "Entradas previstas",
                  expense: "Saídas previstas",
                  balance: "Saldo nas contas",
                };
                return [formatBRL(Number(value)), labels[String(name)] ?? String(name)];
              }}
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                borderRadius: 8,
                color: "#fafafa",
              }}
            />
            <Legend
              formatter={(value) =>
                value === "income"
                  ? "Entradas"
                  : value === "expense"
                    ? "Saídas"
                    : "Saldo"
              }
              wrapperStyle={{ fontSize: 12, color: "#a1a1aa" }}
            />
            <Bar dataKey="income" name="income" fill="#14b8a6" maxBarSize={18} radius={[3, 3, 0, 0]} />
            <Bar dataKey="expense" name="expense" fill="#f97316" maxBarSize={18} radius={[3, 3, 0, 0]} />
            <Area
              type="monotone"
              dataKey="balance"
              name="balance"
              stroke="#a78bfa"
              strokeWidth={2}
              fill="url(#cashFlowFill)"
              dot={{ r: 2, fill: "#a78bfa" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {meta ? (
        <div className="grid grid-cols-2 gap-2 text-center text-xs sm:grid-cols-4">
          <div className="rounded-lg bg-muted/40 px-2 py-1.5">
            <p className="text-muted-foreground">Saldo hoje</p>
            <p className="font-semibold">{formatBRL(meta.openingBalance)}</p>
          </div>
          <div className="rounded-lg bg-teal-500/10 px-2 py-1.5">
            <p className="text-muted-foreground">Entradas 3 meses</p>
            <p className="font-semibold text-teal-400">{formatBRL(meta.periodIncome)}</p>
          </div>
          <div className="rounded-lg bg-orange-500/10 px-2 py-1.5">
            <p className="text-muted-foreground">Saídas 3 meses</p>
            <p className="font-semibold text-orange-400">{formatBRL(meta.periodExpense)}</p>
          </div>
          <div className="rounded-lg bg-violet-500/10 px-2 py-1.5">
            <p className="text-muted-foreground">Saldo em 3 meses</p>
            <p className="font-semibold text-violet-300">{formatBRL(meta.closingBalance)}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
