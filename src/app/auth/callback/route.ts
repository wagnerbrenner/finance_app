import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { createAdminClient, hasServiceRole } from "@/shared/lib/supabase/admin";
import { getSiteUrl } from "@/shared/lib/site-url";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";
  const site = getSiteUrl();

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Confirma e-mail ao concluir o link (signup / magic link via Resend)
      const userId = data.user?.id ?? data.session?.user?.id;
      if (userId && hasServiceRole() && !data.user?.email_confirmed_at) {
        try {
          const admin = createAdminClient();
          await admin.auth.admin.updateUserById(userId, { email_confirm: true });
        } catch (err) {
          console.error("confirm email on callback failed", err);
        }
      }
      return NextResponse.redirect(`${site}${next.startsWith("/") ? next : `/${next}`}`);
    }
  }

  return NextResponse.redirect(`${site}/login?error=auth`);
}
