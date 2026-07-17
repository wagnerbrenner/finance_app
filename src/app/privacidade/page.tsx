import type { Metadata } from "next";
import { MarketingPageShell } from "@/features/marketing/components/marketing-page-shell";
import { BRAND } from "@/shared/lib/brand";

export const metadata: Metadata = {
  title: "Privacidade",
  description: `Política de privacidade do ${BRAND.name}.`,
};

export default function PrivacidadePage() {
  return (
    <MarketingPageShell title="Privacidade">
      <p className="mb-6 text-xs text-slate-500">Última atualização: 17 de julho de 2026</p>
      <div className="space-y-5 text-sm leading-relaxed text-slate-300">
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            1. O que coletamos
          </h2>
          <p>
            Dados de conta (e-mail, nome se informado) e dados financeiros que você lança no app
            (transações, contas, metas, etc.). Também podemos receber mensagens do chat de ajuda e
            sugestões de melhoria.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            2. Para que usamos
          </h2>
          <p>
            Prestação do serviço, autenticação, lembretes (quando ativos), suporte, melhoria do
            produto e cobrança da assinatura (via Mercado Pago).
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            3. Com quem compartilhamos
          </h2>
          <p>
            Provedores necessários à operação: hospedagem, banco de dados/auth (Supabase), e-mail
            (Resend) e pagamentos (Mercado Pago). Não vendemos seus dados nem exibimos anúncios no
            app.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            4. Isolamento
          </h2>
          <p>
            Cada usuário acessa apenas os próprios registros. Use senha forte e não compartilhe o
            acesso à conta.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            5. Seus direitos
          </h2>
          <p>
            Nos termos da LGPD, você pode solicitar acesso, correção ou exclusão de dados da conta.
            Use o chat de ajuda no app ou o e-mail de suporte do produto.
          </p>
        </section>
        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            6. Contato
          </h2>
          <p>Dúvidas de privacidade: chat no app (logado) ou canal de suporte informado no produto.</p>
        </section>
      </div>
    </MarketingPageShell>
  );
}
