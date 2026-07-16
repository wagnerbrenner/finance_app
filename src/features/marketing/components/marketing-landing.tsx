import Link from "next/link";
import { BrandLogo, BrandMascot } from "@/shared/components/brand-media";
import { BRAND } from "@/shared/lib/brand";
import { Button } from "@/components/ui/button";
import { MarketingFaq } from "@/features/marketing/components/marketing-faq";
import { MarketingDemo } from "@/features/marketing/components/marketing-demo";

const PROBLEMS = [
  "Planilhas de Excel quebram, desatualizam e viram um segundo emprego.",
  "O app do banco mostra só um pedaço da sua vida financeira.",
  "Sem categoria, todo gasto parece justificável.",
  "No fim do mês o salário sumiu e você não sabe explicar para onde.",
];

const FEATURES = [
  {
    title: "Visão geral do mês",
    body: "Receitas, despesas e saldo em um painel. Gráficos por categoria mostram para onde o dinheiro foi.",
  },
  {
    title: "Rápido e no automático",
    body: "Importe o extrato em CSV e cadastre fixos uma vez. Salário, aluguel e assinaturas entram no ritmo certo.",
  },
  {
    title: "Dívidas e metas",
    body: "Acompanhe parcelas, marque o que pagou e aporte nas metas sem planilha paralela.",
  },
  {
    title: "Privado por arquitetura",
    body: "Cada linha do banco é isolada por usuário (RLS). Seus dados não são anúncio nem produto.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Crie sua conta",
    body: "Grátis, em menos de um minuto. Categorias essenciais já vêm prontas.",
  },
  {
    n: "2",
    title: "Registre em segundos",
    body: "Lançou o gasto, acabou. Sem fórmulas, sem abas, sem medo de quebrar nada.",
  },
  {
    n: "3",
    title: "Enxergue o mês inteiro",
    body: "Saldo, categorias e fluxo atualizados sozinhos — decide com calma.",
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
            radial-gradient(ellipse 70% 50% at 50% -5%, rgba(34,211,238,0.16), transparent 55%),
            radial-gradient(ellipse 40% 35% at 90% 40%, rgba(245,158,11,0.08), transparent 50%),
            linear-gradient(180deg, #070B14, #080D18)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(103,232,249,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.25) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#070B14]/80 backdrop-blur-md">
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
              <Button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                Criar conta grátis
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-10 px-5 pb-16 pt-12 md:grid-cols-2 md:gap-12 md:px-8 md:pb-24 md:pt-16">
          <div>
            <p className="mb-3 font-[family-name:var(--font-mono)] text-xs tracking-wide text-amber-400">
              O controle financeiro que se organiza sozinho
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.05] tracking-tight text-white md:text-5xl lg:text-6xl">
              Você sabe quanto ganha.
              <br />
              <span className="text-cyan-300">Mas não sabe pra onde vai.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-400 md:text-lg">
              Lance um gasto em segundos e os gráficos, o saldo do mês e as categorias se montam
              sozinhos. Feito pra vida real — {BRAND.tagline.toLowerCase()}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/signup">
                <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                  Começar agora, é grátis
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
            <p className="mt-4 text-xs text-slate-500">
              Sem cartão. Sem planilha quebrada. Só clareza.
            </p>
          </div>
          <div className="relative flex flex-col items-center gap-4">
            <BrandMascot
              priority
              className="relative z-10 w-40 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] sm:w-48 md:w-56"
            />
            <MarketingDemo />
          </div>
        </section>

        {/* Problem */}
        <section className="border-y border-white/5 bg-black/20 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <h2 className="max-w-2xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
              O problema não é ganhar pouco.
              <br />
              <span className="text-slate-400">É não enxergar.</span>
            </h2>
            <ul className="mt-10 grid gap-4 sm:grid-cols-2">
              {PROBLEMS.map((text) => (
                <li
                  key={text}
                  className="rounded-2xl border border-white/10 bg-[#0B1220]/70 px-5 py-4 text-sm leading-relaxed text-slate-300"
                >
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="max-w-xl font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Tudo que uma planilha faz.
            <br />
            <span className="text-cyan-300">Sem ser uma planilha.</span>
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-2xl border border-cyan-500/15 bg-[#0B1220]/80 p-6"
              >
                <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="border-y border-white/5 bg-black/20 py-16 md:py-20">
          <div className="mx-auto max-w-6xl px-5 md:px-8">
            <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Do caos ao controle em três passos
            </h2>
            <ol className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((s) => (
                <li key={s.n} className="rounded-2xl border border-white/10 bg-[#0B1220]/70 p-6">
                  <span className="font-[family-name:var(--font-mono)] text-xs text-amber-400">
                    {s.n}
                  </span>
                  <h3 className="mt-2 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Pricing */}
        <section id="precos" className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
          <h2 className="text-center font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
            Preço justo, você escolhe
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-400">
            Comece grátis. O Pro entra quando a cobrança estiver ativa — por enquanto tudo do core
            está liberado pra você organizar o bolso.
          </p>
          <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-[#0B1220]/90 p-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                Grátis
              </h3>
              <p className="mt-1 text-sm text-slate-400">Para organizar o dia a dia.</p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-cyan-300">
                R$ 0
              </p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Transações e categorias</li>
                <li>Importação CSV / OFX</li>
                <li>Recorrentes, dívidas e metas</li>
                <li>Painel com gráficos</li>
              </ul>
              <Link href="/signup" className="mt-6 block">
                <Button className="w-full bg-cyan-500 text-slate-950 hover:bg-cyan-400">
                  Começar grátis
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border border-amber-500/40 bg-[#0B1220]/90 p-6 shadow-[0_0_40px_rgba(245,158,11,0.12)]">
              <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-white">
                Pro
              </h3>
              <p className="mt-1 text-sm text-slate-400">Patrimônio e o próximo nível.</p>
              <p className="mt-4 font-[family-name:var(--font-display)] text-3xl font-semibold text-amber-400">
                R$ 12,90<span className="text-base font-normal text-slate-400">/mês</span>
              </p>
              <p className="text-xs text-slate-500">ou R$ 99/ano (~R$ 8,25/mês)</p>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                <li>Tudo do Grátis</li>
                <li>Investimentos e alocação</li>
                <li>Visão de patrimônio</li>
                <li>Lembretes e futuras integrações</li>
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
              Perguntas frequentes
            </h2>
            <MarketingFaq />
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-3xl px-5 py-16 text-center md:px-8 md:py-24">
          <h2 className="font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
            O próximo mês pode ser diferente.
          </h2>
          <p className="mt-3 text-slate-400">
            Comece hoje e chegue no dia 28 sabendo exatamente onde está cada real.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg" className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">
              Criar conta grátis
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
