import { format, startOfMonth, startOfYear, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/server/db";
import {
  accounts,
  categories,
  debts,
  installments,
  investments,
  recurrences,
  transactions,
} from "@/server/db/schema";
import { toNumber } from "@/server/auth";
import { generateAdvisorInsights } from "./advisor.service";
import { getCashFlowAndProjections } from "./projection.service";

const alive = (table: { deletedAt: unknown; userId: unknown }, userId: string) =>
  and(eq(table.userId as never, userId), isNull(table.deletedAt as never));

export type CategoryExpense = { name: string; total: number; color: string | null };
export type MonthlyComparison = { label: string; month: string; income: number; expense: number };

export async function getDashboard(userId: string) {
  const now = new Date();
  const today = format(now, "yyyy-MM-dd");
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const yearStart = format(startOfYear(now), "yyyy-MM-dd");
  const sixMonthsAgo = format(startOfMonth(subMonths(now, 5)), "yyyy-MM-dd");

  const [
    accountRows,
    debtRows,
    investmentRows,
    monthAgg,
    yearAgg,
    txDeltaRow,
    recurringRows,
    installmentRows,
    categoryRows,
    monthlyRows,
  ] = await Promise.all([
    db.select().from(accounts).where(alive(accounts, userId)),
    db.select().from(debts).where(alive(debts, userId)),
    db.select().from(investments).where(alive(investments, userId)),
    db
      .select({
        type: transactions.type,
        total: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
          gte(transactions.date, monthStart),
          lte(transactions.date, today),
        ),
      )
      .groupBy(transactions.type),
    db
      .select({
        type: transactions.type,
        total: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
          gte(transactions.date, yearStart),
          lte(transactions.date, today),
        ),
      )
      .groupBy(transactions.type),
    db
      .select({
        income: sql<string>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`,
        expense: sql<string>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`,
      })
      .from(transactions)
      .where(and(eq(transactions.userId, userId), isNull(transactions.deletedAt))),
    db
      .select()
      .from(recurrences)
      .where(and(eq(recurrences.userId, userId), isNull(recurrences.deletedAt), eq(recurrences.isActive, true))),
    db
      .select()
      .from(installments)
      .where(and(eq(installments.userId, userId), isNull(installments.deletedAt), eq(installments.isActive, true))),
    db
      .select({
        name: sql<string>`coalesce(${categories.name}, 'Sem categoria')`,
        color: categories.color,
        total: sql<string>`coalesce(sum(${transactions.amount}), 0)`,
      })
      .from(transactions)
      .leftJoin(categories, eq(transactions.categoryId, categories.id))
      .where(
        and(
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
          eq(transactions.type, "expense"),
          gte(transactions.date, monthStart),
          lte(transactions.date, today),
        ),
      )
      .groupBy(categories.name, categories.color)
      .orderBy(sql`sum(${transactions.amount}) desc`),
    db
      .select({
        month: sql<string>`to_char(date_trunc('month', ${transactions.date}::timestamp), 'YYYY-MM')`,
        income: sql<string>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`,
        expense: sql<string>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          isNull(transactions.deletedAt),
          gte(transactions.date, sixMonthsAgo),
          lte(transactions.date, today),
        ),
      )
      .groupBy(sql`date_trunc('month', ${transactions.date}::timestamp)`)
      .orderBy(sql`date_trunc('month', ${transactions.date}::timestamp)`),
  ]);

  const initialBalances = accountRows.reduce((sum, row) => sum + toNumber(row.initialBalance), 0);
  const txDelta = toNumber(txDeltaRow[0]?.income) - toNumber(txDeltaRow[0]?.expense);
  const accountBalance = initialBalances + txDelta;
  const debtBalance = debtRows.reduce((sum, row) => sum + toNumber(row.balance), 0);
  const invested = investmentRows.reduce(
    (sum, row) => sum + toNumber(row.quantity) * toNumber(row.currentPrice),
    0,
  );

  const pick = (rows: { type: string; total: string }[], type: string) =>
    toNumber(rows.find((r) => r.type === type)?.total);
  const month = { income: pick(monthAgg, "income"), expense: pick(monthAgg, "expense") };
  const year = { income: pick(yearAgg, "income"), expense: pick(yearAgg, "expense") };
  const savingsRate = month.income > 0 ? (month.income - month.expense) / month.income : 0;

  const nextThirty =
    recurringRows.reduce((sum, row) => sum + toNumber(row.amount), 0) +
    installmentRows.reduce(
      (sum, row) =>
        sum + toNumber(row.installmentAmount) * Math.min(1, row.totalInstallments - row.paidInstallments),
      0,
    );

  const expensesByCategory: CategoryExpense[] = categoryRows.map((row) => ({
    name: row.name,
    total: toNumber(row.total),
    color: row.color,
  }));

  const byMonthKey = new Map(monthlyRows.map((r) => [r.month, r]));
  const incomeVsExpenseByMonth: MonthlyComparison[] = Array.from({ length: 6 }, (_, i) => {
    const d = startOfMonth(subMonths(now, 5 - i));
    const key = format(d, "yyyy-MM");
    const row = byMonthKey.get(key);
    return {
      month: key,
      label: format(d, "MMM", { locale: ptBR }),
      income: toNumber(row?.income),
      expense: toNumber(row?.expense),
    };
  });

  const netWorth = accountBalance + invested - debtBalance;
  const { cashFlow, projections } = await getCashFlowAndProjections(userId, accountBalance);

  return {
    kpis: {
      netWorth,
      accountBalance,
      invested,
      debtBalance,
      month,
      year,
      nextThirty,
      savingsRate,
    },
    expensesByCategory,
    incomeVsExpenseByMonth,
    cashFlow,
    projections,
    insights: generateAdvisorInsights({
      netWorth,
      monthlyIncome: month.income,
      monthlyExpense: month.expense,
      debts: debtBalance,
      invested,
    }),
  };
}
