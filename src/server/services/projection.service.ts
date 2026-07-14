import { addDays, addMonths, format, getDaysInMonth } from "date-fns";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { installments, recurrences } from "@/server/db/schema";
import { toNumber } from "@/server/auth";

export type ProjectionPoint = { label: string; date: string; balance: number };
export type CashFlowPoint = { label: string; date: string; balance: number };

type RecurrenceRow = {
  frequency: string;
  dayOfMonth: number | null;
  startDate: string;
  endDate: string | null;
  type: string;
  amount: string;
};

type InstallmentRow = {
  startDate: string;
  paidInstallments: number;
  totalInstallments: number;
  installmentAmount: string;
};

function recurrenceOccursOn(recurrence: RecurrenceRow, date: Date) {
  const start = new Date(`${recurrence.startDate}T00:00:00`);
  if (date < start) return false;
  if (recurrence.endDate && date > new Date(`${recurrence.endDate}T23:59:59`)) return false;

  const day = recurrence.dayOfMonth ?? 1;
  const dim = getDaysInMonth(date);

  if (recurrence.frequency === "weekly") {
    return date.getDay() === start.getDay();
  }
  if (recurrence.frequency === "yearly") {
    return date.getMonth() === start.getMonth() && date.getDate() === Math.min(day, dim);
  }
  // monthly (default)
  return date.getDate() === Math.min(day, dim);
}

async function loadProjectionInputs(userId: string) {
  const [activeRecurrences, activeInstallments] = await Promise.all([
    db
      .select()
      .from(recurrences)
      .where(and(eq(recurrences.userId, userId), eq(recurrences.isActive, true), isNull(recurrences.deletedAt))),
    db
      .select()
      .from(installments)
      .where(and(eq(installments.userId, userId), eq(installments.isActive, true), isNull(installments.deletedAt))),
  ]);
  return { activeRecurrences, activeInstallments };
}

function projectDays(
  openingBalance: number,
  days: number,
  activeRecurrences: RecurrenceRow[],
  activeInstallments: InstallmentRow[],
): CashFlowPoint[] {
  let balance = openingBalance;
  const points: CashFlowPoint[] = [];

  for (let index = 0; index < days; index += 1) {
    const date = addDays(new Date(), index + 1);
    const iso = format(date, "yyyy-MM-dd");

    for (const item of activeRecurrences) {
      if (recurrenceOccursOn(item, date)) {
        balance += item.type === "income" ? toNumber(item.amount) : -toNumber(item.amount);
      }
    }

    for (const item of activeInstallments) {
      const start = new Date(`${item.startDate}T00:00:00`);
      const months =
        (date.getFullYear() - start.getFullYear()) * 12 + date.getMonth() - start.getMonth();
      if (
        date.getDate() === start.getDate() &&
        months >= item.paidInstallments &&
        months < item.totalInstallments
      ) {
        balance -= toNumber(item.installmentAmount);
      }
    }

    points.push({ label: format(date, "dd/MM"), date: iso, balance });
  }

  return points;
}

export async function getCashFlow(userId: string, openingBalance: number, days = 30) {
  const { activeRecurrences, activeInstallments } = await loadProjectionInputs(userId);
  return projectDays(openingBalance, days, activeRecurrences, activeInstallments);
}

/** Single pass: 30-day chart + horizon snapshots without recomputing 5 years twice. */
export async function getCashFlowAndProjections(userId: string, openingBalance: number) {
  const { activeRecurrences, activeInstallments } = await loadProjectionInputs(userId);
  const horizonDays = 365 * 5 + 1;
  const full = projectDays(openingBalance, horizonDays, activeRecurrences, activeInstallments);
  const cashFlow = full.slice(0, 30);

  const horizons = [
    ["30 dias", addDays(new Date(), 30)],
    ["90 dias", addDays(new Date(), 90)],
    ["6 meses", addMonths(new Date(), 6)],
    ["1 ano", addMonths(new Date(), 12)],
    ["5 anos", addMonths(new Date(), 60)],
  ] as const;

  const byDate = new Map(full.map((p) => [p.date, p.balance]));
  const projections: ProjectionPoint[] = horizons.map(([label, date]) => {
    const target = format(date, "yyyy-MM-dd");
    return {
      label,
      date: target,
      balance: byDate.get(target) ?? full.at(-1)?.balance ?? openingBalance,
    };
  });

  return { cashFlow, projections };
}

export async function getProjections(userId: string, openingBalance: number): Promise<ProjectionPoint[]> {
  const { projections } = await getCashFlowAndProjections(userId, openingBalance);
  return projections;
}
