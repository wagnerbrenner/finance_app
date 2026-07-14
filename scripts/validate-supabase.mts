import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", override: true });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(url, { ssl: "require", connect_timeout: 20, max: 1 });

async function main() {
  const ping = await sql`select current_database() as db, now() as ts`;
  console.log("DB_OK", ping[0]);

  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  `;
  console.log("PROFILES_TABLE", tables[0] ?? "MISSING");

  const count = await sql`select count(*)::int as n from public.profiles`;
  console.log("PROFILES_COUNT", count[0]?.n);

  await sql.end();
}

main().catch(async (err) => {
  console.error("DB_FAIL", err.message);
  try {
    await sql.end({ timeout: 1 });
  } catch {
    // ignore
  }
  process.exit(1);
});
