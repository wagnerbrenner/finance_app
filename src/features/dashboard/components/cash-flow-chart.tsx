"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatBRL } from "@/shared/lib/formatters";

export function CashFlowChart({ data }: { data: { label: string; balance: number }[] }) {
  return (
    <div className="h-56 w-full sm:h-64">
      <ResponsiveContainer>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(value) => `R$${value}`} width={56} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => formatBRL(Number(value))} />
          <Area
            type="monotone"
            dataKey="balance"
            name="Saldo"
            stroke="#14b8a6"
            fill="#14b8a6"
            fillOpacity={0.2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
