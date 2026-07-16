import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/shared/lib/brand";
import { BrandLogo, BrandMascot } from "@/shared/components/brand-media";

export default function HomePage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden bg-[#070B14] font-sans text-[#E8EEF7]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% -10%, rgba(34,211,238,0.18), transparent 55%),
            radial-gradient(ellipse 40% 35% at 90% 70%, rgba(245,158,11,0.1), transparent 50%),
            linear-gradient(180deg, #070B14, #080D18)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(103,232,249,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.2) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-cyan-300">
          <BrandLogo size={28} priority className="size-7" />
          {BRAND.name}
        </span>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-200 hover:bg-cyan-500/10 hover:text-white">
              Entrar
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">Começar</Button>
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 pb-16 pt-4 md:flex-row md:gap-10 md:px-10">
        <div className="max-w-lg text-center md:text-left">
          <p className="mb-3 font-[family-name:var(--font-mono)] text-xs tracking-wide text-amber-400">
            {"// gestão financeira pessoal"}
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] tracking-tight text-white md:text-6xl">
            {BRAND.name}
          </h1>
          <p className="mt-4 text-xl text-cyan-300 md:text-2xl">{BRAND.tagline}</p>
          <p className="mt-4 text-base text-slate-400 md:text-lg">{BRAND.shortPitch}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link href="/signup">
              <Button size="lg" className="bg-amber-500 text-slate-950 hover:bg-amber-400">
                Criar conta grátis
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
        </div>
        <BrandMascot
          priority
          className="w-44 drop-shadow-[0_24px_48px_rgba(0,0,0,0.55)] sm:w-52 md:w-64"
        />
      </main>
    </div>
  );
}
