import { addDays, addMonths, format } from "date-fns";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { installments, recurrences } from "@/server/db/schema";
import { toNumber } from "@/server/auth";

export type ProjectionPoint = { label: string; date: string; balance: number };

function recurrenceOccursOn(
  recurrence: { frequency: string; dayOfMonth: number | null; startDate: string; endDate: string | null },
  date: Date,
) {
  const day = recurrence.dayOfMonth ?? 1;
  if (date < new Date(`${recurrence.startDate}T00:00:00`) ||
    (recurrence.endDate && date > new Date(`${recurrence.endDate}T23:59:59`))) return false;
  if (recurrence.frequency === "weekly") return date.getDay() === new Date(`${recurrence.startDate}T00:00:00`).getDay();
  return date.getDate() === Math.min(day, new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate());
}

export async function getCashFlow(userId: string, openingBalance: number, days = 30) {
  const [activeRecurrences, activeInstallments] = await Promise.all([
    db.select().from(recurrences).where(and(eq(recurrences.userId, userId), eq(recurrences.isActive, true), isNull(recurrences.deletedAt))),
    db.select().from(installments).where(and(eq(installments.userId, userId), eq(installments.isActive, true), isNull(installments.deletedAt))),
  ]);
  let balance = openingBalance;
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(new Date(), index + 1);
    const iso = format(date, "yyyy-MM-dd");
    for (const item of activeRecurrences) {
      if (recurrenceOccursOn(item, date)) balance += item.type === "income" ? toNumber(item.amount) : -toNumber(item.amount);
    }
    for (const item of activeInstallments) {
      const start = new Date(`${item.startDate}T00:00:00`);
      const months = (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
      if (date.getDate() === start.getDate() && months >= item.paidInstallments && months < item.totalInstallments) balance -= toNumber(item.installmentAmount);
    }
    return { label: format(date, "dd/MM"), date: iso, balance };
  });
}

export async function getProjections(userId: string, openingBalance: number): Promise<ProjectionPoint[]> {
  const cashFlow = await getCashFlow(userId, openingBalance, 365 * 5 + 1);
  const horizons = [
    ["30 dias", addDays(new Date(), 30)],
    ["90 dias", addDays(new Date(), 90)],
    ["6 meses", addMonths(new Date(), 6)],
    ["1 ano", addMonths(new Date(), 12)],
    ["5 anos", addMonths(new Date(), 60)],
  ] as const;
  return horizons.map(([label, date]) => {
    const target = format(date, "yyyy-MM-dd");
    return { label, date: target, balance: cashFlow.find((point) => point.date === target)?.balance ?? cashFlow.at(-1)?.balance ?? openingBalance };
  });
}
