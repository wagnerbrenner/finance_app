import { config } from "dotenv";
import { readFileSync } from "fs";
import postgres from "postgres";

config({ path: ".env.local" });
config(); // fallback .env

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });

async function columnExists() {
  const rows = await sql`
    select 1 as ok
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'transactions'
      and column_name = 'goal_id'
  `;
  return rows.length > 0;
}

async function tableExists(name) {
  const rows = await sql`
    select 1 as ok
    from information_schema.tables
    where table_schema = 'public' and table_name = ${name}
  `;
  return rows.length > 0;
}

try {
  const hasEmailLog = await tableExists("email_reminder_log");
  const hasGoalId = await columnExists();
  console.log("email_reminder_log exists:", hasEmailLog);
  console.log("transactions.goal_id exists:", hasGoalId);

  if (!hasEmailLog) {
    const mig5 = readFileSync("supabase/migrations/0005_email_reminder_log.sql", "utf8");
    await sql.unsafe(mig5);
    console.log("Applied 0005_email_reminder_log.sql");
  } else {
    console.log("Skipped 0005 (already applied)");
  }

  if (!hasGoalId) {
    const mig6 = readFileSync("supabase/migrations/0006_goal_id_on_transactions.sql", "utf8");
    await sql.unsafe(mig6);
    console.log("Applied 0006_goal_id_on_transactions.sql");
  } else {
    console.log("Skipped 0006 (already applied)");
  }

  console.log("email_reminder_log exists after:", await tableExists("email_reminder_log"));
  console.log("transactions.goal_id exists after:", await columnExists());
} catch (err) {
  console.error("Migration failed:", err?.message ?? err);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
