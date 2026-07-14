import type { Metadata } from "next";
import { sql } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUserId } from "@/server/auth";
import { db } from "@/server/db";
import { getDashboard } from "@/server/services/dashboard.service";
import { formatBRL } from "@/shared/lib/formatters";
import { CashFlowChart } from "@/features/dashboard/components/cash-flow-chart";

export const metadata: Metadata = {
  title: "Dashboard · Finance OS",
};

export default async function DashboardPage() {
  const userId = await requireUserId();
  await db.execute(sql`select public.seed_default_categories(${userId})`);
  const dashboard = await getDashboard(userId);
  const { kpis } = dashboard;
  const cards: [string, number][] = [
    ["Patrimônio líquido", kpis.netWorth],
    ["Saldo em contas", kpis.accountBalance],
    ["Investimentos", kpis.invested],
    ["Dívidas", -kpis.debtBalance],
    ["Receitas do mês", kpis.month.income],
    ["Despesas do mês", -kpis.month.expense],
  ];
  return (
    <AppShell title="Dashboard">
      <div className="space-y-6">
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{cards.map(([label, value]) => <Card key={label}><CardHeader><CardTitle className="text-sm text-muted-foreground">{label}</CardTitle></CardHeader><CardContent className="text-2xl font-semibold">{formatBRL(value)}</CardContent></Card>)}</section>
        <section className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Fluxo projetado — 30 dias</CardTitle></CardHeader><CardContent><CashFlowChart data={dashboard.cashFlow} /></CardContent></Card>
          <Card><CardHeader><CardTitle>Próximos compromissos</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{formatBRL(kpis.nextThirty)}</p><p className="text-sm text-muted-foreground">Estimativa de recorrências e parcelas para os próximos 30 dias.</p></CardContent></Card>
        </section>
        <section className="grid gap-6 lg:grid-cols-2">
          <Card><CardHeader><CardTitle>Projeções de saldo</CardTitle></CardHeader><CardContent className="grid gap-2">{dashboard.projections.map((item) => <div className="flex justify-between" key={item.label}><span>{item.label}</span><strong>{formatBRL(item.balance)}</strong></div>)}</CardContent></Card>
          <Card><CardHeader><CardTitle>Insights do Advisor</CardTitle></CardHeader><CardContent className="space-y-3">{dashboard.insights.map((item) => <div key={item.title}><p className="font-medium">{item.title}</p><p className="text-sm text-muted-foreground">{item.description}</p></div>)}</CardContent></Card>
        </section>
      </div>
    </AppShell>
  );
}
