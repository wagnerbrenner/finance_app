import type { Metadata } from "next";
import Link from "next/link";
import { MarketingPageShell } from "@/features/marketing/components/marketing-page-shell";
import { BRAND } from "@/shared/lib/brand";
import { BILLING } from "@/shared/lib/billing";

export const metadata: Metadata = {
  title: "Sobre",
  description: `Conheça o ${BRAND.name}: finanças pessoais simples, com um mês pra testar.`,
};

export default function SobrePage() {
  return (
    <MarketingPageShell title={`Sobre o ${BRAND.name}`}>
      <div className="space-y-6 text-sm leading-relaxed text-slate-300 md:text-base">
        <p>
          O <strong className="text-white">{BRAND.name}</strong> é um app web de finanças pessoais.{" "}
          {BRAND.tagline} Você anota o que ganha e o que gasta e vê o mês com clareza — sem planilha
          caótica.
        </p>
        <p>
          Foi feito pra gente comum: salário, freela, contas do mês, metas e dívidas. Sem jargão de
          “especialista” e sem instalar nada nas lojas.
        </p>
        <h2 className="pt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-white">
          Como funciona a oferta
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-slate-400">
          <li>
            No cadastro você ganha o <strong className="text-slate-200">primeiro mês completo</strong>{" "}
            (sem cartão) pra sentir se o hábito cola.
          </li>
          <li>
            Depois, para continuar, assina o Pro ({BILLING.monthly.display} ou {BILLING.annual.display}
            ). Não há plano grátis eterno após a degustação.
          </li>
          <li>Você cancela a recorrência quando quiser, em Assinatura.</li>
        </ul>
        <p>
          Quer ver o que mudou recentemente? Confira as{" "}
          <Link href="/novidades" className="text-cyan-400 hover:underline">
            novidades
          </Link>
          . Dúvidas legais:{" "}
          <Link href="/termos" className="text-cyan-400 hover:underline">
            Termos
          </Link>{" "}
          e{" "}
          <Link href="/privacidade" className="text-cyan-400 hover:underline">
            Privacidade
          </Link>
          .
        </p>
        <p>
          <Link href="/signup" className="font-medium text-amber-400 hover:underline">
            Começar meu mês grátis →
          </Link>
        </p>
      </div>
    </MarketingPageShell>
  );
}
