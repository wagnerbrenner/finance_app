import type { Metadata } from "next";
import Link from "next/link";
import { sql } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUserId } from "@/server/auth";
import { db } from "@/server/db";
import { getDashboard } from "@/server/services/dashboard.service";
import { getDueNotifications } from "@/server/services/notifications.service";
import { formatBRL } from "@/shared/lib/formatters";
import { CashFlowChart } from "@/features/dashboard/components/cash-flow-chart";
import {
  CategoryExpenseChart,
  IncomeExpenseChart,
} from "@/features/dashboard/components/expense-charts";
import { DueAlertsBanner } from "@/features/notifications/components/due-alerts-banner";

export const metadata: Metadata = {
  title: "Painel · Finance OS",
};

export default async function DashboardPage() {
  const userId = await requireUserId();
  try {
    await db.execute(sql`select public.seed_default_categories(${userId})`);
  } catch (err) {
    console.error("seed_default_categories failed", err);
  }

  const [dashboard, notifications] = await Promise.all([
    getDashboard(userId),
    getDueNotifications(userId),
  ]);
  const { kpis } = dashboard;
  const savingsPct = Math.round(kpis.savingsRate * 100);

  const kpiCards: { label: string; value: number }[] = [
    { label: "Saldo projetado", value: kpis.projectedYearEndBalance },
    { label: "Saldo em contas", value: kpis.accountBalance },
    { label: "Receitas do mês", value: kpis.month.income },
    { label: "Despesas do mês", value: kpis.month.expense },
  ];

  return (
    <AppShell title="Painel">
      <div className="space-y-5 md:space-y-6">
        <DueAlertsBanner notifications={notifications} />

        <section className="flex flex-wrap items-center gap-2">
          <Badge variant={savingsPct >= 20 ? "default" : savingsPct >= 0 ? "secondary" : "destructive"}>
            Taxa de economia: {savingsPct}%
          </Badge>
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold tracking-tight sm:text-2xl">
                  {formatBRL(card.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Onde foi o dinheiro</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryExpenseChart data={dashboard.expensesByCategory} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Receitas × despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={dashboard.incomeVsExpenseByMonth} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo projetado — 3 meses</CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowChart data={dashboard.cashFlow} meta={dashboard.cashFlowMeta} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Próximos compromissos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatBRL(kpis.nextThirty)}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Link href="/app/recorrentes" className="text-teal-400 underline-offset-2 hover:underline">
                  Recorrentes
                </Link>
                <span className="text-muted-foreground">·</span>
                <Link href="/app/dividas" className="text-teal-400 underline-offset-2 hover:underline">
                  Dívidas
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Projeções de saldo</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {dashboard.projections.map((item) => (
                <div className="flex justify-between gap-3 text-sm sm:text-base" key={item.label}>
                  <span className="text-muted-foreground">{item.label}</span>
                  <strong>{formatBRL(item.balance)}</strong>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Dicas do conselheiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dashboard.insights.map((item) => (
                <div key={item.title}>
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </AppShell>
  );
}
