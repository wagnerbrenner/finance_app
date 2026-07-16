import { and, eq } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/server/db";
import {
  subscriptionEvents,
  subscriptionPayments,
  subscriptions,
} from "@/server/db/schema";
import type { BillingPlan } from "@/shared/lib/billing";
import {
  cancelPreapproval,
  createCheckoutPreapproval,
  getPayment,
  getPreapproval,
  isMercadoPagoConfigured,
} from "@/server/services/mercadopago.service";

function mapMpStatus(status?: string): string {
  const s = (status ?? "").toLowerCase();
  if (s === "authorized" || s === "active") return "active";
  if (s === "paused") return "past_due";
  if (s === "cancelled" || s === "canceled") return "canceled";
  if (s === "pending") return "pending";
  return "pending";
}

export async function startCheckout(input: {
  userId: string;
  email: string;
  plan: BillingPlan;
}) {
  if (!isMercadoPagoConfigured()) {
    return {
      ok: false as const,
      error: "Pagamentos ainda não configurados. Defina MERCADOPAGO_ACCESS_TOKEN.",
    };
  }

  const { initPoint, externalId } = await createCheckoutPreapproval(input);

  const [existing] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, input.userId))
    .limit(1);

  const now = new Date();
  if (existing) {
    await db
      .update(subscriptions)
      .set({
        provider: "mercadopago",
        externalId,
        plan: input.plan,
        status: "pending",
        cancelAtPeriodEnd: false,
        canceledAt: null,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, existing.id));
  } else {
    await db.insert(subscriptions).values({
      userId: input.userId,
      provider: "mercadopago",
      externalId,
      plan: input.plan,
      status: "pending",
    });
  }

  return { ok: true as const, initPoint };
}

export async function cancelUserSubscription(userId: string) {
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1);

  if (!sub?.externalId) {
    return { ok: false as const, error: "Nenhuma assinatura ativa encontrada." };
  }

  if (isMercadoPagoConfigured()) {
    try {
      await cancelPreapproval(sub.externalId);
    } catch (e) {
      console.error("MP cancel failed", e);
    }
  }

  const now = new Date();
  await db
    .update(subscriptions)
    .set({
      cancelAtPeriodEnd: true,
      canceledAt: now,
      status: sub.currentPeriodEnd && sub.currentPeriodEnd > now ? "canceled" : "canceled",
      updatedAt: now,
    })
    .where(eq(subscriptions.id, sub.id));

  return { ok: true as const };
}

export async function recordSubscriptionEvent(input: {
  eventId: string | null;
  topic: string | null;
  payload: unknown;
}) {
  if (input.eventId) {
    const [dup] = await db
      .select({ id: subscriptionEvents.id })
      .from(subscriptionEvents)
      .where(
        and(
          eq(subscriptionEvents.provider, "mercadopago"),
          eq(subscriptionEvents.eventId, input.eventId),
        ),
      )
      .limit(1);
    if (dup) return { ok: true as const, duplicate: true };
  }

  const [row] = await db
    .insert(subscriptionEvents)
    .values({
      provider: "mercadopago",
      eventId: input.eventId,
      topic: input.topic,
      payload: input.payload as Record<string, unknown>,
    })
    .returning({ id: subscriptionEvents.id });

  return { ok: true as const, duplicate: false, id: row?.id };
}

export async function syncPreapprovalFromMp(externalId: string) {
  const pre = await getPreapproval(externalId);
  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.externalId, externalId))
    .limit(1);

  if (!sub) return;

  const status = mapMpStatus(pre.status);
  const now = new Date();
  let periodEnd = sub.currentPeriodEnd;
  if (status === "active" && !periodEnd) {
    periodEnd = new Date(now);
    if (sub.plan === "annual") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  await db
    .update(subscriptions)
    .set({
      status,
      currentPeriodStart: status === "active" ? sub.currentPeriodStart ?? now : sub.currentPeriodStart,
      currentPeriodEnd: periodEnd,
      updatedAt: now,
      cancelAtPeriodEnd: status === "canceled" ? true : sub.cancelAtPeriodEnd,
    })
    .where(eq(subscriptions.id, sub.id));
}

export async function ingestPaymentFromMp(paymentId: string) {
  const payment = await getPayment(paymentId);
  const externalRef = payment.external_reference ?? "";
  const preapprovalId = payment.preapproval_id
    ? String(payment.preapproval_id)
    : null;

  let [sub] = preapprovalId
    ? await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.externalId, preapprovalId))
        .limit(1)
    : [undefined];

  if (!sub && externalRef.includes(":")) {
    const userId = externalRef.split(":")[0];
    [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.userId, userId))
      .limit(1);
  }

  if (!sub) return { ok: false as const, error: "subscription_not_found" };

  const statusRaw = (payment.status ?? "").toLowerCase();
  const status =
    statusRaw === "approved"
      ? "approved"
      : statusRaw === "refunded"
        ? "refunded"
        : statusRaw === "rejected" || statusRaw === "cancelled"
          ? "rejected"
          : "pending";

  const paidAt = payment.date_approved ? new Date(payment.date_approved) : null;
  const periodLabel = format(paidAt ?? new Date(), "yyyy-MM");
  const amount = String(payment.transaction_amount ?? 0);
  const externalPaymentId = String(payment.id);

  const [existingPay] = await db
    .select({ id: subscriptionPayments.id })
    .from(subscriptionPayments)
    .where(eq(subscriptionPayments.externalPaymentId, externalPaymentId))
    .limit(1);

  if (!existingPay) {
    await db.insert(subscriptionPayments).values({
      subscriptionId: sub.id,
      externalPaymentId,
      amount,
      currency: payment.currency_id ?? "BRL",
      status,
      paidAt,
      periodLabel,
    });
  }

  if (status === "approved") {
    const now = new Date();
    const periodEnd = new Date(now);
    if (sub.plan === "annual") periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    else periodEnd.setMonth(periodEnd.getMonth() + 1);

    await db
      .update(subscriptions)
      .set({
        status: "active",
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
        cancelAtPeriodEnd: false,
        updatedAt: now,
      })
      .where(eq(subscriptions.id, sub.id));
  }

  return { ok: true as const };
}

export async function markEventProcessed(eventRowId: string) {
  await db
    .update(subscriptionEvents)
    .set({ processedAt: new Date() })
    .where(eq(subscriptionEvents.id, eventRowId));
}
