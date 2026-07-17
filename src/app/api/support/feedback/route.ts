import { NextResponse } from "next/server";
import { createClient } from "@/shared/lib/supabase/server";
import { handleSupportFeedback } from "@/features/support/support.service";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  const payload =
    typeof body === "object" && body
      ? { ...(body as Record<string, unknown>), userId: user.id, email: user.email ?? undefined }
      : body;

  const result = await handleSupportFeedback(payload, ip);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
