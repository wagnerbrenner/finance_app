import Link from "next/link";
import { BrandMascot } from "@/shared/components/brand-media";
import { BRAND } from "@/shared/lib/brand";
import { BILLING } from "@/shared/lib/billing";
import { Button } from "@/components/ui/button";
import { MarketingFaq } from "@/features/marketing/components/marketing-faq";
import { MarketingDemo } from "@/features/marketing/components/marketing-demo";
import {
  MarketingFooter,
  MarketingHeader,
} from "@/features/marketing/components/marketing-page-shell";

const CAN_DO = [
  {
    title: "Anotar o dia a dia",
    body: "Gasto do mercado, uber, almoço — em poucos toques. Sem fórmula e sem medo de “quebrar” a planilha.",
  },
  {
    title: "Ver o mês de uma vez",
    body: "Receitas, despesas e o que sobrou. Categorias mostram pra onde o dinheiro foi de verdade.",
  },
  {
    title: "Lembrar do que se repete",
    body: "Salário, aluguel, streaming: cadastre uma vez e acompanhe os vencimentos.",
  },
  {
    title: "Cuidar de metas e dívidas",
    body: "Guarde para um objetivo ou quite o que deve, com acompanhamento simples no mesmo lugar.",
  },
];

const FOR_WHOM = [
  "Quem vive de salário e quer saber o que sobra",
  "Quem faz freela ou renda mista",
  "Quem está cansado de planilha abandonada",
  "Quem quer organizar sem virar “especialista em Excel”",
];

const TRUST = [
  "Sem cartão no 1º mês",
  "Cancele a recorrência quando quiser",
  "Seus dados só você vê",
];

const WHY_SUBSCRIBE = [
  {
    title: "Clareza do mês real",
    body: "Um mês lançando de verdade mostra se o hábito cola — sem chute.",
  },
  {
    title: "Insights que acompanham você",
    body: "Sugestões a partir do que você anota, não de planilha genérica.",
  },
  {
    title: "Tudo num lugar só",
    body: "Painel, recorrentes, metas e dívidas sem abas infinitas no Excel.",
  },
];

export function MarketingLanding() {
  return (
    <div className="relative min-h-svh overflow-x-hidden bg-[#070B14] font-sans text-[#E8EEF7]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 15% 0%, rgba(34,211,238,0.14), transparent 55%),
            radial-gradient(ellipse 50% 40% at 100% 20%, rgba(245,158,11,0.09), transparent 50%),
            linear-gradient(180deg, #070B14 0%, #0A101C 40%, #070B14 100%)
          `,
        }}
      />

      <MarketingHeader />

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
            <div>
              <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-cyan-300 sm:text-4xl md:text-5xl">
                {BRAND.name}
              </p>
              <p className="mt-3 inline-flex rounded-full border border-amber-500/35 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300">
                {BILLING.trialLabelLong} de Pro grátis · sem cartão
              </p>
              <h1 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
                Organize o dinheiro sem complicar a vida.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400 md:text-lg">
                Anote o que entra e o que sai. Em minutos você enxerga o mês — e no cadastro ganha o{" "}
                <span className="text-slate-200">primeiro mês completo</span> pra sentir se faz
                sentido assinar.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                    Quero meu mês grátis
                  </Button>
                </Link>
                <Link href="/#precos">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-cyan-500/40 bg-transparent text-slate-100 hover:bg-cyan-500/10"
                  >
                    Ver preços
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {BRAND.tagline} Um mês pra testar · depois é assinatura.
              </p>
            </div>

            <div className="relative flex flex-col items-center gap-5">
              <div className="absolute -inset-6 rounded-full bg-cyan-500/10 blur-3xl" aria-hidden />
              <BrandMascot
                priority
                className="relative z-10 w-44 drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)] sm:w-52 md:w-60"
              />
              <MarketingDemo />
            </div>
          </div>
        </section>

        <section className="border-y border-white/5 bg-black/30 py-6">
          <ul className="mx-auto flex max-w-6xl flex-col gap-3 px-5 text-center text-sm text-slate-300 sm:flex-row sm:justify-center sm:gap-10 md:px-8">
            {TRUST.map((line) => (
              <li key={line} className="font-medium text-cyan-200/90">
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section className="border-b border-white/5 bg-black/25 py-14 md:py-16">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Feito pra gente comum — de verdade
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
              Não é curso de investimento nem planilha de especialista. É um lugar calmo pra anotar
              o bolso e entender o mês sem virar segundo emprego.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {FOR_WHOM.map((line) => (
                <li
                  key={line}
                  className="flex gap-3 border-l-2 border-amber-500/70 pl-4 text-sm leading-relaxed text-slate-300"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
            O que você consegue fazer
          </h2>
          <p className="mt-3 max-w-xl text-sm text-slate-400 md:text-base">
            Quatro hábitos simples. O resto o painel organiza.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {CAN_DO.map((item, i) => (
              <div key={item.title} className="relative pl-14">
                <span
                  className="absolute left-0 top-0 font-[family-name:var(--font-mono)] text-2xl text-cyan-500/40"
                  aria-hidden
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="border-y border-white/5 bg-gradient-to-b from-black/30 to-transparent py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Por que assinar depois da degustação
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400 md:text-base">
              O primeiro mês é pra você sentir o produto. Se colar, a assinatura mantém o ritmo —
              sem plano grátis paralelo.
            </p>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {WHY_SUBSCRIBE.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-cyan-500/15 bg-[#0B1220]/80 p-5"
                >
                  <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link href="/signup">
                <Button className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                  Começar meu mês grátis
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-5 py-12 md:px-8">
          <div className="rounded-3xl border border-amber-500/25 bg-gradient-to-br from-amber-500/10 via-[#0B1220] to-cyan-500/10 px-6 py-8 md:px-10 md:py-10">
            <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
              Degustação
            </p>
            <h2 className="mt-2 max-w-2xl font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight text-white md:text-3xl">
              Um mês inteiro pra decidir com calma
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400 md:text-base">
              Acesso completo desde o dia 1 — sem pedir cartão. Se não assinar depois, o app fica
              pausado até a assinatura.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-slate-300 sm:grid-cols-3">
              <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                Full acesso no 1º mês
              </li>
              <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                Sem cartão na degustação
              </li>
              <li className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                Depois: só com assinatura
              </li>
            </ul>
          </div>
        </section>

        <section id="precos" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Um mês pra sentir. Depois, assinatura.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-400">
            Sem plano grátis eterno depois da degustação — você decide com um mês real de uso.
          </p>
          <div className="mx-auto mt-10 max-w-lg">
            <div className="relative rounded-2xl border border-amber-500/40 bg-[#0B1220]/90 p-6 shadow-[0_0_40px_rgba(245,158,11,0.1)] md:p-8">
              <span className="absolute -top-3 right-4 rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-950">
                1º mês grátis
              </span>
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                Te Organiza Pro
              </h3>
              <p className="mt-1 text-sm text-slate-400">
                Tudo liberado na degustação. Depois cobramos pra continuar.
              </p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-amber-400">
                {BILLING.monthly.display}
              </p>
              <p className="text-xs text-slate-500">
                ou {BILLING.annual.display} ({BILLING.annual.monthlyEquivalent} ·{" "}
                {BILLING.annual.discountNote})
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Lançamentos, painel, contas e recorrentes</li>
                <li>Insights a partir dos seus gastos</li>
                <li>Investimentos, dívidas, metas e lembretes</li>
                <li>Cancele a recorrência quando quiser</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400">
                  Começar meu mês grátis
                </Button>
              </Link>
              <p className="mt-3 text-center text-[11px] text-slate-500">
                Sem cartão no 1º mês. Após a degustação, assine para seguir usando.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 bg-black/20 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <h2 className="mb-8 text-center font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
              Dúvidas comuns
            </h2>
            <MarketingFaq />
            <p className="mt-8 text-center text-sm text-slate-500">
              Quer saber mais?{" "}
              <Link href="/sobre" className="text-cyan-400 hover:underline">
                Sobre
              </Link>
              {" · "}
              <Link href="/novidades" className="text-cyan-400 hover:underline">
                Novidades
              </Link>
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:pb-24">
          <BrandMascot className="mx-auto mb-6 w-28 opacity-90" />
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Use um mês de verdade. Depois você decide.
          </h2>
          <p className="mt-3 text-slate-400">
            Crie a conta, lance o primeiro gasto e aproveite o Pro completo na degustação — sem
            cartão.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              Quero meu mês grátis
            </Button>
          </Link>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
