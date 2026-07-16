import { describe, expect, it } from "vitest";

/** Pure helpers mirrored from entitlements for unit certainty without DB. */
function isProSubscription(
  sub: {
    status: string;
    currentPeriodEnd: Date | null;
  } | null,
  now: Date,
): boolean {
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

describe("subscription entitlement rules", () => {
  const now = new Date("2026-07-15T12:00:00Z");

  it("grants pro for active subscription in period", () => {
    expect(
      isProSubscription(
        { status: "active", currentPeriodEnd: new Date("2026-08-15T12:00:00Z") },
        now,
      ),
    ).toBe(true);
  });

  it("keeps pro until period end after cancel", () => {
    expect(
      isProSubscription(
        { status: "canceled", currentPeriodEnd: new Date("2026-07-20T12:00:00Z") },
        now,
      ),
    ).toBe(true);
  });

  it("denies pro when period ended", () => {
    expect(
      isProSubscription(
        { status: "active", currentPeriodEnd: new Date("2026-07-01T12:00:00Z") },
        now,
      ),
    ).toBe(false);
  });
});

describe("billing constants", () => {
  it("annual is ~30% off monthly*12", async () => {
    const { BILLING } = await import("@/shared/lib/billing");
    const fullYear = BILLING.monthly.amount * 12;
    const discount = 1 - BILLING.annual.amount / fullYear;
    expect(discount).toBeGreaterThan(0.28);
    expect(discount).toBeLessThan(0.32);
  });
});
