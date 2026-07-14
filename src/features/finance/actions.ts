"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/server/db";
import { accounts, creditCards, debts, goals, installments, investments, recurrences, transactions, uberPeriods } from "@/server/db/schema";
import { requireUserId } from "@/server/auth";

const money = z.coerce.number().nonnegative();
const text = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const optional = (data: FormData, name: string) => text(data, name) || null;
const path = (data: FormData) => text(data, "path") || "/dashboard";
function done(data: FormData) { revalidatePath(path(data)); }

export async function createAccount(data: FormData) {
  const userId = await requireUserId();
  const parsed = z.object({ name: z.string().min(1), amount: money }).parse({ name: text(data, "name"), amount: data.get("amount") });
  await db.insert(accounts).values({ userId, name: parsed.name, type: text(data, "type") || "checking", institution: optional(data, "institution"), initialBalance: String(parsed.amount) });
  done(data);
}
export async function deleteAccount(data: FormData) {
  const userId = await requireUserId();
  await db.update(accounts).set({ deletedAt: new Date() }).where(and(eq(accounts.id, text(data, "id")), eq(accounts.userId, userId), isNull(accounts.deletedAt))); done(data);
}

export async function createTransaction(data: FormData) {
  const userId = await requireUserId();
  const parsed = z.object({ description: z.string().min(1), amount: money.positive(), date: z.string().min(1), type: z.enum(["income", "expense"]) }).parse({ description: text(data, "description"), amount: data.get("amount"), date: text(data, "date"), type: text(data, "type") });
  await db.insert(transactions).values({ userId, ...parsed, amount: String(parsed.amount), accountId: optional(data, "accountId"), categoryId: optional(data, "categoryId"), creditCardId: optional(data, "creditCardId") }); done(data);
}
export async function deleteTransaction(data: FormData) {
  const userId = await requireUserId();
  await db.update(transactions).set({ deletedAt: new Date() }).where(and(eq(transactions.id, text(data, "id")), eq(transactions.userId, userId), isNull(transactions.deletedAt))); done(data);
}

export async function createCard(data: FormData) {
  const userId = await requireUserId(); const amount = money.parse(data.get("limitAmount"));
  await db.insert(creditCards).values({ userId, name: z.string().min(1).parse(text(data, "name")), limitAmount: String(amount), closingDay: z.coerce.number().min(1).max(31).parse(data.get("closingDay")), dueDay: z.coerce.number().min(1).max(31).parse(data.get("dueDay")), accountId: optional(data, "accountId") }); done(data);
}
export async function deleteCard(data: FormData) { const userId = await requireUserId(); await db.update(creditCards).set({ deletedAt: new Date() }).where(and(eq(creditCards.id, text(data, "id")), eq(creditCards.userId, userId))); done(data); }
export async function createInstallment(data: FormData) {
  const userId = await requireUserId(); const total = money.positive().parse(data.get("totalAmount")); const count = z.coerce.number().int().min(1).parse(data.get("totalInstallments"));
  await db.insert(installments).values({ userId, creditCardId: optional(data, "creditCardId"), description: z.string().min(1).parse(text(data, "description")), totalAmount: String(total), installmentAmount: String(total / count), totalInstallments: count, startDate: text(data, "startDate") }); done(data);
}
export async function createRecurrence(data: FormData) {
  const userId = await requireUserId(); const amount = money.positive().parse(data.get("amount"));
  await db.insert(recurrences).values({ userId, type: z.enum(["income", "expense"]).parse(text(data, "type")), amount: String(amount), description: z.string().min(1).parse(text(data, "description")), frequency: text(data, "frequency") || "monthly", dayOfMonth: z.coerce.number().min(1).max(31).parse(data.get("dayOfMonth")), startDate: text(data, "startDate"), accountId: optional(data, "accountId") }); done(data);
}
export async function deleteRecurrence(data: FormData) { const userId = await requireUserId(); await db.update(recurrences).set({ deletedAt: new Date() }).where(and(eq(recurrences.id, text(data, "id")), eq(recurrences.userId, userId))); done(data); }

export async function createDebt(data: FormData) {
  const userId = await requireUserId(); const balance = money.positive().parse(data.get("balance"));
  await db.insert(debts).values({ userId, name: z.string().min(1).parse(text(data, "name")), balance: String(balance), originalAmount: String(money.parse(data.get("originalAmount") || balance)), interestRate: String(money.parse(data.get("interestRate") || 0)), installmentAmount: optional(data, "installmentAmount"), creditor: optional(data, "creditor") }); done(data);
}
export async function deleteDebt(data: FormData) { const userId = await requireUserId(); await db.update(debts).set({ deletedAt: new Date() }).where(and(eq(debts.id, text(data, "id")), eq(debts.userId, userId))); done(data); }
export async function createGoal(data: FormData) {
  const userId = await requireUserId(); await db.insert(goals).values({ userId, name: z.string().min(1).parse(text(data, "name")), targetAmount: String(money.positive().parse(data.get("targetAmount"))), currentAmount: String(money.parse(data.get("currentAmount") || 0)), monthlyContribution: String(money.parse(data.get("monthlyContribution") || 0)), deadline: optional(data, "deadline") }); done(data);
}
export async function deleteGoal(data: FormData) { const userId = await requireUserId(); await db.update(goals).set({ deletedAt: new Date() }).where(and(eq(goals.id, text(data, "id")), eq(goals.userId, userId))); done(data); }
export async function createInvestment(data: FormData) {
  const userId = await requireUserId(); await db.insert(investments).values({ userId, name: z.string().min(1).parse(text(data, "name")), type: text(data, "type") || "other", ticker: optional(data, "ticker"), quantity: String(money.positive().parse(data.get("quantity"))), averagePrice: String(money.parse(data.get("averagePrice") || 0)), currentPrice: String(money.parse(data.get("currentPrice") || 0)), expectedYield: String(money.parse(data.get("expectedYield") || 0)) }); done(data);
}
export async function deleteInvestment(data: FormData) { const userId = await requireUserId(); await db.update(investments).set({ deletedAt: new Date() }).where(and(eq(investments.id, text(data, "id")), eq(investments.userId, userId))); done(data); }
export async function createUberPeriod(data: FormData) {
  const userId = await requireUserId(); const fields = ["grossRevenue", "hoursWorked", "kmDriven", "fuelCost", "tolls", "wash", "maintenance", "otherCosts"] as const;
  const values = Object.fromEntries(fields.map((key) => [key, String(money.parse(data.get(key) || 0))]));
  await db.insert(uberPeriods).values({ userId, periodMonth: text(data, "periodMonth"), daysWorked: z.coerce.number().int().nonnegative().parse(data.get("daysWorked") || 0), ...values }); done(data);
}
export async function deleteUberPeriod(data: FormData) { const userId = await requireUserId(); await db.update(uberPeriods).set({ deletedAt: new Date() }).where(and(eq(uberPeriods.id, text(data, "id")), eq(uberPeriods.userId, userId))); done(data); }
