/**
 * Usage: node scripts/set-account-tier.mjs <email> test|standard
 */
import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

const email = process.argv[2];
const tier = process.argv[3];

if (!email || !["test", "standard"].includes(tier)) {
  console.error("Usage: node scripts/set-account-tier.mjs <email> test|standard");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(process.env.DATABASE_URL, { prepare: false, max: 1 });

try {
  const rows = await sql`
    update public.profiles
    set account_tier = ${tier}, updated_at = now()
    where lower(email) = lower(${email})
      and deleted_at is null
    returning id, email, account_tier, trial_ends_at
  `;
  if (!rows.length) {
    console.error("Profile not found for", email);
    process.exit(1);
  }
  console.log("Updated:", rows[0]);
} finally {
  await sql.end({ timeout: 5 });
}
