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

export const metadata: Metadata = {
  title: "Painel · Finance OS",
};

export default async function DashboardPage() {
  const userId = await requireUserId();
  await db.execute(sql`select public.seed_default_categories(${userId})`);
  const [dashboard, notifications] = await Promise.all([
    getDashboard(userId),
    getDueNotifications(userId),
  ]);
  const { kpis } = dashboard;
  const savingsPct = Math.round(kpis.savingsRate * 100);

  const kpiCards: { label: string; value: number; hint?: string }[] = [
    { label: "Patrimônio líquido", value: kpis.netWorth },
    { label: "Saldo em contas", value: kpis.accountBalance },
    { label: "Receitas do mês", value: kpis.month.income },
    { label: "Despesas do mês", value: -kpis.month.expense },
  ];

  return (
    <AppShell title="Painel">
      <div className="space-y-5 md:space-y-6">
        <section className="flex flex-wrap items-center gap-2">
          <Badge variant={savingsPct >= 20 ? "default" : savingsPct >= 0 ? "secondary" : "destructive"}>
            Taxa de economia: {savingsPct}%
          </Badge>
          <span className="text-xs text-muted-foreground">
            Com base nas receitas e despesas deste mês
          </span>
        </section>

        <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {kpiCards.map((card) => (
            <Card key={card.label}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-muted-foreground sm:text-sm">
                  {card.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-lg font-semibold tracking-tight sm:text-2xl">
                {formatBRL(card.value)}
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Onde foi o dinheiro</CardTitle>
              <p className="text-sm text-muted-foreground">Despesas por categoria neste mês</p>
            </CardHeader>
            <CardContent>
              <CategoryExpenseChart data={dashboard.expensesByCategory} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Receitas × despesas</CardTitle>
              <p className="text-sm text-muted-foreground">Últimos 6 meses</p>
            </CardHeader>
            <CardContent>
              <IncomeExpenseChart data={dashboard.incomeVsExpenseByMonth} />
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 md:gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fluxo projetado — 30 dias</CardTitle>
            </CardHeader>
            <CardContent>
              <CashFlowChart data={dashboard.cashFlow} />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Próximos compromissos</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{formatBRL(kpis.nextThirty)}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Estimativa de recorrências e parcelas nos próximos 30 dias.
              </p>
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

        <Card>
          <CardHeader>
            <CardTitle>Vencimentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {notifications.length ? (
              notifications.map((item) => (
                <Link
                  href={item.href}
                  key={item.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 active:bg-muted"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.description} · {item.dueDate}
                    </p>
                  </div>
                  <Badge
                    variant={
                      item.severity === "overdue"
                        ? "destructive"
                        : item.severity === "due_today"
                          ? "default"
                          : "outline"
                    }
                  >
                    {item.severity === "overdue"
                      ? "Atrasado"
                      : item.severity === "due_today"
                        ? "Hoje"
                        : "Próximo"}
                  </Badge>
                </Link>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhum vencimento nos próximos 30 dias.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
