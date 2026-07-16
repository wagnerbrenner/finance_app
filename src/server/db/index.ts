import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

type Db = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as {
  db: Db | undefined;
  pg: ReturnType<typeof postgres> | undefined;
};

function createDb(): Db {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add it to .env.local (Supabase Postgres connection string).",
    );
  }

  // Reuse across hot reloads / serverless invocations in the same isolate.
  // Creating a new pool per query exhausts Supabase (EMAXCONN).
  const client =
    globalForDb.pg ??
    postgres(connectionString, {
      prepare: false,
      // Serverless: keep the pool tiny; prefer Supabase pooler URL (6543).
      max: process.env.NODE_ENV === "production" ? 1 : 5,
      idle_timeout: 20,
      max_lifetime: 60 * 5,
    });

  globalForDb.pg = client;

  return drizzle(client, { schema });
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    if (!globalForDb.db) {
      globalForDb.db = createDb();
    }
    return Reflect.get(globalForDb.db, prop, receiver);
  },
});

export type Database = Db;
