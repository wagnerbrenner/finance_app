import { addMonths, format, getDaysInMonth, isBefore, startOfDay } from "date-fns";
import { and, eq, inArray, isNull, lte, sql } from "drizzle-orm";
import { db } from "@/server/db";
import { accounts, recurringBillOccurrences, recurringBills, transactions } from "@/server/db/schema";
import { toNumber } from "@/server/auth";

export function dueDateForMonth(year: number, monthIndex: number, dayOfMonth: number) {
  const dim = getDaysInMonth(new Date(year, monthIndex, 1));
  const day = Math.min(Math.max(dayOfMonth, 1), dim);
  return format(new Date(year, monthIndex, day), "yyyy-MM-dd");
}

/** Next due date on/after today for a given day-of-month. */
export function nextDueDate(dayOfMonth: number, from = new Date()) {
  const today = startOfDay(from);
  const thisMonth = new Date(today.getFullYear(), today.getMonth(), Math.min(dayOfMonth, getDaysInMonth(today)));
  if (isBefore(thisMonth, today)) {
    const next = addMonths(new Date(today.getFullYear(), today.getMonth(), 1), 1);
    return dueDateForMonth(next.getFullYear(), next.getMonth(), dayOfMonth);
  }
  return format(thisMonth, "yyyy-MM-dd");
}

export async function ensureOccurrenceForBill(
  userId: string,
  bill: {
    id: string;
    dayOfMonth: number;
    estimatedAmount: string;
  },
  dueDate?: string,
) {
  const target = dueDate ?? nextDueDate(bill.dayOfMonth);
  const existing = await db
    .select({ id: recurringBillOccurrences.id })
    .from(recurringBillOccurrences)
    .where(
      and(
        eq(recurringBillOccurrences.billId, bill.id),
        eq(recurringBillOccurrences.dueDate, target),
        isNull(recurringBillOccurrences.deletedAt),
      ),
    )
    .limit(1);

  if (existing[0]) return existing[0].id;

  const today = format(new Date(), "yyyy-MM-dd");
  const status = target <= today ? "due" : "scheduled";

  const [row] = await db
    .insert(recurringBillOccurrences)
    .values({
      userId,
      billId: bill.id,
      dueDate: target,
      expectedAmount: bill.estimatedAmount,
      status,
    })
    .returning({ id: recurringBillOccurrences.id });

  return row.id;
}

/** Ensure every active bill has a pending occurrence for the current/next cycle. */
export async function ensureUpcomingOccurrences(userId: string) {
  const bills = await db
    .select()
    .from(recurringBills)
    .where(
      and(eq(recurringBills.userId, userId), eq(recurringBills.isActive, true), isNull(recurringBills.deletedAt)),
    );

  for (const bill of bills) {
    await ensureOccurrenceForBill(userId, bill);
    // Also seed following month if current occurrence is already due/paid window
    const following = nextDueDate(bill.dayOfMonth, addMonths(new Date(), 1));
    const open = await db
      .select({ id: recurringBillOccurrences.id, status: recurringBillOccurrences.status })
      .from(recurringBillOccurrences)
      .where(
        and(
          eq(recurringBillOccurrences.billId, bill.id),
          inArray(recurringBillOccurrences.status, ["scheduled", "due"]),
          isNull(recurringBillOccurrences.deletedAt),
        ),
      )
      .limit(1);
    if (!open[0]) {
      await ensureOccurrenceForBill(userId, bill, following);
    }
  }
}

export async function markDueOccurrences(userId: string) {
  const today = format(new Date(), "yyyy-MM-dd");
  await db
    .update(recurringBillOccurrences)
    .set({ status: "due", updatedAt: new Date() })
    .where(
      and(
        eq(recurringBillOccurrences.userId, userId),
        eq(recurringBillOccurrences.status, "scheduled"),
        lte(recurringBillOccurrences.dueDate, today),
        isNull(recurringBillOccurrences.deletedAt),
      ),
    );
}

export async function listPendingOccurrences(userId: string) {
  await ensureUpcomingOccurrences(userId);
  await markDueOccurrences(userId);

  const horizon = format(addMonths(new Date(), 1), "yyyy-MM-dd");
  return db
    .select({
      id: recurringBillOccurrences.id,
      billId: recurringBillOccurrences.billId,
      billName: recurringBills.name,
      dueDate: recurringBillOccurrences.dueDate,
      expectedAmount: recurringBillOccurrences.expectedAmount,
      status: recurringBillOccurrences.status,
      accountId: recurringBills.accountId,
      categoryId: recurringBills.categoryId,
    })
    .from(recurringBillOccurrences)
    .innerJoin(recurringBills, eq(recurringBillOccurrences.billId, recurringBills.id))
    .where(
      and(
        eq(recurringBillOccurrences.userId, userId),
        inArray(recurringBillOccurrences.status, ["scheduled", "due"]),
        lte(recurringBillOccurrences.dueDate, horizon),
        isNull(recurringBillOccurrences.deletedAt),
        isNull(recurringBills.deletedAt),
      ),
    )
    .orderBy(recurringBillOccurrences.dueDate);
}

export async function getAccountBalances(userId: string) {
  const deltas = await db
    .select({
      accountId: transactions.accountId,
      income: sql<string>`coalesce(sum(case when ${transactions.type} = 'income' then ${transactions.amount} else 0 end), 0)`,
      expense: sql<string>`coalesce(sum(case when ${transactions.type} = 'expense' then ${transactions.amount} else 0 end), 0)`,
    })
    .from(transactions)
    .where(and(eq(transactions.userId, userId), isNull(transactions.deletedAt)))
    .groupBy(transactions.accountId);

  const deltaMap = new Map(
    deltas
      .filter((d) => d.accountId)
      .map((d) => [d.accountId!, toNumber(d.income) - toNumber(d.expense)]),
  );

  const accountRows = await db
    .select({ id: accounts.id, name: accounts.name, initialBalance: accounts.initialBalance })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt)));

  return accountRows.map((row) => ({
    id: row.id,
    name: row.name,
    balance: toNumber(row.initialBalance) + (deltaMap.get(row.id) ?? 0),
  }));
}
