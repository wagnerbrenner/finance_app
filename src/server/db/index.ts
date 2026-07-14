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

  const client =
    globalForDb.pg ??
    postgres(connectionString, {
      prepare: false,
      max: 10,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.pg = client;
  }

  return drizzle(client, { schema });
}

export const db: Db = new Proxy({} as Db, {
  get(_target, prop, receiver) {
    const instance = globalForDb.db ?? createDb();
    if (process.env.NODE_ENV !== "production") {
      globalForDb.db = instance;
    }
    return Reflect.get(instance, prop, receiver);
  },
});

export type Database = Db;
