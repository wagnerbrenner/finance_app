import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", override: true });

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

try {
  const users = await sql`
    select id, email, created_at from auth.users order by created_at desc limit 5
  `;
  console.log("users:", users);

  // Check goal_id column
  const cols = await sql`
    select column_name from information_schema.columns
    where table_schema='public' and table_name='transactions' and column_name='goal_id'
  `;
  console.log("goal_id column:", cols.length > 0);

  // Check if email_reminder_log exists
  const tables = await sql`
    select table_name from information_schema.tables
    where table_schema='public' and table_name in ('email_reminder_log','finance_settings','recurring_bills')
  `;
  console.log("tables:", tables.map((t) => t.table_name));
} finally {
  await sql.end({ timeout: 5 });
}
