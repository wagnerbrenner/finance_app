import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", override: true });

const email = (process.argv[2] ?? "wagner.brenner13@gmail.com").trim().toLowerCase();
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1, connect_timeout: 15 });

const TABLES = [
  "email_reminder_log",
  "recurring_bill_occurrences",
  "recurring_bills",
  "investment_contributions",
  "investments",
  "uber_periods",
  "card_invoices",
  "transactions",
  "recurrences",
  "installments",
  "debts",
  "goals",
  "consortia",
  "credit_cards",
  "accounts",
  "categories",
  "finance_settings",
];

try {
  const users = await sql`
    select id, email from auth.users where lower(email) = ${email}
  `;
  if (!users[0]) {
    console.error("User not found:", email);
    process.exit(1);
  }
  const userId = users[0].id;
  console.log("Wiping finance data for", users[0].email, userId);

  for (const table of TABLES) {
    const result = await sql.unsafe(`delete from public.${table} where user_id = $1`, [userId]);
    const count = Array.isArray(result) ? result.count ?? result.length : result.count;
    console.log(`  ${table}: ${count ?? "ok"} removed`);
  }

  console.log("Done. Auth account kept — user can log in with empty data.");
} catch (e) {
  console.error("FAIL", e.message || e);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
