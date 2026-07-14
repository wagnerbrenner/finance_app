"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL } from "@/shared/lib/formatters";

export function CashFlowChart({ data }: { data: { label: string; balance: number }[] }) {
  return <div className="h-64 w-full"><ResponsiveContainer><AreaChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="label" /><YAxis tickFormatter={(value) => `R$${value}`} /><Tooltip formatter={(value) => formatBRL(Number(value))} /><Area type="monotone" dataKey="balance" stroke="var(--primary)" fill="var(--primary)" fillOpacity={0.2} /></AreaChart></ResponsiveContainer></div>;
}
