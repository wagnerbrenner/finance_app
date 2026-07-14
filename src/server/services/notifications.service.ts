import { addMonths, format, isBefore, startOfDay } from "date-fns";
import { and, eq, inArray, isNull, lte } from "drizzle-orm";
import {
  consortia,
  debts,
  installments,
  recurringBillOccurrences,
  recurringBills,
  recurrences,
} from "@/server/db/schema";
import { db } from "@/server/db";
import { ensureUpcomingOccurrences, markDueOccurrences } from "@/server/services/recurring-bills.service";
import { formatBRL } from "@/shared/lib/formatters";
import { toNumber } from "@/server/auth";

export type FinanceNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
  severity: "overdue" | "due_today" | "upcoming";
  dueDate: string;
};

const severity = (value: string): FinanceNotification["severity"] => {
  const today = format(new Date(), "yyyy-MM-dd");
  return value < today ? "overdue" : value === today ? "due_today" : "upcoming";
};

const nextMonthlyDate = (day: number) => {
  const now = new Date();
  const candidate = new Date(now.getFullYear(), now.getMonth(), Math.min(day, 28));
  return format(
    isBefore(candidate, startOfDay(now)) ? addMonths(candidate, 1) : candidate,
    "yyyy-MM-dd",
  );
};

export async function getDueNotifications(userId: string): Promise<FinanceNotification[]> {
  await ensureUpcomingOccurrences(userId);
  await markDueOccurrences(userId);

  const limit = format(addMonths(new Date(), 1), "yyyy-MM-dd");

  const [recurring, debtRows, installmentRows, consortiumRows, billOccurrences] = await Promise.all([
    db
      .select()
      .from(recurrences)
      .where(and(eq(recurrences.userId, userId), eq(recurrences.isActive, true), isNull(recurrences.deletedAt))),
    db.select().from(debts).where(and(eq(debts.userId, userId), isNull(debts.deletedAt))),
    db
      .select()
      .from(installments)
      .where(
        and(eq(installments.userId, userId), eq(installments.isActive, true), isNull(installments.deletedAt)),
      ),
    db.select().from(consortia).where(and(eq(consortia.userId, userId), isNull(consortia.deletedAt))),
    db
      .select({
        id: recurringBillOccurrences.id,
        dueDate: recurringBillOccurrences.dueDate,
        expectedAmount: recurringBillOccurrences.expectedAmount,
        status: recurringBillOccurrences.status,
        billName: recurringBills.name,
      })
      .from(recurringBillOccurrences)
      .innerJoin(recurringBills, eq(recurringBillOccurrences.billId, recurringBills.id))
      .where(
        and(
          eq(recurringBillOccurrences.userId, userId),
          inArray(recurringBillOccurrences.status, ["scheduled", "due"]),
          lte(recurringBillOccurrences.dueDate, limit),
          isNull(recurringBillOccurrences.deletedAt),
          isNull(recurringBills.deletedAt),
        ),
      ),
  ]);

  const notifications: FinanceNotification[] = [
    ...billOccurrences.map((item) => ({
      id: `bill-occ-${item.id}`,
      title: item.billName,
      description: `Conta recorrente · estimado ${formatBRL(toNumber(item.expectedAmount))}`,
      href: "/app/recorrentes",
      dueDate: item.dueDate,
      severity: severity(item.dueDate),
    })),
    ...recurring.map((item) => ({
      id: `recurrence-${item.id}`,
      title: item.description,
      description: "Lançamento recorrente",
      href: "/app/cartoes",
      dueDate: nextMonthlyDate(item.dayOfMonth ?? 1),
      severity: "upcoming" as const,
    })),
    ...debtRows
      .filter((item) => item.dueDate)
      .map((item) => ({
        id: `debt-${item.id}`,
        title: item.name,
        description: "Vencimento de dívida",
        href: "/app/dividas",
        dueDate: item.dueDate!,
        severity: severity(item.dueDate!),
      })),
    ...installmentRows
      .filter((item) => item.paidInstallments < item.totalInstallments)
      .map((item) => ({
        id: `installment-${item.id}`,
        title: item.description,
        description: `Parcela ${item.paidInstallments + 1} de ${item.totalInstallments}`,
        href: "/app/cartoes",
        dueDate: nextMonthlyDate(new Date(item.startDate).getDate()),
        severity: "upcoming" as const,
      })),
    ...consortiumRows
      .filter((item) => item.nextDueDate)
      .map((item) => ({
        id: `consortium-${item.id}`,
        title: item.name,
        description: "Parcela do consórcio",
        href: "/app/investimentos",
        dueDate: item.nextDueDate!,
        severity: severity(item.nextDueDate!),
      })),
  ]
    .filter((item) => item.dueDate <= limit)
    .map((item) => ({ ...item, severity: severity(item.dueDate) }));

  const order = { overdue: 0, due_today: 1, upcoming: 2 };
  return notifications.sort(
    (a, b) => order[a.severity] - order[b.severity] || a.dueDate.localeCompare(b.dueDate),
  );
}
