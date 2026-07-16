import { NextResponse } from "next/server";
import {
  ingestPaymentFromMp,
  markEventProcessed,
  recordSubscriptionEvent,
  syncPreapprovalFromMp,
} from "@/server/services/billing.service";
import { verifyWebhookAuthorized } from "@/server/services/mercadopago.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!verifyWebhookAuthorized(request)) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const url = new URL(request.url);
  let body: Record<string, unknown> = {};
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const topic =
    (body.type as string | undefined) ||
    (body.topic as string | undefined) ||
    url.searchParams.get("topic") ||
    url.searchParams.get("type") ||
    null;

  const data = (body.data as { id?: string } | undefined) ?? {};
  const idFromQuery = url.searchParams.get("id") || url.searchParams.get("data.id");
  const resourceId = data.id ? String(data.id) : idFromQuery;

  const eventId =
    (body.id as string | undefined) ||
    (resourceId && topic ? `${topic}:${resourceId}` : null);

  const recorded = await recordSubscriptionEvent({
    eventId,
    topic,
    payload: { ...body, query: Object.fromEntries(url.searchParams) },
  });

  if (recorded.duplicate) {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  try {
    const t = (topic ?? "").toLowerCase();
    if (resourceId && (t.includes("payment") || t === "payment")) {
      await ingestPaymentFromMp(resourceId);
    } else if (
      resourceId &&
      (t.includes("subscription") || t.includes("preapproval"))
    ) {
      await syncPreapprovalFromMp(resourceId);
    }

    if (recorded.id) await markEventProcessed(recorded.id);
  } catch (e) {
    console.error("billing webhook processing failed", e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
