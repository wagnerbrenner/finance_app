import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local" });
config();

const email = process.argv[2]?.trim().toLowerCase();
if (!email) {
  console.error("Usage: node scripts/delete-user-by-email.mjs <email>");
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL missing");
  process.exit(1);
}

const sql = postgres(url, { prepare: false, max: 1 });

try {
  const authUsers = await sql`
    select id, email, created_at
    from auth.users
    where lower(email) = ${email}
  `;

  const profiles = await sql`
    select id, email, full_name, created_at, deleted_at
    from public.profiles
    where lower(email) = ${email}
  `;

  console.log("auth.users matches:", authUsers.length);
  console.log("profiles matches:", profiles.length);

  if (authUsers.length === 0 && profiles.length === 0) {
    console.log("No user found for", email);
    process.exit(0);
  }

  const ids = [...new Set([...authUsers.map((u) => u.id), ...profiles.map((p) => p.id)])];

  for (const id of ids) {
    // Tables without FK cascade to profiles/auth
    await sql`delete from public.email_reminder_log where user_id = ${id}`;

    // Deleting auth.users cascades to profiles and domain tables that reference profiles
    const deleted = await sql`delete from auth.users where id = ${id} returning id, email`;
    if (deleted.length) {
      console.log("Deleted auth.users:", deleted[0].email, deleted[0].id);
    } else {
      // Orphan profile only
      await sql`delete from public.profiles where id = ${id}`;
      console.log("Deleted orphan profile:", id);
    }
  }

  const stillAuth = await sql`select count(*)::int as n from auth.users where lower(email) = ${email}`;
  const stillProfile = await sql`select count(*)::int as n from public.profiles where lower(email) = ${email}`;
  console.log("Remaining auth.users:", stillAuth[0].n);
  console.log("Remaining profiles:", stillProfile[0].n);
  console.log("Done. You can sign up again with", email);
} catch (err) {
  console.error("Delete failed:", err?.message ?? err);
  process.exit(1);
} finally {
  await sql.end({ timeout: 5 });
}
