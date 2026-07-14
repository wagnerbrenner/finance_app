import { eq } from "drizzle-orm";
import { db } from "@/server/db";
import { financeSettings } from "@/server/db/schema";

export type IncomePreferences = {
  hasFreelance: boolean;
  hasUber: boolean;
  incomeOnboardingDone: boolean;
};

const defaults: IncomePreferences = {
  hasFreelance: false,
  hasUber: false,
  incomeOnboardingDone: false,
};

export async function ensureFinanceSettings(userId: string) {
  const [existing] = await db
    .select()
    .from(financeSettings)
    .where(eq(financeSettings.userId, userId))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(financeSettings)
    .values({ userId })
    .onConflictDoNothing()
    .returning();
  if (created) return created;
  const [again] = await db
    .select()
    .from(financeSettings)
    .where(eq(financeSettings.userId, userId))
    .limit(1);
  return again!;
}

export async function getIncomePreferences(userId: string): Promise<IncomePreferences> {
  const row = await ensureFinanceSettings(userId);
  return {
    hasFreelance: row.hasFreelance,
    hasUber: row.hasUber,
    incomeOnboardingDone: row.incomeOnboardingDone,
  };
}

export async function saveIncomePreferences(
  userId: string,
  prefs: { hasFreelance: boolean; hasUber: boolean },
) {
  await ensureFinanceSettings(userId);
  await db
    .update(financeSettings)
    .set({
      hasFreelance: prefs.hasFreelance,
      hasUber: prefs.hasUber,
      incomeOnboardingDone: true,
      updatedAt: new Date(),
    })
    .where(eq(financeSettings.userId, userId));
}

export { defaults as incomePreferenceDefaults };
