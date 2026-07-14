import { findProfileById } from "@/server/repositories/profiles.repository";
import type { Profile } from "@/server/db/schema";

export async function getProfileForUser(userId: string): Promise<Profile | null> {
  return findProfileById(userId);
}
