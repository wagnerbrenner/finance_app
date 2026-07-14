import { eq, and, isNull } from "drizzle-orm";
import { db } from "@/server/db";
import { profiles, type Profile } from "@/server/db/schema";

export async function findProfileById(id: string): Promise<Profile | null> {
  const [row] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, id), isNull(profiles.deletedAt)))
    .limit(1);

  return row ?? null;
}

export async function softDeleteProfile(id: string): Promise<void> {
  await db
    .update(profiles)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(profiles.id, id));
}
