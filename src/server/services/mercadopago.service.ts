import { BILLING, type BillingPlan } from "@/shared/lib/billing";
import { getSiteUrl } from "@/shared/lib/site-url";

const MP_API = "https://api.mercadopago.com";

function accessToken() {
  return process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || "";
}

export function isMercadoPagoConfigured() {
  return Boolean(accessToken());
}

async function mpFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = accessToken();
  if (!token) {
    throw new Error("MERCADOPAGO_ACCESS_TOKEN não configurado");
  }
  const res = await fetch(`${MP_API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const data = (await res.json()) as T & { message?: string; error?: string };
  if (!res.ok) {
    const msg =
      typeof data === "object" && data && "message" in data
        ? String(data.message ?? data.error ?? res.statusText)
        : res.statusText;
    throw new Error(`Mercado Pago: ${msg}`);
  }
  return data;
}

export type MpPreapproval = {
  id: string;
  status?: string;
  init_point?: string;
  sandbox_init_point?: string;
  external_reference?: string;
  next_payment_date?: string;
  auto_recurring?: {
    transaction_amount?: number;
    frequency?: number;
    frequency_type?: string;
  };
};

export async function createCheckoutPreapproval(input: {
  userId: string;
  email: string;
  plan: BillingPlan;
}): Promise<{ initPoint: string; externalId: string }> {
  const amount =
    input.plan === "annual" ? BILLING.annual.amount : BILLING.monthly.amount;
  const reason =
    input.plan === "annual"
      ? `${BILLING.productName} — Anual`
      : `${BILLING.productName} — Mensal`;

  const planEnv =
    input.plan === "annual"
      ? process.env.MERCADOPAGO_PREAPPROVAL_PLAN_ID_ANNUAL
      : process.env.MERCADOPAGO_PREAPPROVAL_PLAN_ID_MONTHLY;

  const backUrl = `${getSiteUrl()}/app/assinatura?checkout=return`;

  const body: Record<string, unknown> = {
    reason,
    external_reference: `${input.userId}:${input.plan}`,
    payer_email: input.email,
    back_url: backUrl,
    status: "pending",
  };

  if (planEnv?.trim()) {
    body.preapproval_plan_id = planEnv.trim();
  } else {
    body.auto_recurring = {
      frequency: input.plan === "annual" ? 12 : 1,
      frequency_type: "months",
      transaction_amount: amount,
      currency_id: BILLING.currency,
    };
  }

  const created = await mpFetch<MpPreapproval>("/preapproval", {
    method: "POST",
    body: JSON.stringify(body),
  });

  const initPoint =
    created.init_point ||
    created.sandbox_init_point ||
    "";
  if (!initPoint || !created.id) {
    throw new Error("Mercado Pago não retornou link de checkout");
  }

  return { initPoint, externalId: String(created.id) };
}

export async function cancelPreapproval(externalId: string): Promise<void> {
  await mpFetch(`/preapproval/${externalId}`, {
    method: "PUT",
    body: JSON.stringify({ status: "cancelled" }),
  });
}

export async function getPreapproval(externalId: string): Promise<MpPreapproval> {
  return mpFetch<MpPreapproval>(`/preapproval/${externalId}`);
}

export async function getPayment(paymentId: string): Promise<{
  id: number | string;
  status?: string;
  transaction_amount?: number;
  currency_id?: string;
  date_approved?: string | null;
  external_reference?: string | null;
  preapproval_id?: string | null;
}> {
  return mpFetch(`/v1/payments/${paymentId}`);
}

/** Optional webhook secret check (x-signature / query). Soft when unset. */
export function verifyWebhookAuthorized(request: Request): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (!secret) return true;
  const header =
    request.headers.get("x-webhook-secret") ||
    request.headers.get("x-signature") ||
    "";
  const url = new URL(request.url);
  const q = url.searchParams.get("secret") ?? "";
  return header.includes(secret) || q === secret;
}
