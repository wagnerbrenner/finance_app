import { and, desc, eq, isNull, or, sql } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import { IncomeOnboardingDialog } from "@/features/renda/components/income-onboarding-dialog";
import { deleteTransaction, deleteUberPeriod } from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { categories, transactions, uberPeriods } from "@/server/db/schema";
import { getIncomePreferences } from "@/server/services/income-preferences.service";
import { formatBRL, formatDate } from "@/shared/lib/formatters";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function RendaPage() {
  const userId = await requireUserId();
  await db.execute(sql`select public.seed_default_categories(${userId})`);
  const prefs = await getIncomePreferences(userId);

  const [salaryCategory] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(eq(categories.userId, userId), eq(categories.name, "Salário"), isNull(categories.deletedAt)),
    )
    .limit(1);

  const salaryRows = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.type, "income"),
        isNull(transactions.deletedAt),
        salaryCategory
          ? or(eq(transactions.categoryId, salaryCategory.id), eq(transactions.description, "Salário"))
          : eq(transactions.description, "Salário"),
      ),
    )
    .orderBy(desc(transactions.date), desc(transactions.createdAt));

  const periodRows = await db
    .select()
    .from(uberPeriods)
    .where(and(eq(uberPeriods.userId, userId), isNull(uberPeriods.deletedAt)))
    .orderBy(desc(uberPeriods.periodMonth));

  const freelanceRows = periodRows.filter((r) => r.source === "freelance");
  const uberRows = periodRows.filter((r) => r.source === "uber");

  const salaryTotal = salaryRows.reduce((s, r) => s + toNumber(r.amount), 0);
  const freelanceGross = freelanceRows.reduce((s, r) => s + toNumber(r.grossRevenue), 0);
  const uberGross = uberRows.reduce((s, r) => s + toNumber(r.grossRevenue), 0);
  const costs = periodRows.reduce(
    (s, r) =>
      s +
      toNumber(r.fuelCost) +
      toNumber(r.tolls) +
      toNumber(r.wash) +
      toNumber(r.maintenance) +
      toNumber(r.otherCosts),
    0,
  );

  const periodTable = (items: typeof periodRows, empty: string) => (
    <Card>
      <CardContent className="pt-6">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{empty}</p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {items.map((row) => {
                const rowCosts =
                  toNumber(row.fuelCost) +
                  toNumber(row.tolls) +
                  toNumber(row.wash) +
                  toNumber(row.maintenance) +
                  toNumber(row.otherCosts);
                return (
                  <div key={row.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{formatDate(row.periodMonth, "MM/yyyy")}</p>
                        <p className="text-xs text-muted-foreground">
                          {row.daysWorked} dias · {toNumber(row.hoursWorked)} h
                        </p>
                      </div>
                      <ConfirmDeleteButton
                        id={row.id}
                        path="/app/renda"
                        action={deleteUberPeriod}
                        label="período"
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-sm">
                      <span className="text-muted-foreground">Receita</span>
                      <span>{formatBRL(toNumber(row.grossRevenue))}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium">
                      <span>Líquido</span>
                      <span>{formatBRL(toNumber(row.grossRevenue) - rowCosts)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Período</TableHead>
                    <TableHead>Trabalho</TableHead>
                    <TableHead className="text-right">Receita</TableHead>
                    <TableHead className="text-right">Líquido</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((row) => {
                    const rowCosts =
                      toNumber(row.fuelCost) +
                      toNumber(row.tolls) +
                      toNumber(row.wash) +
                      toNumber(row.maintenance) +
                      toNumber(row.otherCosts);
                    return (
                      <TableRow key={row.id}>
                        <TableCell>{formatDate(row.periodMonth, "MM/yyyy")}</TableCell>
                        <TableCell>
                          {row.daysWorked} dias · {toNumber(row.hoursWorked)} h
                        </TableCell>
                        <TableCell className="text-right">
                          {formatBRL(toNumber(row.grossRevenue))}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatBRL(toNumber(row.grossRevenue) - rowCosts)}
                        </TableCell>
                        <TableCell className="text-right">
                          <ConfirmDeleteButton
                            id={row.id}
                            path="/app/renda"
                            action={deleteUberPeriod}
                            label="período"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );

  const defaultTab = "salary";

  return (
    <AppShell title="Renda">
      {!prefs.incomeOnboardingDone ? <IncomeOnboardingDialog open /> : null}
      <div className="space-y-6">
        <PageHeader title="Renda" />
        <Tabs defaultValue={defaultTab}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
            <TabsTrigger value="salary">Salário</TabsTrigger>
            {prefs.hasFreelance ? <TabsTrigger value="freelance">Freela</TabsTrigger> : null}
            {prefs.hasUber ? <TabsTrigger value="uber">Uber</TabsTrigger> : null}
            <TabsTrigger value="summary">Resumo</TabsTrigger>
          </TabsList>

          <TabsContent value="salary" className="space-y-4 pt-4">
            <Card>
              <CardContent className="pt-6">
                {salaryRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Nenhum salário registrado. Use <strong>Novo lançamento</strong> → Receita → Salário.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 md:hidden">
                      {salaryRows.map((row) => (
                        <div key={row.id} className="rounded-lg border p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-medium">{row.description}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(row.date)}</p>
                            </div>
                            <ConfirmDeleteButton
                              id={row.id}
                              path="/app/renda"
                              action={deleteTransaction}
                              label="lançamento"
                            />
                          </div>
                          <p className="mt-2 text-right font-medium text-teal-400">
                            {formatBRL(toNumber(row.amount))}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="hidden md:block">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Data</TableHead>
                            <TableHead>Descrição</TableHead>
                            <TableHead className="text-right">Valor</TableHead>
                            <TableHead />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salaryRows.map((row) => (
                            <TableRow key={row.id}>
                              <TableCell>{formatDate(row.date)}</TableCell>
                              <TableCell className="font-medium">{row.description}</TableCell>
                              <TableCell className="text-right text-teal-400">
                                {formatBRL(toNumber(row.amount))}
                              </TableCell>
                              <TableCell className="text-right">
                                <ConfirmDeleteButton
                                  id={row.id}
                                  path="/app/renda"
                                  action={deleteTransaction}
                                  label="lançamento"
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {prefs.hasFreelance ? (
            <TabsContent value="freelance" className="space-y-4 pt-4">
              {periodTable(
                freelanceRows,
                "Nenhum período freela. Use Novo lançamento → Receita → Freela.",
              )}
            </TabsContent>
          ) : null}

          {prefs.hasUber ? (
            <TabsContent value="uber" className="space-y-4 pt-4">
              {periodTable(
                uberRows,
                "Nenhum período Uber. Use Novo lançamento → Receita → Uber.",
              )}
            </TabsContent>
          ) : null}

          <TabsContent value="summary" className="grid gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">Salário (histórico)</p>
                <p className="text-2xl font-semibold">{formatBRL(salaryTotal)}</p>
              </CardContent>
            </Card>
            {prefs.hasFreelance ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Freela (bruto)</p>
                  <p className="text-2xl font-semibold">{formatBRL(freelanceGross)}</p>
                </CardContent>
              </Card>
            ) : null}
            {prefs.hasUber ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground">Uber (bruto)</p>
                  <p className="text-2xl font-semibold">{formatBRL(uberGross)}</p>
                </CardContent>
              </Card>
            ) : null}
            <Card className="sm:col-span-2 lg:col-span-3">
              <CardContent className="pt-6">
                <p className="font-medium">Total bruto combinado</p>
                <p className="mt-1 text-2xl font-semibold">
                  {formatBRL(salaryTotal + freelanceGross + uberGross)}
                </p>
                {(prefs.hasFreelance || prefs.hasUber) && costs > 0 ? (
                  <p className="mt-2 text-sm text-muted-foreground">
                    Custos de freela/Uber: {formatBRL(costs)} · Líquido estimado:{" "}
                    {formatBRL(salaryTotal + freelanceGross + uberGross - costs)}
                  </p>
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
