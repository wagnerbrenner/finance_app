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
    .onConflictDoNothing({
      target: [recurringBillOccurrences.billId, recurringBillOccurrences.dueDate],
    })
    .returning({ id: recurringBillOccurrences.id });

  if (row?.id) return row.id;

  const again = await db
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

  if (!again[0]) throw new Error("Não foi possível criar ocorrência da conta recorrente.");
  return again[0].id;
}

/** Ensure every active bill has a pending occurrence for the current/next cycle (batched). */
export async function ensureUpcomingOccurrences(userId: string) {
  const bills = await db
    .select()
    .from(recurringBills)
    .where(
      and(eq(recurringBills.userId, userId), eq(recurringBills.isActive, true), isNull(recurringBills.deletedAt)),
    );

  if (bills.length === 0) return;

  const today = format(new Date(), "yyyy-MM-dd");
  const targets = bills.map((bill) => ({
    bill,
    dueDate: nextDueDate(bill.dayOfMonth),
    following: nextDueDate(bill.dayOfMonth, addMonths(new Date(), 1)),
  }));

  const billIds = bills.map((b) => b.id);
  const existing = await db
    .select({
      id: recurringBillOccurrences.id,
      billId: recurringBillOccurrences.billId,
      dueDate: recurringBillOccurrences.dueDate,
      status: recurringBillOccurrences.status,
    })
    .from(recurringBillOccurrences)
    .where(
      and(
        eq(recurringBillOccurrences.userId, userId),
        inArray(recurringBillOccurrences.billId, billIds),
        isNull(recurringBillOccurrences.deletedAt),
      ),
    );

  const byBillDue = new Set(existing.map((e) => `${e.billId}:${e.dueDate}`));
  const openByBill = new Set(
    existing.filter((e) => e.status === "scheduled" || e.status === "due").map((e) => e.billId),
  );

  const toInsert: {
    userId: string;
    billId: string;
    dueDate: string;
    expectedAmount: string;
    status: string;
  }[] = [];

  for (const item of targets) {
    const key = `${item.bill.id}:${item.dueDate}`;
    if (!byBillDue.has(key)) {
      toInsert.push({
        userId,
        billId: item.bill.id,
        dueDate: item.dueDate,
        expectedAmount: item.bill.estimatedAmount,
        status: item.dueDate <= today ? "due" : "scheduled",
      });
      byBillDue.add(key);
      openByBill.add(item.bill.id);
    }

    if (!openByBill.has(item.bill.id)) {
      const followKey = `${item.bill.id}:${item.following}`;
      if (!byBillDue.has(followKey)) {
        toInsert.push({
          userId,
          billId: item.bill.id,
          dueDate: item.following,
          expectedAmount: item.bill.estimatedAmount,
          status: item.following <= today ? "due" : "scheduled",
        });
        byBillDue.add(followKey);
        openByBill.add(item.bill.id);
      }
    }
  }

  if (toInsert.length > 0) {
    try {
      await db
        .insert(recurringBillOccurrences)
        .values(toInsert)
        .onConflictDoNothing({
          target: [recurringBillOccurrences.billId, recurringBillOccurrences.dueDate],
        });
    } catch (err) {
      console.error("ensureUpcomingOccurrences insert failed", err);
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
