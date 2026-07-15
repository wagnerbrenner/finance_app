import { addDays, differenceInCalendarDays, format, isBefore, parseISO, startOfDay } from "date-fns";
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

export type NotificationSeverity =
  | "overdue"
  | "due_today"
  | "due_in_1_day"
  | "due_in_2_days";

export type FinanceNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
  severity: NotificationSeverity;
  dueDate: string;
};

const severityOrder: Record<NotificationSeverity, number> = {
  overdue: 0,
  due_today: 1,
  due_in_1_day: 2,
  due_in_2_days: 3,
};

export function severityForDueDate(
  value: string,
  today = format(new Date(), "yyyy-MM-dd"),
): NotificationSeverity | null {
  const days = differenceInCalendarDays(parseISO(value), parseISO(today));
  if (days < 0) return "overdue";
  if (days === 0) return "due_today";
  if (days === 1) return "due_in_1_day";
  if (days === 2) return "due_in_2_days";
  return null;
}

function nextMonthlyDue(day: number) {
  const now = startOfDay(new Date());
  let candidate = new Date(now.getFullYear(), now.getMonth(), Math.min(day, 28));
  if (isBefore(candidate, now)) {
    candidate = new Date(now.getFullYear(), now.getMonth() + 1, Math.min(day, 28));
  }
  return format(candidate, "yyyy-MM-dd");
}

/** Receitas (salário/freela/extras) não entram em aviso de vencimento. */
function isIncomeLike(description: string, type?: string) {
  if (type === "income") return true;
  const d = description.toLowerCase();
  return (
    d.includes("salário") ||
    d.includes("salario") ||
    d.includes("freela") ||
    d.includes("freelance") ||
    d.includes("uber") ||
    d.includes("extra") ||
    d.includes("receita")
  );
}

export async function getDueNotifications(
  userId: string,
  options?: { skipEnsure?: boolean },
): Promise<FinanceNotification[]> {
  if (!options?.skipEnsure) {
    await ensureUpcomingOccurrences(userId);
    await markDueOccurrences(userId);
  }

  const today = format(new Date(), "yyyy-MM-dd");
  const limit = format(addDays(parseISO(today), 2), "yyyy-MM-dd");

  const [recurring, debtRows, installmentRows, consortiumRows, billOccurrences] = await Promise.all([
    db
      .select()
      .from(recurrences)
      .where(
        and(
          eq(recurrences.userId, userId),
          eq(recurrences.isActive, true),
          eq(recurrences.type, "expense"),
          isNull(recurrences.deletedAt),
        ),
      ),
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
          // Só não pagas (pendentes/atrasadas). Pagas ficam de fora.
          inArray(recurringBillOccurrences.status, ["scheduled", "due"]),
          lte(recurringBillOccurrences.dueDate, limit),
          isNull(recurringBillOccurrences.deletedAt),
          isNull(recurringBills.deletedAt),
          eq(recurringBills.isActive, true),
        ),
      ),
  ]);

  const raw: Omit<FinanceNotification, "severity">[] = [
    ...billOccurrences.map((item) => ({
      id: `bill-occ-${item.id}`,
      title: item.billName,
      description: `Conta a pagar · estimado ${formatBRL(toNumber(item.expectedAmount))}`,
      href: "/app/recorrentes",
      dueDate: item.dueDate,
    })),
    ...recurring
      .filter((item) => !isIncomeLike(item.description, item.type))
      .map((item) => ({
        id: `recurrence-${item.id}`,
        title: item.description,
        description: "Despesa recorrente pendente",
        href: "/app/cartoes",
        dueDate: nextMonthlyDue(item.dayOfMonth ?? 1),
      })),
    ...debtRows
      .filter((item) => item.dueDate && toNumber(item.balance) > 0)
      .map((item) => ({
        id: `debt-${item.id}`,
        title: item.name,
        description: "Vencimento de dívida",
        href: "/app/dividas",
        dueDate: item.dueDate!,
      })),
    ...installmentRows
      .filter((item) => item.paidInstallments < item.totalInstallments)
      .map((item) => ({
        id: `installment-${item.id}`,
        title: item.description,
        description: `Parcela ${item.paidInstallments + 1} de ${item.totalInstallments}`,
        href: "/app/cartoes",
        dueDate: nextMonthlyDue(new Date(`${item.startDate}T12:00:00`).getDate()),
      })),
    ...consortiumRows
      .filter((item) => item.nextDueDate && item.status !== "completed")
      .map((item) => ({
        id: `consortium-${item.id}`,
        title: item.name,
        description: "Parcela do consórcio",
        href: "/app/investimentos",
        dueDate: item.nextDueDate!,
      })),
  ];

  const notifications: FinanceNotification[] = [];
  for (const item of raw) {
    if (isIncomeLike(item.title) || isIncomeLike(item.description)) continue;
    const severity = severityForDueDate(item.dueDate, today);
    if (!severity) continue;
    notifications.push({
      ...item,
      severity,
      // Exibe data em pt-BR no texto auxiliar via dueDate ISO (UI formata)
      dueDate: item.dueDate,
    });
  }

  return notifications.sort(
    (a, b) => severityOrder[a.severity] - severityOrder[b.severity] || a.dueDate.localeCompare(b.dueDate),
  );
}
