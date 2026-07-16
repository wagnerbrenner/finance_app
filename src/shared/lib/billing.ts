/** Pricing & plan constants — keep UI/docs/MP in sync. */
export const BILLING = {
  /** First calendar month of full Pro access (no card). */
  trialMonths: 1,
  trialLabel: "1 mês",
  trialLabelLong: "primeiro mês",
  currency: "BRL",
  monthly: {
    plan: "monthly" as const,
    amount: 12.9,
    label: "Mensal",
    display: "R$ 12,90/mês",
  },
  annual: {
    plan: "annual" as const,
    amount: 108.36,
    label: "Anual",
    display: "R$ 108,36/ano",
    monthlyEquivalent: "R$ 9,03/mês",
    discountNote: "~30% off vs mensal",
  },
  productName: "Te Organiza Pro",
} as const;

export type BillingPlan = "monthly" | "annual";
