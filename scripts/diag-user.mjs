import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", override: true });

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1, connect_timeout: 10 });
const uid = "c584251d-ce80-4ada-b391-7c2531003375";

try {
  const a = await sql`select count(*)::int as n from accounts where user_id = ${uid}`;
  console.log("accounts", a[0].n);
  const t = await sql`select count(*)::int as n from transactions where user_id = ${uid}`;
  console.log("transactions", t[0].n);
  const r = await sql`select count(*)::int as n from recurring_bills where user_id = ${uid}`;
  console.log("recurring_bills", r[0].n);
  const p = await sql`select email, full_name from profiles where id = ${uid}`;
  console.log("profile", p[0] ?? null);
  // simulate seed
  await sql`select public.seed_default_categories(${uid})`;
  console.log("seed ok");
  const cats = await sql`select count(*)::int as n from categories where user_id = ${uid}`;
  console.log("categories", cats[0].n);
} catch (e) {
  console.error("ERR", e);
} finally {
  await sql.end({ timeout: 5 });
}
