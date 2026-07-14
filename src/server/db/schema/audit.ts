import { timestamp } from "drizzle-orm/pg-core";

/**
 * Shared audit columns for all future domain tables.
 * Soft delete via deleted_at; never hard-delete from the app layer.
 */
export const auditColumns = {
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "date" }),
};
