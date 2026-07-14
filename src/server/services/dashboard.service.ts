import { addDays, format, startOfMonth, startOfYear } from "date-fns";
import { and, eq, gte, isNull, lte } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts, debts, installments, investments, recurrences, transactions } from "@/server/db/schema";
import { toNumber } from "@/server/auth";
import { generateAdvisorInsights } from "./advisor.service";
import { getCashFlow, getProjections } from "./projection.service";

const alive = (table: { deletedAt: unknown; userId: unknown }, userId: string) =>
  and(eq(table.userId as never, userId), isNull(table.deletedAt as never));

export async function getDashboard(userId: string) {
  const now = new Date();
  const monthStart = format(startOfMonth(now), "yyyy-MM-dd");
  const yearStart = format(startOfYear(now), "yyyy-MM-dd");
  const inPeriod = (from: string) => and(eq(transactions.userId, userId), isNull(transactions.deletedAt), gte(transactions.date, from), lte(transactions.date, format(now, "yyyy-MM-dd")));
  const [accountRows, debtRows, investmentRows, monthRows, yearRows, recurringRows, installmentRows, allTxRows] = await Promise.all([
    db.select().from(accounts).where(alive(accounts, userId)),
    db.select().from(debts).where(alive(debts, userId)),
    db.select().from(investments).where(alive(investments, userId)),
    db.select().from(transactions).where(inPeriod(monthStart)),
    db.select().from(transactions).where(inPeriod(yearStart)),
    db.select().from(recurrences).where(and(eq(recurrences.userId, userId), isNull(recurrences.deletedAt), eq(recurrences.isActive, true))),
    db.select().from(installments).where(and(eq(installments.userId, userId), isNull(installments.deletedAt), eq(installments.isActive, true))),
    db.select().from(transactions).where(and(eq(transactions.userId, userId), isNull(transactions.deletedAt))),
  ]);
  const initialBalances = accountRows.reduce((sum, row) => sum + toNumber(row.initialBalance), 0);
  const txDelta = allTxRows.reduce((sum, row) => {
    const amount = toNumber(row.amount);
    if (row.type === "income") return sum + amount;
    if (row.type === "expense") return sum - amount;
    return sum;
  }, 0);
  const accountBalance = initialBalances + txDelta;
  const debtBalance = debtRows.reduce((sum, row) => sum + toNumber(row.balance), 0);
  const invested = investmentRows.reduce((sum, row) => sum + toNumber(row.quantity) * toNumber(row.currentPrice), 0);
  const summarize = (rows: typeof monthRows) => ({
    income: rows.filter((row) => row.type === "income").reduce((sum, row) => sum + toNumber(row.amount), 0),
    expense: rows.filter((row) => row.type === "expense").reduce((sum, row) => sum + toNumber(row.amount), 0),
  });
  const month = summarize(monthRows), year = summarize(yearRows);
  const nextThirty = recurringRows.reduce((sum, row) => sum + toNumber(row.amount), 0) +
    installmentRows.reduce((sum, row) => sum + toNumber(row.installmentAmount) * Math.min(1, row.totalInstallments - row.paidInstallments), 0);
  const netWorth = accountBalance + invested - debtBalance;
  return {
    kpis: { netWorth, accountBalance, invested, debtBalance, month, year, nextThirty },
    cashFlow: await getCashFlow(userId, accountBalance, 30),
    projections: await getProjections(userId, accountBalance),
    insights: generateAdvisorInsights({ netWorth, monthlyIncome: month.income, monthlyExpense: month.expense, debts: debtBalance, invested }),
    generatedAt: addDays(now, 0),
  };
}
