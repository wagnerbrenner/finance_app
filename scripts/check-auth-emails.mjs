import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", override: true });

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

try {
  const users = await sql`
    select email, email_confirmed_at, created_at, confirmation_sent_at
    from auth.users
    order by created_at desc
    limit 8
  `;
  console.log("recent users:");
  for (const u of users) {
    console.log(
      "-",
      u.email,
      "| confirmed:",
      Boolean(u.email_confirmed_at),
      "| created:",
      u.created_at?.toISOString?.() ?? u.created_at,
      "| confirmation_sent:",
      u.confirmation_sent_at?.toISOString?.() ?? u.confirmation_sent_at,
    );
  }
} finally {
  await sql.end({ timeout: 5 });
}
