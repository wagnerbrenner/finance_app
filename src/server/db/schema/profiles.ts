import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

/**
 * profiles.id mirrors auth.users.id (1:1).
 * Created by a DB trigger on auth.users insert.
 */
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  locale: text("locale").notNull().default("pt-BR"),
  currency: text("currency").notNull().default("BRL"),
  accountTier: text("account_tier").notNull().default("standard"),
  trialEndsAt: timestamp("trial_ends_at", { withTimezone: true, mode: "date" }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
});

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
