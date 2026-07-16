import { and, desc, eq, isNull } from "drizzle-orm";
import { format } from "date-fns";
import { db } from "@/server/db";
import {
  profiles,
  subscriptionPayments,
  subscriptions,
} from "@/server/db/schema";

export type EntitlementReason = "test" | "trial" | "paid" | "none";

export type SubscriptionRow = typeof subscriptions.$inferSelect;
export type PaymentRow = typeof subscriptionPayments.$inferSelect;

export type Entitlements = {
  userId: string;
  email: string;
  accountTier: "standard" | "test";
  plan: "free" | "pro";
  reason: EntitlementReason;
  trialEndsAt: Date | null;
  trialDaysLeft: number | null;
  showPaywallModal: boolean;
  subscription: SubscriptionRow | null;
  currentPeriodPaid: boolean;
  payments: PaymentRow[];
};

function isProSubscription(sub: SubscriptionRow | null, now: Date): boolean {
  if (!sub) return false;
  if (sub.status === "active" || sub.status === "past_due") {
    if (sub.currentPeriodEnd && sub.currentPeriodEnd < now) return false;
    return true;
  }
  if (sub.status === "canceled" && sub.currentPeriodEnd && sub.currentPeriodEnd >= now) {
    return true;
  }
  return false;
}

export async function getEntitlements(userId: string): Promise<Entitlements> {
  const now = new Date();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(and(eq(profiles.id, userId), isNull(profiles.deletedAt)))
    .limit(1);

  if (!profile) {
    return {
      userId,
      email: "",
      accountTier: "standard",
      plan: "free",
      reason: "none",
      trialEndsAt: null,
      trialDaysLeft: null,
      showPaywallModal: false,
      subscription: null,
      currentPeriodPaid: false,
      payments: [],
    };
  }

  const accountTier = profile.accountTier === "test" ? "test" : "standard";

  const [subscription] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .orderBy(desc(subscriptions.createdAt))
    .limit(1);

  const payments = subscription
    ? await db
        .select()
        .from(subscriptionPayments)
        .where(eq(subscriptionPayments.subscriptionId, subscription.id))
        .orderBy(desc(subscriptionPayments.createdAt))
        .limit(24)
    : [];

  const periodLabel = format(now, "yyyy-MM");
  const currentPeriodPaid = payments.some(
    (p) => p.status === "approved" && (p.periodLabel === periodLabel || !p.periodLabel),
  );

  if (accountTier === "test") {
    return {
      userId,
      email: profile.email,
      accountTier,
      plan: "pro",
      reason: "test",
      trialEndsAt: profile.trialEndsAt,
      trialDaysLeft: null,
      showPaywallModal: false,
      subscription: subscription ?? null,
      currentPeriodPaid: true,
      payments,
    };
  }

  if (isProSubscription(subscription ?? null, now)) {
    return {
      userId,
      email: profile.email,
      accountTier,
      plan: "pro",
      reason: "paid",
      trialEndsAt: profile.trialEndsAt,
      trialDaysLeft: null,
      showPaywallModal: false,
      subscription: subscription ?? null,
      currentPeriodPaid:
        subscription?.status === "active"
          ? currentPeriodPaid || Boolean(subscription.currentPeriodEnd && subscription.currentPeriodEnd >= now)
          : currentPeriodPaid,
      payments,
    };
  }

  const trialEndsAt = profile.trialEndsAt;
  const inTrial = Boolean(trialEndsAt && trialEndsAt > now);
  if (inTrial && trialEndsAt) {
    const ms = trialEndsAt.getTime() - now.getTime();
    const trialDaysLeft = Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
    return {
      userId,
      email: profile.email,
      accountTier,
      plan: "pro",
      reason: "trial",
      trialEndsAt,
      trialDaysLeft,
      showPaywallModal: false,
      subscription: subscription ?? null,
      currentPeriodPaid: false,
      payments,
    };
  }

  return {
    userId,
    email: profile.email,
    accountTier,
    plan: "free",
    reason: "none",
    trialEndsAt,
    trialDaysLeft: 0,
    showPaywallModal: true,
    subscription: subscription ?? null,
    currentPeriodPaid: false,
    payments,
  };
}

export function hasProAccess(ent: Entitlements): boolean {
  return ent.plan === "pro";
}
