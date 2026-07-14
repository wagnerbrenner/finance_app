"use server";

import { and, eq, isNull, sql } from "drizzle-orm";
import { requireUserId } from "@/server/auth";
import { db } from "@/server/db";
import { accounts, categories, creditCards } from "@/server/db/schema";
import { getDueNotifications } from "@/server/services/notifications.service";
import { getIncomePreferences } from "@/server/services/income-preferences.service";

export type LaunchLookups = {
  accounts: { id: string; name: string }[];
  categories: { id: string; name: string }[];
  cards: { id: string; name: string }[];
  hasFreelance: boolean;
  hasUber: boolean;
};

export async function getLaunchLookups(): Promise<LaunchLookups> {
  const userId = await requireUserId();
  await db.execute(sql`select public.seed_default_categories(${userId})`);

  const [accountRows, categoryRows, cardRows, prefs] = await Promise.all([
    db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt))),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(and(eq(categories.userId, userId), isNull(categories.deletedAt))),
    db
      .select({ id: creditCards.id, name: creditCards.name })
      .from(creditCards)
      .where(and(eq(creditCards.userId, userId), isNull(creditCards.deletedAt))),
    getIncomePreferences(userId),
  ]);

  return {
    accounts: accountRows,
    categories: categoryRows,
    cards: cardRows,
    hasFreelance: prefs.hasFreelance,
    hasUber: prefs.hasUber,
  };
}

export async function fetchDueNotifications() {
  const userId = await requireUserId();
  return getDueNotifications(userId);
}
