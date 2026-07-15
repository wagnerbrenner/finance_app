import { NextResponse } from "next/server";
import { sendDueReminderEmailsForAllUsers } from "@/server/services/email.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization");
  return header === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const result = await sendDueReminderEmailsForAllUsers();
    if (!result.ok) {
      return NextResponse.json(result, { status: 503 });
    }
    return NextResponse.json(result);
  } catch (error) {
    console.error("due-reminders cron failed", error);
    return NextResponse.json({ error: "Falha ao enviar lembretes" }, { status: 500 });
  }
}
