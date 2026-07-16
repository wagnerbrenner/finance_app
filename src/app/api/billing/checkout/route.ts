import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/shared/lib/supabase/server";
import { getProfileForUser } from "@/server/services/profiles.service";
import { getEntitlements } from "@/server/services/entitlements.service";
import { startCheckout } from "@/server/services/billing.service";

const bodySchema = z.object({
  plan: z.enum(["monthly", "annual"]),
});

export async function POST(request: Request) {
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
      { error: "Conta de teste — cobrança desnecessária." },
      { status: 400 },
    );
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Plano inválido" }, { status: 400 });
  }

  const profile = await getProfileForUser(user.id);
  const email = profile?.email || user.email;
  if (!email) {
    return NextResponse.json({ error: "E-mail da conta não encontrado" }, { status: 400 });
  }

  try {
    const result = await startCheckout({
      userId: user.id,
      email,
      plan: parsed.data.plan,
    });
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 503 });
    }
    return NextResponse.json({ initPoint: result.initPoint });
  } catch (e) {
    console.error("checkout failed", e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Falha no checkout" },
      { status: 502 },
    );
  }
}
