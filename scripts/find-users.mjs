import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

try {
  const auth = await sql`
    select id, email, created_at
    from auth.users
    where email ilike '%wagner%' or email ilike '%brenner%'
    order by created_at desc
    limit 20
  `;
  const prof = await sql`
    select id, email, created_at
    from public.profiles
    where email ilike '%wagner%' or email ilike '%brenner%'
    order by created_at desc
    limit 20
  `;
  const recent = await sql`
    select email, created_at
    from auth.users
    order by created_at desc
    limit 20
  `;
  console.log("auth matches:", auth);
  console.log("profile matches:", prof);
  console.log("recent auth emails:", recent);
} finally {
  await sql.end({ timeout: 5 });
}
