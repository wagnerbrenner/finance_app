import Link from "next/link";
import { BrandLogo, BrandMascot } from "@/shared/components/brand-media";
import { BRAND } from "@/shared/lib/brand";
import { Button } from "@/components/ui/button";
import { MarketingFaq } from "@/features/marketing/components/marketing-faq";
import { MarketingDemo } from "@/features/marketing/components/marketing-demo";

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

      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#070B14]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-cyan-300"
          >
            <BrandLogo size={28} priority className="size-7" />
            {BRAND.name}
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" className="text-slate-200 hover:bg-cyan-500/10 hover:text-white">
                Entrar
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">Começar grátis</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero — brand first */}
        <section className="mx-auto max-w-6xl px-5 pb-14 pt-10 md:px-8 md:pb-20 md:pt-14">
          <div className="grid items-center gap-10 md:grid-cols-[1.05fr_0.95fr] md:gap-12">
            <div>
              <p className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-cyan-300 sm:text-4xl md:text-5xl">
                {BRAND.name}
              </p>
              <h1 className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold leading-[1.12] tracking-tight text-white sm:text-4xl md:text-[2.75rem]">
                Organize o dinheiro sem complicar a vida.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400 md:text-lg">
                Anote o que entra e o que sai. Em minutos você enxerga o mês — claro o bastante pra
                qualquer pessoa usar, do primeiro salário ao freela do fim de semana.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/signup">
                  <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                    Criar minha conta
                  </Button>
                </Link>
                <Link href="/login">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-cyan-500/40 bg-transparent text-slate-100 hover:bg-cyan-500/10"
                  >
                    Já tenho conta
                  </Button>
                </Link>
              </div>
              <p className="mt-4 text-xs text-slate-500">{BRAND.tagline} Sem cartão pra começar.</p>
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

        {/* Pra quem */}
        <section className="border-y border-white/5 bg-black/25 py-14 md:py-16">
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

        {/* O que dá pra fazer */}
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

        {/* Como começar — narrativa, não clone de 3 cards iguais */}
        <section className="border-y border-white/5 bg-gradient-to-b from-black/30 to-transparent py-16 md:py-20">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2 md:px-8">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Em três minutos você já está no ritmo
              </h2>
              <ol className="mt-8 space-y-6">
                <li>
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                    Conta
                  </p>
                  <p className="mt-1 text-slate-300">
                    Crie com e-mail, confirme e entre. Categorias básicas já vêm prontas.
                  </p>
                </li>
                <li>
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                    Primeiro lançamento
                  </p>
                  <p className="mt-1 text-slate-300">
                    Toque em + e registre um gasto ou uma receita. Sem segredo.
                  </p>
                </li>
                <li>
                  <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                    Olhar o painel
                  </p>
                  <p className="mt-1 text-slate-300">
                    Números e gráficos do mês atualizam com o que você anota — no seu tempo.
                  </p>
                </li>
              </ol>
            </div>
            <div className="rounded-3xl border border-cyan-500/20 bg-[#0B1220]/90 p-8 md:p-10">
              <p className="font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-white md:text-2xl">
                “Anotei o café, o mercado e o aluguel. No fim da semana eu já sabia onde o dinheiro
                estava indo.”
              </p>
              <p className="mt-4 text-sm text-slate-500">— Como a gente imagina o seu primeiro mês</p>
            </div>
          </div>
        </section>

        {/* Preços */}
        <section id="precos" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Comece sem pagar. Evolua se quiser.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-400">
            O essencial está liberado. O Pro entra quando a cobrança estiver ativa — até lá, organize
            o bolso com calma.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0B1220]/90 p-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                Grátis
              </h3>
              <p className="mt-1 text-sm text-slate-400">Para o dia a dia do bolso.</p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-cyan-300">
                R$ 0
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Lançamentos e categorias</li>
                <li>Contas, renda e recorrentes</li>
                <li>Dívidas e metas</li>
                <li>Painel com gráficos</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  Começar grátis
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border border-amber-500/40 bg-[#0B1220]/90 p-6 shadow-[0_0_40px_rgba(245,158,11,0.1)]">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                Pro
              </h3>
              <p className="mt-1 text-sm text-slate-400">Quando você quiser ir além.</p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-amber-400">
                R$ 12,90<span className="text-base font-normal text-slate-400">/mês</span>
              </p>
              <p className="text-xs text-slate-500">ou R$ 99/ano (~R$ 8,25/mês)</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Tudo do Grátis</li>
                <li>Investimentos e patrimônio</li>
                <li>Lembretes por e-mail</li>
                <li>Futuras conexões com banco</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400">
                  Criar conta (Pro em breve)
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t border-white/5 bg-black/20 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <h2 className="mb-8 text-center font-[family-name:var(--font-display)] text-3xl font-semibold text-white">
              Dúvidas comuns
            </h2>
            <MarketingFaq />
          </div>
        </section>

        {/* CTA final */}
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:pb-24">
          <BrandMascot className="mx-auto mb-6 w-28 opacity-90" />
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Seu próximo mês pode ficar mais claro.
          </h2>
          <p className="mt-3 text-slate-400">
            Crie a conta, lance o primeiro gasto e veja o painel ganhar vida.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              Quero me organizar
            </Button>
          </Link>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-xs text-slate-500 md:flex-row md:px-8">
          <p>
            {BRAND.name} · {new Date().getFullYear()}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/signup" className="hover:text-cyan-300">
              Criar conta
            </Link>
            <Link href="/login" className="hover:text-cyan-300">
              Entrar
            </Link>
            <span className="text-slate-600">Privacidade · Termos (em breve)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
