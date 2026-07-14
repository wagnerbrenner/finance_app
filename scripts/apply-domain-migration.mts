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
    "supabase/migrations/0001_domain_schema.sql",
    "utf8",
  );
  await sql.unsafe(migration);
  console.log("MIGRATION_OK");

  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in (
        'accounts', 'transactions', 'debts', 'goals',
        'investments', 'uber_periods', 'credit_cards', 'recurrences'
      )
    order by 1
  `;
  console.log(tables.map((t) => t.table_name).join(", "));
  await sql.end();
}

main().catch(async (e) => {
  console.error("FAIL", e.message);
  await sql.end({ timeout: 1 }).catch(() => undefined);
  process.exit(1);
});
