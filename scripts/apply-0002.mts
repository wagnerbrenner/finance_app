import { config } from "dotenv";
import postgres from "postgres";
import { readFileSync } from "node:fs";

config({ path: ".env.local", override: true });

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  max: 1,
  connect_timeout: 30,
});

async function main() {
  const migration = readFileSync(
    "supabase/migrations/0002_ux_renda_consorcio.sql",
    "utf8",
  );
  await sql.unsafe(migration);
  console.log("MIGRATION_0002_OK");
  await sql.end();
}

main().catch(async (e) => {
  console.error("FAIL", e.message);
  await sql.end({ timeout: 1 }).catch(() => undefined);
  process.exit(1);
});
