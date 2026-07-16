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
import { CashFlowChartLazy, CategoryExpenseChart, IncomeExpenseChart } from "@/features/dashboard/components/charts-lazy";
import { DueAlertsBanner } from "@/features/notifications/components/due-alerts-banner";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Painel",
};

export default async function DashboardPage() {
  const userId = await requireUserId();
  const seedPromise = db
    .execute(sql`select public.seed_default_categories(${userId})`)
    .catch((err) => {
      console.error("seed_default_categories failed", err);
    });

  const [dashboard, notifications] = await Promise.all([
    getDashboard(userId),
    getDueNotifications(userId),
    seedPromise,
  ]).then(([d, n]) => [d, n] as const);
  const { kpis } = dashboard;
  const savingsPct = Math.round(kpis.savingsRate * 100);
  const monthBalance = kpis.month.income - kpis.month.expense;

  const monthKpis: {
    label: string;
    value: number;
    valueClass: string;
  }[] = [
    {
      label: "Receitas do mês",
      value: kpis.month.income,
      valueClass: "text-emerald-400",
    },
    {
      label: "Despesas do mês",
      value: kpis.month.expense,
      valueClass: "text-rose-400",
    },
    {
      label: "Saldo do mês",
      value: monthBalance,
      valueClass: monthBalance >= 0 ? "text-emerald-400" : "text-rose-400",
    },
  ];

  return (
    <AppShell title="Painel">
      <div className="space-y-5 md:space-y-6">
        <DueAlertsBanner notifications={notifications} />

        <section className="flex flex-wrap items-center gap-2">
          <Badge variant={savingsPct >= 20 ? "default" : savingsPct >= 0 ? "secondary" : "destructive"}>
            Taxa de economia: {savingsPct}%
          </Badge>
          <span className="text-xs text-muted-foreground">
            Contas: {formatBRL(kpis.accountBalance)} · Projetado:{" "}
            {formatBRL(kpis.projectedYearEndBalance)}
          </span>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {monthKpis.map((card) => (
            <Card key={card.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p
                  className={cn(
                    "text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl",
                    card.valueClass,
                  )}
                >
                  {formatBRL(card.value)}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de caixa</CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowChartLazy data={dashboard.cashFlow} meta={dashboard.cashFlowMeta} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Despesas por categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryExpenseChart data={dashboard.expensesByCategory} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Receitas × despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={dashboard.incomeVsExpenseByMonth} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Próximos compromissos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatBRL(kpis.nextThirty)}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <Link href="/app/recorrentes" className="text-cyan-400 underline-offset-2 hover:underline">
                  Recorrentes
                </Link>
                <span className="text-muted-foreground">·</span>
                <Link href="/app/dividas" className="text-cyan-400 underline-offset-2 hover:underline">
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
