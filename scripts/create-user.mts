import { config } from "dotenv";
import postgres from "postgres";

config({ path: ".env.local", override: true });

const email = "wagner.brenner13@gmail.com";
const password = "Li.60000";
const fullName = "Wagner Carvalho Brenner";

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  connect_timeout: 20,
  max: 1,
});

async function main() {
  const existing = await sql`
    select id, email, email_confirmed_at
    from auth.users
    where email = ${email}
  `;

  let userId: string;

  if (existing[0]) {
    userId = existing[0].id as string;
    console.log("USER_EXISTS", userId);

    await sql`
      update auth.users
      set
        encrypted_password = crypt(${password}, gen_salt('bf')),
        email_confirmed_at = coalesce(email_confirmed_at, now()),
        raw_user_meta_data = coalesce(raw_user_meta_data, '{}'::jsonb) || ${sql.json({ full_name: fullName })},
        updated_at = now()
      where id = ${userId}::uuid
    `;
    console.log("USER_UPDATED_PASSWORD_AND_CONFIRMED");
  } else {
    const inserted = await sql`
      insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
      ) values (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        ${email},
        crypt(${password}, gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        ${sql.json({ full_name: fullName })}::jsonb,
        now(),
        now(),
        '',
        '',
        '',
        ''
      )
      returning id
    `;
    userId = inserted[0].id as string;
    console.log("USER_CREATED", userId);

    await sql`
      insert into auth.identities (
        id,
        user_id,
        identity_data,
        provider,
        provider_id,
        last_sign_in_at,
        created_at,
        updated_at
      ) values (
        gen_random_uuid(),
        ${userId}::uuid,
        ${sql.json({
          sub: userId,
          email,
          email_verified: true,
          full_name: fullName,
        })}::jsonb,
        'email',
        ${userId},
        now(),
        now(),
        now()
      )
      on conflict do nothing
    `;
    console.log("IDENTITY_OK");
  }

  // Ensure profile exists (trigger may have run, or insert fallback)
  const profile = await sql`
    insert into public.profiles (id, email, full_name)
    values (${userId}::uuid, ${email}, ${fullName})
    on conflict (id) do update
      set email = excluded.email,
          full_name = excluded.full_name,
          updated_at = now(),
          deleted_at = null
    returning id, email, full_name
  `;
  console.log("PROFILE", profile[0]);

  await sql.end({ timeout: 1 });
}

main().catch(async (err) => {
  console.error("FAIL", err.message);
  try {
    await sql.end({ timeout: 1 });
  } catch {
    // ignore
  }
  process.exit(1);
});
