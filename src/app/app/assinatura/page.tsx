import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { AssinaturaClient } from "@/features/billing/components/assinatura-client";
import { requireUserId } from "@/server/auth";
import { getEntitlements } from "@/server/services/entitlements.service";
import { isMercadoPagoConfigured } from "@/server/services/mercadopago.service";

export default async function AssinaturaPage() {
  const userId = await requireUserId();
  const ent = await getEntitlements(userId);

  return (
    <AppShell title="Assinatura" billingGateExempt>
      <PageHeader
        title="Assinatura"
        description={
          ent.hasAppAccess
            ? "Veja seu plano, pagamentos do mês e cancele a recorrência quando quiser."
            : "Sua degustação acabou. Assine o Pro para continuar usando o Te Organiza."
        }
      />
      <AssinaturaClient
        accountTier={ent.accountTier}
        plan={ent.plan}
        reason={ent.reason}
        hasAppAccess={ent.hasAppAccess}
        trialEndsAt={ent.trialEndsAt?.toISOString() ?? null}
        trialDaysLeft={ent.trialDaysLeft}
        subscription={
          ent.subscription
            ? {
                plan: ent.subscription.plan,
                status: ent.subscription.status,
                currentPeriodEnd: ent.subscription.currentPeriodEnd?.toISOString() ?? null,
                cancelAtPeriodEnd: ent.subscription.cancelAtPeriodEnd,
              }
            : null
        }
        currentPeriodPaid={ent.currentPeriodPaid}
        payments={ent.payments.map((p) => ({
          id: p.id,
          amount: String(p.amount),
          status: p.status,
          paidAt: p.paidAt?.toISOString() ?? null,
          periodLabel: p.periodLabel,
        }))}
        mpConfigured={isMercadoPagoConfigured()}
      />
    </AppShell>
  );
}
