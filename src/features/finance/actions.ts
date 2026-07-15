"use server";

import { revalidatePath } from "next/cache";
import { and, eq, isNull } from "drizzle-orm";
import { z, ZodError } from "zod";
import { db } from "@/server/db";
import {
  accounts,
  categories,
  consortia,
  creditCards,
  debts,
  goals,
  installments,
  investments,
  recurringBillOccurrences,
  recurringBills,
  recurrences,
  transactions,
  uberPeriods,
} from "@/server/db/schema";
import { requireUserId, toNumber } from "@/server/auth";
import type { ActionResult } from "@/features/finance/types";
import {
  ensureOccurrenceForBill,
  ensureUpcomingOccurrences,
  nextDueDate,
} from "@/server/services/recurring-bills.service";
import { addMonths, format, startOfMonth } from "date-fns";
import { localDateISO, parseDateInput } from "@/shared/lib/formatters";

export type { ActionResult } from "@/features/finance/types";

const money = z.coerce.number().nonnegative();
const text = (data: FormData, name: string) => String(data.get(name) ?? "").trim();
const optional = (data: FormData, name: string) => text(data, name) || null;
const pathOf = (data: FormData) => text(data, "path") || "/dashboard";
const dateOf = (data: FormData, name: string, fallback?: string) =>
  parseDateInput(text(data, name), fallback ?? localDateISO());

function errorMessage(error: unknown) {
  if (error instanceof ZodError) return error.issues[0]?.message ?? "Revise os dados informados.";
  if (error instanceof Error && error.message === "Não autenticado") return error.message;
  return "Não foi possível concluir a operação.";
}

async function result(
  data: FormData,
  action: (userId: string) => Promise<void>,
  extraPaths: string[] = [],
): Promise<ActionResult> {
  try {
    await action(await requireUserId());
    revalidatePath(pathOf(data));
    for (const p of extraPaths) revalidatePath(p);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: errorMessage(error) };
  }
}

export async function createAccount(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const parsed = z
      .object({ name: z.string().min(1, "Informe o nome."), amount: money })
      .parse({ name: text(data, "name"), amount: data.get("amount") });
    await db.insert(accounts).values({
      userId,
      name: parsed.name,
      type: text(data, "type") || "checking",
      institution: optional(data, "institution"),
      initialBalance: String(parsed.amount),
    });
  });
}

export async function updateAccount(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const parsed = z
      .object({ id: z.string().uuid(), name: z.string().min(1), amount: money })
      .parse({ id: text(data, "id"), name: text(data, "name"), amount: data.get("amount") });
    await db
      .update(accounts)
      .set({
        name: parsed.name,
        type: text(data, "type") || "checking",
        institution: optional(data, "institution"),
        initialBalance: String(parsed.amount),
      })
      .where(and(eq(accounts.id, parsed.id), eq(accounts.userId, userId), isNull(accounts.deletedAt)));
  });
}

export async function deleteAccount(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(accounts)
      .set({ deletedAt: new Date() })
      .where(and(eq(accounts.id, text(data, "id")), eq(accounts.userId, userId), isNull(accounts.deletedAt)));
  });
}

export async function createTransaction(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const parsed = z
      .object({
        description: z.string().min(1, "Informe a descrição."),
        amount: money.positive("Informe um valor maior que zero."),
        date: z.string().min(1),
        type: z.enum(["income", "expense"]),
        status: z.enum(["cleared", "pending"]),
      })
      .parse({
        description: text(data, "description"),
        amount: data.get("amount"),
        date: dateOf(data, "date"),
        type: text(data, "type"),
        status: text(data, "status") || "cleared",
      });
    await db.insert(transactions).values({
      userId,
      ...parsed,
      amount: String(parsed.amount),
      date: parsed.date,
      accountId: optional(data, "accountId"),
      categoryId: optional(data, "categoryId"),
      creditCardId: optional(data, "creditCardId"),
      notes: optional(data, "notes"),
    });
  });
}

export async function updateTransaction(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const parsed = z
      .object({
        id: z.string().uuid(),
        description: z.string().min(1, "Informe a descrição."),
        amount: money.positive("Informe um valor maior que zero."),
        date: z.string().min(1),
        type: z.enum(["income", "expense"]),
        status: z.enum(["cleared", "pending"]),
      })
      .parse({
        id: text(data, "id"),
        description: text(data, "description"),
        amount: data.get("amount"),
        date: dateOf(data, "date"),
        type: text(data, "type"),
        status: text(data, "status") || "cleared",
      });
    await db
      .update(transactions)
      .set({
        description: parsed.description,
        amount: String(parsed.amount),
        date: parsed.date,
        type: parsed.type,
        status: parsed.status,
        accountId: optional(data, "accountId"),
        categoryId: optional(data, "categoryId"),
        creditCardId: optional(data, "creditCardId"),
        notes: optional(data, "notes"),
        updatedAt: new Date(),
      })
      .where(
        and(eq(transactions.id, parsed.id), eq(transactions.userId, userId), isNull(transactions.deletedAt)),
      );
  });
}

export async function deleteTransaction(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(transactions)
      .set({ deletedAt: new Date() })
      .where(
        and(eq(transactions.id, text(data, "id")), eq(transactions.userId, userId), isNull(transactions.deletedAt)),
      );
  });
}

export async function createCard(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const amount = money.parse(data.get("limitAmount"));
    await db.insert(creditCards).values({
      userId,
      name: z.string().min(1).parse(text(data, "name")),
      limitAmount: String(amount),
      closingDay: z.coerce.number().min(1).max(31).parse(data.get("closingDay")),
      dueDay: z.coerce.number().min(1).max(31).parse(data.get("dueDay")),
      accountId: optional(data, "accountId"),
    });
  });
}

export async function updateCard(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const id = z.string().uuid().parse(text(data, "id"));
    const amount = money.parse(data.get("limitAmount"));
    await db
      .update(creditCards)
      .set({
        name: z.string().min(1).parse(text(data, "name")),
        limitAmount: String(amount),
        closingDay: z.coerce.number().min(1).max(31).parse(data.get("closingDay")),
        dueDay: z.coerce.number().min(1).max(31).parse(data.get("dueDay")),
        accountId: optional(data, "accountId"),
        updatedAt: new Date(),
      })
      .where(and(eq(creditCards.id, id), eq(creditCards.userId, userId), isNull(creditCards.deletedAt)));
  });
}

export async function deleteCard(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(creditCards)
      .set({ deletedAt: new Date() })
      .where(and(eq(creditCards.id, text(data, "id")), eq(creditCards.userId, userId)));
  });
}

export async function createInstallment(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const total = money.positive().parse(data.get("totalAmount"));
    const count = z.coerce.number().int().min(1).parse(data.get("totalInstallments"));
    await db.insert(installments).values({
      userId,
      creditCardId: optional(data, "creditCardId"),
      description: z.string().min(1).parse(text(data, "description")),
      totalAmount: String(total),
      installmentAmount: String(total / count),
      totalInstallments: count,
      startDate: dateOf(data, "startDate"),
    });
  });
}

export async function updateInstallment(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const id = z.string().uuid().parse(text(data, "id"));
    const total = money.positive().parse(data.get("totalAmount"));
    const count = z.coerce.number().int().min(1).parse(data.get("totalInstallments"));
    await db
      .update(installments)
      .set({
        creditCardId: optional(data, "creditCardId"),
        description: z.string().min(1).parse(text(data, "description")),
        totalAmount: String(total),
        installmentAmount: String(total / count),
        totalInstallments: count,
        startDate: dateOf(data, "startDate"),
        updatedAt: new Date(),
      })
      .where(and(eq(installments.id, id), eq(installments.userId, userId), isNull(installments.deletedAt)));
  });
}

export async function deleteInstallment(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(installments)
      .set({ deletedAt: new Date() })
      .where(and(eq(installments.id, text(data, "id")), eq(installments.userId, userId)));
  });
}

export async function createRecurrence(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const amount = money.positive().parse(data.get("amount"));
    await db.insert(recurrences).values({
      userId,
      type: z.enum(["income", "expense"]).parse(text(data, "type")),
      amount: String(amount),
      description: z.string().min(1).parse(text(data, "description")),
      frequency: text(data, "frequency") || "monthly",
      dayOfMonth: z.coerce.number().min(1).max(31).parse(data.get("dayOfMonth")),
      startDate: dateOf(data, "startDate"),
      accountId: optional(data, "accountId"),
    });
  });
}

export async function updateRecurrence(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const id = z.string().uuid().parse(text(data, "id"));
    const amount = money.positive().parse(data.get("amount"));
    await db
      .update(recurrences)
      .set({
        type: z.enum(["income", "expense"]).parse(text(data, "type")),
        amount: String(amount),
        description: z.string().min(1).parse(text(data, "description")),
        frequency: text(data, "frequency") || "monthly",
        dayOfMonth: z.coerce.number().min(1).max(31).parse(data.get("dayOfMonth")),
        startDate: dateOf(data, "startDate"),
        accountId: optional(data, "accountId"),
        updatedAt: new Date(),
      })
      .where(and(eq(recurrences.id, id), eq(recurrences.userId, userId), isNull(recurrences.deletedAt)));
  });
}

export async function deleteRecurrence(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(recurrences)
      .set({ deletedAt: new Date() })
      .where(and(eq(recurrences.id, text(data, "id")), eq(recurrences.userId, userId)));
  });
}

export async function createDebt(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const balance = money.positive().parse(data.get("balance"));
    await db.insert(debts).values({
      userId,
      name: z.string().min(1).parse(text(data, "name")),
      balance: String(balance),
      originalAmount: String(money.parse(data.get("originalAmount") || balance)),
      interestRate: String(money.parse(data.get("interestRate") || 0)),
      installmentAmount: optional(data, "installmentAmount"),
      creditor: optional(data, "creditor"),
      dueDate: optional(data, "dueDate") ? dateOf(data, "dueDate") : null,
      type: text(data, "type") || "other",
      priority: text(data, "priority") || "medium",
    });
  });
}

export async function updateDebt(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const id = z.string().uuid().parse(text(data, "id"));
    const balance = money.positive().parse(data.get("balance"));
    await db
      .update(debts)
      .set({
        name: z.string().min(1).parse(text(data, "name")),
        balance: String(balance),
        originalAmount: String(money.parse(data.get("originalAmount") || balance)),
        interestRate: String(money.parse(data.get("interestRate") || 0)),
        installmentAmount: optional(data, "installmentAmount"),
        creditor: optional(data, "creditor"),
        dueDate: optional(data, "dueDate") ? dateOf(data, "dueDate") : null,
        type: text(data, "type") || "other",
        priority: text(data, "priority") || "medium",
        updatedAt: new Date(),
      })
      .where(and(eq(debts.id, id), eq(debts.userId, userId), isNull(debts.deletedAt)));
  });
}

export async function payDebtDue(data: FormData): Promise<ActionResult> {
  return result(
    data,
    async (userId) => {
      const id = z.string().uuid().parse(text(data, "id"));
      const amount = money.positive("Informe o valor pago.").parse(data.get("amount"));
      const paidDate = dateOf(data, "date");
      const accountId = optional(data, "accountId");

      const [debt] = await db
        .select()
        .from(debts)
        .where(and(eq(debts.id, id), eq(debts.userId, userId), isNull(debts.deletedAt)))
        .limit(1);
      if (!debt) throw new Error("Dívida não encontrada.");

      const balance = Math.max(0, toNumber(debt.balance) - amount);
      const dueBase = debt.dueDate
        ? new Date(`${debt.dueDate}T12:00:00`)
        : new Date(`${paidDate}T12:00:00`);
      const nextDue = format(addMonths(dueBase, 1), "yyyy-MM-dd");
      const currentInstallment = (debt.currentInstallment ?? 0) + 1;

      await db.insert(transactions).values({
        userId,
        type: "expense",
        amount: String(amount),
        date: paidDate,
        status: "cleared",
        description: `Pagamento · ${debt.name}`,
        accountId,
        notes: optional(data, "notes"),
      });

      await db
        .update(debts)
        .set({
          balance: String(balance),
          dueDate: nextDue,
          currentInstallment,
          updatedAt: new Date(),
        })
        .where(and(eq(debts.id, id), eq(debts.userId, userId)));
    },
    ["/app/dividas", "/app/transacoes", "/dashboard"],
  );
}

export async function deleteDebt(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(debts)
      .set({ deletedAt: new Date() })
      .where(and(eq(debts.id, text(data, "id")), eq(debts.userId, userId)));
  });
}

export async function createGoal(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db.insert(goals).values({
      userId,
      name: z.string().min(1).parse(text(data, "name")),
      targetAmount: String(money.positive().parse(data.get("targetAmount"))),
      currentAmount: String(money.parse(data.get("currentAmount") || 0)),
      monthlyContribution: String(money.parse(data.get("monthlyContribution") || 0)),
      deadline: optional(data, "deadline") ? dateOf(data, "deadline") : null,
      type: text(data, "type") || "other",
    });
  });
}

export async function updateGoal(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const id = z.string().uuid().parse(text(data, "id"));
    await db
      .update(goals)
      .set({
        name: z.string().min(1).parse(text(data, "name")),
        targetAmount: String(money.positive().parse(data.get("targetAmount"))),
        currentAmount: String(money.parse(data.get("currentAmount") || 0)),
        monthlyContribution: String(money.parse(data.get("monthlyContribution") || 0)),
        deadline: optional(data, "deadline") ? dateOf(data, "deadline") : null,
        type: text(data, "type") || "other",
        updatedAt: new Date(),
      })
      .where(and(eq(goals.id, id), eq(goals.userId, userId), isNull(goals.deletedAt)));
  });
}

export async function contributeToGoal(data: FormData): Promise<ActionResult> {
  return result(
    data,
    async (userId) => {
      const goalId = z.string().uuid("Selecione a meta.").parse(text(data, "goalId") || text(data, "id"));
      const amount = money.positive("Informe o valor do aporte.").parse(data.get("amount"));
      const paidDate = dateOf(data, "date");
      const accountId = optional(data, "accountId");

      const [goal] = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId), isNull(goals.deletedAt)))
        .limit(1);
      if (!goal) throw new Error("Meta não encontrada.");

      const categoryId = (await findCategoryId(userId, "Outros")) ?? (await findCategoryId(userId, "Investimentos"));
      const description = text(data, "description") || `Aporte · ${goal.name}`;

      await db.insert(transactions).values({
        userId,
        type: "expense",
        amount: String(amount),
        date: paidDate,
        status: "cleared",
        description,
        accountId,
        categoryId,
        goalId,
        notes: optional(data, "notes"),
      });

      await db
        .update(goals)
        .set({
          currentAmount: String(toNumber(goal.currentAmount) + amount),
          updatedAt: new Date(),
        })
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
    },
    ["/app/metas", "/app/transacoes", "/dashboard"],
  );
}

export async function deleteGoal(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(goals)
      .set({ deletedAt: new Date() })
      .where(and(eq(goals.id, text(data, "id")), eq(goals.userId, userId)));
  });
}

export async function createInvestment(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db.insert(investments).values({
      userId,
      name: z.string().min(1).parse(text(data, "name")),
      type: text(data, "type") || "other",
      ticker: optional(data, "ticker"),
      quantity: String(money.parse(data.get("quantity") || 0)),
      averagePrice: String(money.parse(data.get("averagePrice") || 0)),
      currentPrice: String(money.parse(data.get("currentPrice") || 0)),
      expectedYield: String(money.parse(data.get("expectedYield") || 0)),
    });
  });
}

export async function updateInvestment(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const id = z.string().uuid().parse(text(data, "id"));
    await db
      .update(investments)
      .set({
        name: z.string().min(1).parse(text(data, "name")),
        type: text(data, "type") || "other",
        ticker: optional(data, "ticker"),
        quantity: String(money.parse(data.get("quantity") || 0)),
        averagePrice: String(money.parse(data.get("averagePrice") || 0)),
        currentPrice: String(money.parse(data.get("currentPrice") || 0)),
        expectedYield: String(money.parse(data.get("expectedYield") || 0)),
        updatedAt: new Date(),
      })
      .where(and(eq(investments.id, id), eq(investments.userId, userId), isNull(investments.deletedAt)));
  });
}

export async function deleteInvestment(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(investments)
      .set({ deletedAt: new Date() })
      .where(and(eq(investments.id, text(data, "id")), eq(investments.userId, userId)));
  });
}

export async function createUberPeriod(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const fields = [
      "grossRevenue",
      "hoursWorked",
      "kmDriven",
      "fuelCost",
      "tolls",
      "wash",
      "maintenance",
      "otherCosts",
    ] as const;
    const values = Object.fromEntries(
      fields.map((key) => [key, String(money.parse(data.get(key) || 0))]),
    );
    await db.insert(uberPeriods).values({
      userId,
      source: text(data, "source") || "uber",
      periodMonth: dateOf(data, "periodMonth"),
      daysWorked: z.coerce.number().int().nonnegative().parse(data.get("daysWorked") || 0),
      ...values,
    });
  });
}

export async function updateUberPeriod(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const id = z.string().uuid().parse(text(data, "id"));
    const fields = [
      "grossRevenue",
      "hoursWorked",
      "kmDriven",
      "fuelCost",
      "tolls",
      "wash",
      "maintenance",
      "otherCosts",
    ] as const;
    const values = Object.fromEntries(
      fields.map((key) => [key, String(money.parse(data.get(key) || 0))]),
    );
    await db
      .update(uberPeriods)
      .set({
        source: text(data, "source") || "uber",
        periodMonth: dateOf(data, "periodMonth"),
        daysWorked: z.coerce.number().int().nonnegative().parse(data.get("daysWorked") || 0),
        ...values,
        notes: optional(data, "notes"),
        updatedAt: new Date(),
      })
      .where(and(eq(uberPeriods.id, id), eq(uberPeriods.userId, userId), isNull(uberPeriods.deletedAt)));
  });
}

export async function deleteUberPeriod(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(uberPeriods)
      .set({ deletedAt: new Date() })
      .where(and(eq(uberPeriods.id, text(data, "id")), eq(uberPeriods.userId, userId)));
  });
}

const consortiumInput = (data: FormData) => {
  const parsed = z
    .object({
      name: z.string().min(1, "Informe o nome do consórcio."),
      creditAmount: money,
      installmentAmount: money,
      totalInstallments: z.coerce.number().int().nonnegative(),
      paidInstallments: z.coerce.number().int().nonnegative(),
    })
    .parse({
      name: text(data, "name"),
      creditAmount: data.get("creditAmount") || 0,
      installmentAmount: data.get("installmentAmount") || 0,
      totalInstallments: data.get("totalInstallments") || 0,
      paidInstallments: data.get("paidInstallments") || 0,
    });
  return {
    ...parsed,
    creditAmount: String(parsed.creditAmount),
    installmentAmount: String(parsed.installmentAmount),
    administrator: optional(data, "administrator"),
    groupNumber: optional(data, "groupNumber"),
    letterNumber: optional(data, "letterNumber"),
    nextDueDate: optional(data, "nextDueDate") ? dateOf(data, "nextDueDate") : null,
    contemplated: text(data, "contemplated") === "true",
    contemplatedAt: optional(data, "contemplatedAt"),
    status: text(data, "status") || "active",
    notes: optional(data, "notes"),
  };
};

export async function createConsortium(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db.insert(consortia).values({ userId, ...consortiumInput(data) });
  });
}

export async function updateConsortium(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const id = z.string().uuid().parse(text(data, "id"));
    await db
      .update(consortia)
      .set(consortiumInput(data))
      .where(and(eq(consortia.id, id), eq(consortia.userId, userId), isNull(consortia.deletedAt)));
  });
}

export async function deleteConsortium(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(consortia)
      .set({ deletedAt: new Date() })
      .where(and(eq(consortia.id, text(data, "id")), eq(consortia.userId, userId), isNull(consortia.deletedAt)));
  });
}

async function findCategoryId(userId: string, name: string) {
  const aliases =
    name === "Freela" || name === "Freelance" ? ["Freela", "Freelance"] : [name];
  for (const alias of aliases) {
    const [row] = await db
      .select({ id: categories.id })
      .from(categories)
      .where(and(eq(categories.userId, userId), eq(categories.name, alias), isNull(categories.deletedAt)))
      .limit(1);
    if (row?.id) return row.id;
  }
  return null;
}

/** Hub "Novo lançamento": receita (salário/freelance/uber), despesa (+ recorrente) ou aporte em meta. */
export async function createLaunch(data: FormData): Promise<ActionResult> {
  return result(
    data,
    async (userId) => {
    const type = z.enum(["income", "expense", "goal"]).parse(text(data, "type"));

    if (type === "goal") {
      // Reusa a mesma lógica de aporte (FormData já traz goalId/amount/date/accountId)
      const goalId = z.string().uuid("Selecione a meta.").parse(text(data, "goalId"));
      const amount = money.positive("Informe um valor maior que zero.").parse(data.get("amount"));
      const paidDate = dateOf(data, "date");
      const accountId = optional(data, "accountId");

      const [goal] = await db
        .select()
        .from(goals)
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId), isNull(goals.deletedAt)))
        .limit(1);
      if (!goal) throw new Error("Meta não encontrada.");

      const categoryId = (await findCategoryId(userId, "Outros")) ?? (await findCategoryId(userId, "Investimentos"));
      const description = text(data, "description") || `Aporte · ${goal.name}`;

      await db.insert(transactions).values({
        userId,
        type: "expense",
        amount: String(amount),
        date: paidDate,
        status: "cleared",
        description,
        accountId,
        categoryId,
        goalId,
        notes: optional(data, "notes"),
      });

      await db
        .update(goals)
        .set({
          currentAmount: String(toNumber(goal.currentAmount) + amount),
          updatedAt: new Date(),
        })
        .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));
      return;
    }

    const amount = money.positive("Informe um valor maior que zero.").parse(data.get("amount"));
    const date = dateOf(data, "date");
    const accountId = optional(data, "accountId");
    const notes = optional(data, "notes");

    if (type === "income") {
      const origin = z.enum(["salary", "freelance", "uber"]).parse(text(data, "incomeOrigin") || "salary");
      const status = z.enum(["cleared", "pending"]).parse(text(data, "status") || "cleared");

      if (origin === "salary") {
        const categoryId = optional(data, "categoryId") ?? (await findCategoryId(userId, "Salário"));
        const description = text(data, "description") || "Salário";
        const dayOfMonth = Math.min(Math.max(new Date(`${date}T12:00:00`).getDate(), 1), 28);

        await db.insert(transactions).values({
          userId,
          type: "income",
          amount: String(amount),
          date,
          status,
          description,
          accountId,
          categoryId,
          notes,
        });

        // Mantém recorrência mensal de salário para o gráfico/painel dos próximos meses
        const [existing] = await db
          .select({ id: recurrences.id })
          .from(recurrences)
          .where(
            and(
              eq(recurrences.userId, userId),
              eq(recurrences.type, "income"),
              eq(recurrences.isActive, true),
              isNull(recurrences.deletedAt),
              eq(recurrences.description, "Salário"),
            ),
          )
          .limit(1);

        if (existing) {
          await db
            .update(recurrences)
            .set({
              amount: String(amount),
              dayOfMonth,
              accountId,
              categoryId,
              frequency: "monthly",
              updatedAt: new Date(),
            })
            .where(and(eq(recurrences.id, existing.id), eq(recurrences.userId, userId)));
        } else {
          await db.insert(recurrences).values({
            userId,
            type: "income",
            amount: String(amount),
            description: "Salário",
            frequency: "monthly",
            dayOfMonth,
            startDate: date,
            accountId,
            categoryId,
          });
        }
        return;
      }

      const source = origin === "freelance" ? "freelance" : "uber";
      const periodMonth = dateOf(
        data,
        "periodMonth",
        format(startOfMonth(new Date(`${date}T12:00:00`)), "yyyy-MM-dd"),
      );
      const hoursWorked = money.parse(data.get("hoursWorked") || 0);
      const taxesOrFuel = money.parse(data.get(origin === "freelance" ? "taxes" : "fuelCost") || 0);
      const kmDriven = money.parse(data.get("kmDriven") || 0);
      const categoryName = origin === "freelance" ? "Freela" : "Uber / Apps";
      const categoryId = optional(data, "categoryId") ?? (await findCategoryId(userId, categoryName));
      const description =
        text(data, "description") || (origin === "freelance" ? "Receita freela" : "Receita Uber");

      await db.insert(uberPeriods).values({
        userId,
        source,
        periodMonth,
        grossRevenue: String(amount),
        hoursWorked: String(hoursWorked),
        daysWorked: z.coerce.number().int().nonnegative().parse(data.get("daysWorked") || 0),
        kmDriven: String(kmDriven),
        fuelCost: origin === "uber" ? String(taxesOrFuel) : "0",
        maintenance: origin === "freelance" ? String(taxesOrFuel) : "0",
        notes,
      });

      await db.insert(transactions).values({
        userId,
        type: "income",
        amount: String(amount),
        date,
        status,
        description,
        accountId,
        categoryId,
        notes,
      });
      return;
    }

    // expense
    const isRecurring = text(data, "isRecurring") === "true" || text(data, "isRecurring") === "on";
    const description = z.string().min(1, "Informe a descrição.").parse(text(data, "description"));
    const categoryId = optional(data, "categoryId");
    const creditCardId = optional(data, "creditCardId");
    const status = z.enum(["cleared", "pending"]).parse(text(data, "status") || "cleared");

    if (isRecurring) {
      const dayOfMonth = z.coerce
        .number()
        .int()
        .min(1)
        .max(31)
        .parse(data.get("dayOfMonth") || new Date(date).getDate());
      const [bill] = await db
        .insert(recurringBills)
        .values({
          userId,
          name: description,
          accountId,
          categoryId,
          dayOfMonth,
          estimatedAmount: String(amount),
          notes,
        })
        .returning();
      if (!bill) throw new Error("Não foi possível criar a conta recorrente.");
      await ensureOccurrenceForBill(userId, bill);
      return;
    }

    await db.insert(transactions).values({
      userId,
      type: "expense",
      amount: String(amount),
      date,
      status,
      description,
      accountId,
      categoryId,
      creditCardId,
      notes,
    });
  },
    ["/app/recorrentes", "/app/renda", "/app/metas", "/dashboard"],
  );
}

export async function createRecurringBill(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const amount = money.positive().parse(data.get("estimatedAmount") ?? data.get("amount"));
    const dayOfMonth = z.coerce.number().int().min(1).max(31).parse(data.get("dayOfMonth"));
    const [bill] = await db
      .insert(recurringBills)
      .values({
        userId,
        name: z.string().min(1).parse(text(data, "name")),
        accountId: optional(data, "accountId"),
        categoryId: optional(data, "categoryId"),
        dayOfMonth,
        estimatedAmount: String(amount),
        notes: optional(data, "notes"),
      })
      .returning();
    if (!bill) throw new Error("Não foi possível criar a conta recorrente.");
    await ensureOccurrenceForBill(userId, bill);
  });
}

export async function updateRecurringBill(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const id = z.string().uuid().parse(text(data, "id"));
    const amount = money.positive().parse(data.get("estimatedAmount") ?? data.get("amount"));
    const dayOfMonth = z.coerce.number().int().min(1).max(31).parse(data.get("dayOfMonth"));
    await db
      .update(recurringBills)
      .set({
        name: z.string().min(1).parse(text(data, "name")),
        accountId: optional(data, "accountId"),
        categoryId: optional(data, "categoryId"),
        dayOfMonth,
        estimatedAmount: String(amount),
        notes: optional(data, "notes"),
        updatedAt: new Date(),
      })
      .where(and(eq(recurringBills.id, id), eq(recurringBills.userId, userId), isNull(recurringBills.deletedAt)));
  });
}

export async function deleteRecurringBill(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    await db
      .update(recurringBills)
      .set({ deletedAt: new Date(), isActive: false })
      .where(
        and(eq(recurringBills.id, text(data, "id")), eq(recurringBills.userId, userId), isNull(recurringBills.deletedAt)),
      );
  });
}

export async function confirmRecurringOccurrence(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const occurrenceId = z.string().uuid().parse(text(data, "id"));
    const actualAmount = money.positive().parse(data.get("actualAmount"));
    const paidDate = dateOf(data, "date");

    const [occurrence] = await db
      .select({
        id: recurringBillOccurrences.id,
        billId: recurringBillOccurrences.billId,
        dueDate: recurringBillOccurrences.dueDate,
        status: recurringBillOccurrences.status,
        billName: recurringBills.name,
        accountId: recurringBills.accountId,
        categoryId: recurringBills.categoryId,
      })
      .from(recurringBillOccurrences)
      .innerJoin(recurringBills, eq(recurringBillOccurrences.billId, recurringBills.id))
      .where(
        and(
          eq(recurringBillOccurrences.id, occurrenceId),
          eq(recurringBillOccurrences.userId, userId),
          isNull(recurringBillOccurrences.deletedAt),
        ),
      )
      .limit(1);

    if (!occurrence) throw new Error("Ocorrência não encontrada.");
    if (occurrence.status === "paid") throw new Error("Pagamento já confirmado.");

    const [tx] = await db
      .insert(transactions)
      .values({
        userId,
        type: "expense",
        amount: String(actualAmount),
        date: paidDate,
        status: "cleared",
        description: occurrence.billName,
        accountId: optional(data, "accountId") ?? occurrence.accountId,
        categoryId: optional(data, "categoryId") ?? occurrence.categoryId,
        notes: optional(data, "notes"),
      })
      .returning({ id: transactions.id });

    if (!tx) throw new Error("Não foi possível registrar o pagamento.");

    await db
      .update(recurringBillOccurrences)
      .set({
        status: "paid",
        actualAmount: String(actualAmount),
        transactionId: tx.id,
        confirmedAt: new Date(),
      })
      .where(and(eq(recurringBillOccurrences.id, occurrenceId), eq(recurringBillOccurrences.userId, userId)));

    await db
      .update(recurringBills)
      .set({ estimatedAmount: String(actualAmount) })
      .where(and(eq(recurringBills.id, occurrence.billId), eq(recurringBills.userId, userId)));

    const [bill] = await db
      .select()
      .from(recurringBills)
      .where(and(eq(recurringBills.id, occurrence.billId), eq(recurringBills.userId, userId)))
      .limit(1);
    if (bill) {
      const dayAfterDue = new Date(`${occurrence.dueDate}T12:00:00`);
      dayAfterDue.setDate(dayAfterDue.getDate() + 1);
      await ensureOccurrenceForBill(userId, bill, nextDueDate(bill.dayOfMonth, dayAfterDue));
    }
  });
}

export async function skipRecurringOccurrence(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const occurrenceId = z.string().uuid().parse(text(data, "id"));
    await db
      .update(recurringBillOccurrences)
      .set({ status: "skipped", confirmedAt: new Date() })
      .where(
        and(
          eq(recurringBillOccurrences.id, occurrenceId),
          eq(recurringBillOccurrences.userId, userId),
          isNull(recurringBillOccurrences.deletedAt),
        ),
      );
    await ensureUpcomingOccurrences(userId);
  });
}

export async function importTransactionsCsv(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const accountId = z.string().uuid("Selecione a conta destino.").parse(text(data, "accountId"));
    const rowsJson = text(data, "rows");
    const rows = z
      .array(
        z.object({
          date: z.string().min(1),
          description: z.string().min(1),
          amount: z.number().positive(),
          type: z.enum(["income", "expense"]),
        }),
      )
      .min(1, "Nenhuma linha para importar.")
      .parse(JSON.parse(rowsJson));

    await db.insert(transactions).values(
      rows.map((row) => ({
        userId,
        accountId,
        type: row.type,
        amount: String(row.amount),
        date: row.date,
        description: row.description,
        status: "cleared" as const,
        notes: "Importado via CSV",
      })),
    );
  });
}

export async function saveIncomeOnboarding(data: FormData): Promise<ActionResult> {
  return result(data, async (userId) => {
    const hasFreelance =
      text(data, "hasFreelance") === "true" || text(data, "hasFreelance") === "on";
    const hasUber = text(data, "hasUber") === "true" || text(data, "hasUber") === "on";
    const { saveIncomePreferences } = await import(
      "@/server/services/income-preferences.service"
    );
    await saveIncomePreferences(userId, { hasFreelance, hasUber });
  });
}
