import { addDays, differenceInCalendarDays, endOfYear, format, getDaysInMonth, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { installments, recurrences } from "@/server/db/schema";
import { toNumber } from "@/server/auth";

export type ProjectionPoint = { label: string; date: string; balance: number };
export type CashFlowPoint = {
  label: string;
  date: string;
  balance: number;
  income: number;
  expense: number;
};

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

function projectDaysDetailed(
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
    let income = 0;
    let expense = 0;

    for (const item of activeRecurrences) {
      if (recurrenceOccursOn(item, date)) {
        const amount = toNumber(item.amount);
        if (item.type === "income") {
          income += amount;
          balance += amount;
        } else {
          expense += amount;
          balance -= amount;
        }
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
        const amount = toNumber(item.installmentAmount);
        expense += amount;
        balance -= amount;
      }
    }

    points.push({
      label: format(date, "dd/MM", { locale: ptBR }),
      date: iso,
      balance,
      income,
      expense,
    });
  }

  return points;
}

/** Agrega dias em semanas para o gráfico de 3 meses ficar legível. */
export function aggregateCashFlowWeekly(daily: CashFlowPoint[]): CashFlowPoint[] {
  if (daily.length === 0) return [];
  const weeks: CashFlowPoint[] = [];
  for (let i = 0; i < daily.length; i += 7) {
    const chunk = daily.slice(i, i + 7);
    const last = chunk.at(-1)!;
    weeks.push({
      label: format(new Date(`${last.date}T12:00:00`), "dd MMM", { locale: ptBR }).replace(".", ""),
      date: last.date,
      balance: last.balance,
      income: chunk.reduce((s, p) => s + p.income, 0),
      expense: chunk.reduce((s, p) => s + p.expense, 0),
    });
  }
  return weeks;
}

/** Dias restantes até 31/12 do ano corrente (inclusive). */
export function daysUntilYearEnd(from = new Date()) {
  const end = startOfDay(endOfYear(from));
  const today = startOfDay(from);
  return Math.max(0, differenceInCalendarDays(end, today));
}

const THREE_MONTHS_DAYS = 90;

export async function getCashFlow(userId: string, openingBalance: number, days = THREE_MONTHS_DAYS) {
  const { activeRecurrences, activeInstallments } = await loadProjectionInputs(userId);
  const capped = Math.min(days, daysUntilYearEnd() || 1);
  return projectDaysDetailed(openingBalance, capped, activeRecurrences, activeInstallments);
}

/** Fluxo dos próximos ~3 meses (semanal) + snapshots até o fim do ano. */
export async function getCashFlowAndProjections(userId: string, openingBalance: number) {
  const { activeRecurrences, activeInstallments } = await loadProjectionInputs(userId);
  const now = new Date();
  const horizonDays = daysUntilYearEnd(now);
  const full =
    horizonDays > 0
      ? projectDaysDetailed(openingBalance, horizonDays, activeRecurrences, activeInstallments)
      : [
          {
            label: format(now, "dd/MM", { locale: ptBR }),
            date: format(now, "yyyy-MM-dd"),
            balance: openingBalance,
            income: 0,
            expense: 0,
          },
        ];

  const threeMonthDays = Math.min(THREE_MONTHS_DAYS, full.length);
  const cashFlowDaily = full.slice(0, threeMonthDays);
  const cashFlow = aggregateCashFlowWeekly(cashFlowDaily);

  const yearEnd = format(endOfYear(now), "yyyy-MM-dd");
  const threeMonthsDate = addDays(now, threeMonthDays);
  const candidates: [string, Date][] = [
    ["Daqui a 1 mês", addDays(now, 30)],
    ["Daqui a 2 meses", addDays(now, 60)],
    ["Daqui a 3 meses", threeMonthsDate],
    ["Fim do ano", endOfYear(now)],
  ];

  const byDate = new Map(full.map((p) => [p.date, p.balance]));
  const seen = new Set<string>();
  const projections: ProjectionPoint[] = [];

  for (const [label, date] of candidates) {
    const target = format(date, "yyyy-MM-dd");
    if (target > yearEnd) continue;
    if (target <= format(now, "yyyy-MM-dd")) continue;
    if (seen.has(target)) continue;
    seen.add(target);
    projections.push({
      label,
      date: target,
      balance: byDate.get(target) ?? full.at(-1)?.balance ?? openingBalance,
    });
  }

  if (!projections.some((p) => p.date === yearEnd)) {
    projections.push({
      label: "Fim do ano",
      date: yearEnd,
      balance: byDate.get(yearEnd) ?? full.at(-1)?.balance ?? openingBalance,
    });
  }

  const periodIncome = cashFlowDaily.reduce((s, p) => s + p.income, 0);
  const periodExpense = cashFlowDaily.reduce((s, p) => s + p.expense, 0);

  return {
    cashFlow,
    projections,
    projectedYearEndBalance: byDate.get(yearEnd) ?? full.at(-1)?.balance ?? openingBalance,
    cashFlowMeta: {
      days: threeMonthDays,
      openingBalance,
      closingBalance: cashFlowDaily.at(-1)?.balance ?? openingBalance,
      periodIncome,
      periodExpense,
    },
  };
}

export async function getProjections(userId: string, openingBalance: number): Promise<ProjectionPoint[]> {
  const { projections } = await getCashFlowAndProjections(userId, openingBalance);
  return projections;
}
