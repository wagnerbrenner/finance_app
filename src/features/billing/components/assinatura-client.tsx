"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { BILLING, type BillingPlan } from "@/shared/lib/billing";
import { formatBRL, formatDate } from "@/shared/lib/formatters";

type PaymentView = {
  id: string;
  amount: string;
  status: string;
  paidAt: string | null;
  periodLabel: string | null;
};

type AssinaturaClientProps = {
  accountTier: string;
  plan: "pro" | "locked";
  reason: string;
  hasAppAccess: boolean;
  trialEndsAt: string | null;
  trialDaysLeft: number | null;
  subscription: {
    plan: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  } | null;
  currentPeriodPaid: boolean;
  payments: PaymentView[];
  mpConfigured: boolean;
};

export function AssinaturaClient(props: AssinaturaClientProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState(false);

  async function checkout(plan: BillingPlan) {
    setBusy(true);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = (await res.json()) as { initPoint?: string; error?: string };
      if (!res.ok || !data.initPoint) {
        toast.error(data.error ?? "Não foi possível iniciar o checkout");
        return;
      }
      window.location.href = data.initPoint;
    } catch {
      toast.error("Falha de rede no checkout");
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!confirm("Cancelar a assinatura? Você mantém o Pro até o fim do período já pago.")) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/billing/cancel", { method: "POST" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Não foi possível cancelar");
        return;
      }
      toast.success("Cancelamento agendado. Pro até o fim do período.");
      startTransition(() => router.refresh());
    } catch {
      toast.error("Falha de rede ao cancelar");
    } finally {
      setBusy(false);
    }
  }

  const statusLabel = (() => {
    if (props.accountTier === "test") return "Conta teste (sem cobrança)";
    if (props.reason === "trial") {
      return `Mês de degustação Pro — ${props.trialDaysLeft ?? 0} dia(s) restante(s)`;
    }
    if (props.reason === "paid" && props.subscription?.cancelAtPeriodEnd) {
      return "Pro ativo — cancelamento agendado";
    }
    if (props.reason === "paid") return "Pro ativo";
    return "Degustação encerrada — assine para continuar";
  })();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <section className="rounded-2xl border border-border/60 bg-card/40 p-5">
        <h2 className="text-sm font-medium text-muted-foreground">Status</h2>
        <p className="mt-1 font-[family-name:var(--font-display)] text-xl font-semibold">
          {statusLabel}
        </p>
        {props.subscription ? (
          <dl className="mt-4 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide">Plano</dt>
              <dd className="text-foreground">
                {props.subscription.plan === "annual" ? "Anual" : "Mensal"} ·{" "}
                {props.subscription.status}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Fim do período</dt>
              <dd className="text-foreground">
                {props.subscription.currentPeriodEnd
                  ? formatDate(props.subscription.currentPeriodEnd.slice(0, 10))
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Pagou este mês?</dt>
              <dd className={props.currentPeriodPaid ? "text-emerald-400" : "text-amber-400"}>
                {props.accountTier === "test"
                  ? "N/A (teste)"
                  : props.currentPeriodPaid
                    ? "Sim"
                    : "Não / pendente"}
              </dd>
            </div>
          </dl>
        ) : props.trialEndsAt ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Trial até {formatDate(props.trialEndsAt.slice(0, 10))}
          </p>
        ) : null}
      </section>

      {props.accountTier !== "test" ? (
        <section className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-cyan-500/25 bg-card/40 p-5">
            <h3 className="font-semibold">Mensal</h3>
            <p className="mt-1 text-2xl font-semibold text-cyan-300">{BILLING.monthly.display}</p>
            <Button
              className="mt-4 w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400"
              disabled={busy || pending || !props.mpConfigured}
              onClick={() => void checkout("monthly")}
            >
              Assinar mensal
            </Button>
          </div>
          <div className="rounded-2xl border border-amber-500/40 bg-card/40 p-5">
            <h3 className="font-semibold">Anual</h3>
            <p className="mt-1 text-2xl font-semibold text-amber-400">{BILLING.annual.display}</p>
            <p className="text-xs text-muted-foreground">
              {BILLING.annual.monthlyEquivalent} · {BILLING.annual.discountNote}
            </p>
            <Button
              className="mt-4 w-full bg-amber-500 text-slate-950 hover:bg-amber-400"
              disabled={busy || pending || !props.mpConfigured}
              onClick={() => void checkout("annual")}
            >
              Assinar anual
            </Button>
          </div>
          {!props.mpConfigured ? (
            <p className="text-xs text-amber-400 sm:col-span-2">
              Checkout aguardando MERCADOPAGO_ACCESS_TOKEN no ambiente.
            </p>
          ) : null}
        </section>
      ) : null}

      {props.reason === "paid" && props.subscription && !props.subscription.cancelAtPeriodEnd ? (
        <section className="rounded-2xl border border-border/60 p-5">
          <h3 className="font-semibold">Cancelar assinatura</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Para a recorrência no Mercado Pago. Você continua Pro até o fim do período já pago.
          </p>
          <Button
            variant="outline"
            className="mt-4 border-rose-500/40 text-rose-300 hover:bg-rose-500/10"
            disabled={busy || pending}
            onClick={() => void cancel()}
          >
            Cancelar recorrência
          </Button>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border/60 p-5">
        <h3 className="font-semibold">Histórico de pagamentos</h3>
        {props.payments.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">Nenhum pagamento registrado ainda.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border/50">
            {props.payments.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <div>
                  <p className="font-medium">
                    {p.periodLabel ?? "—"} · {p.status}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {p.paidAt ? formatDate(p.paidAt.slice(0, 10)) : "sem data"}
                  </p>
                </div>
                <p className="tabular-nums">{formatBRL(Number(p.amount))}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
