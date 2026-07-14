import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MonthlyChart } from "@/features/reports/components/monthly-chart";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { categories, transactions } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";

export default async function ReportsPage() {
  const userId = await requireUserId();
  const rows = await db.select({ transaction: transactions, category: categories }).from(transactions).leftJoin(categories, eq(transactions.categoryId, categories.id)).where(and(eq(transactions.userId, userId), isNull(transactions.deletedAt))).orderBy(desc(transactions.date));
  const categoryTotals = new Map<string, number>(); const monthly = new Map<string, { receitas: number; despesas: number }>();
  for (const { transaction, category } of rows) { const amount = toNumber(transaction.amount); const key = category?.name ?? "Sem categoria"; categoryTotals.set(key, (categoryTotals.get(key) ?? 0) + (transaction.type === "expense" ? amount : 0)); const month = transaction.date.slice(0, 7); const item = monthly.get(month) ?? { receitas: 0, despesas: 0 }; item[transaction.type === "income" ? "receitas" : "despesas"] += amount; monthly.set(month, item); }
  return <AppShell title="Relatórios"><div className="space-y-6"><PageHeader title="Relatórios" description="Visualize suas receitas, despesas e categorias ao longo do tempo." /><div className="grid gap-6 lg:grid-cols-2"><Card><CardHeader><CardTitle>Receitas e despesas por mês</CardTitle></CardHeader><CardContent><MonthlyChart data={[...monthly].sort(([a], [b]) => a.localeCompare(b)).map(([month, values]) => ({ month, ...values }))} /></CardContent></Card><Card><CardHeader><CardTitle>Despesas por categoria</CardTitle></CardHeader><CardContent className="space-y-3">{[...categoryTotals].sort((a, b) => b[1] - a[1]).map(([name, amount]) => <div className="flex justify-between" key={name}><span>{name}</span><strong>{formatBRL(amount)}</strong></div>)}{categoryTotals.size === 0 && <p className="text-sm text-muted-foreground">Sem despesas registradas.</p>}</CardContent></Card></div></div></AppShell>;
}
