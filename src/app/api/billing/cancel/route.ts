import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { getEntitlements } from "@/server/services/entitlements.service";
import { cancelUserSubscription } from "@/server/services/billing.service";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const ent = await getEntitlements(user.id);
  if (ent.accountTier === "test") {
    return NextResponse.json(
      { error: "Conta de teste não tem assinatura cobrada." },
      { status: 400 },
    );
  }

  try {
    const result = await cancelUserSubscription(user.id);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("cancel failed", e);
    return NextResponse.json({ error: "Falha ao cancelar" }, { status: 500 });
  }
}
