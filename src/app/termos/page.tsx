import type { Metadata } from "next";
import { MarketingPageShell } from "@/features/marketing/components/marketing-page-shell";
import { BRAND } from "@/shared/lib/brand";
import { BILLING } from "@/shared/lib/billing";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: `Termos de uso do ${BRAND.name}.`,
};

export default function TermosPage() {
  return (
    <MarketingPageShell title="Termos de uso">
      <p className="mb-6 text-xs text-slate-500">Última atualização: 17 de julho de 2026</p>
      <div className="prose-invert space-y-5 text-sm leading-relaxed text-slate-300">
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            1. Aceite
          </h2>
          <p>
            Ao criar conta e usar o {BRAND.name}, você concorda com estes Termos. Se não concordar,
            não use o serviço.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            2. O serviço
          </h2>
          <p>
            O {BRAND.name} é uma ferramenta web de organização financeira pessoal. Você registra
            lançamentos e visualiza painéis; não somos banco, corretora nem consultoria de
            investimentos.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            3. Degustação e assinatura
          </h2>
          <p>
            Novas contas recebem aproximadamente {BILLING.trialLabel} de acesso completo sem cartão.
            Após esse período, o uso contínuo exige assinatura paga (mensal ou anual). Não há plano
            gratuito eterno depois da degustação. Pagamentos são processados via Mercado Pago.
          </p>
          <p>
            Você pode cancelar a recorrência em Assinatura; o acesso permanece até o fim do período
            já pago, quando aplicável.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            4. Sua responsabilidade
          </h2>
          <p>
            Você é responsável pela veracidade dos lançamentos e pela guarda das suas credenciais.
            Não peça e não compartilhe senha de banco ou cartão conosco ou pelo chat de ajuda.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            5. Disponibilidade
          </h2>
          <p>
            Nos esforçamos para manter o serviço estável, mas não garantimos disponibilidade
            ininterrupta. Manutenções e falhas de terceiros (hospedagem, e-mail, pagamento) podem
            ocorrer.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            6. Contato
          </h2>
          <p>
            Dúvidas sobre estes Termos: use o chat de ajuda no app (conta logada) ou o e-mail de
            suporte configurado no produto.
          </p>
        </section>
      </div>
    </MarketingPageShell>
  );
}
