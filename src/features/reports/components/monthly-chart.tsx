"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MonthlyChart({ data }: { data: { month: string; receitas: number; despesas: number }[] }) {
  return <div className="h-72"><ResponsiveContainer><BarChart data={data}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="month" /><YAxis /><Tooltip /><Legend /><Bar dataKey="receitas" fill="#22c55e" /><Bar dataKey="despesas" fill="#ef4444" /></BarChart></ResponsiveContainer></div>;
}
