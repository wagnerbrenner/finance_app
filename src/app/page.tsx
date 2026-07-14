import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_rgba(20,184,166,0.18),_transparent),linear-gradient(to_bottom,_transparent,_oklch(0.13_0.005_260))]"
      />
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          Finance OS
        </span>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost">Entrar</Button>
          </Link>
          <Link href="/signup">
            <Button>Começar</Button>
          </Link>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 pb-24 pt-10 md:px-10">
        <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-teal-400/80">
          CFO pessoal
        </p>
        <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold leading-[1.1] tracking-tight md:text-6xl">
          Finance OS
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted-foreground md:text-lg">
          Organize patrimônio, fluxo de caixa e projeções em um sistema pensado
          como produto SaaS — começando pelo essencial.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup">
            <Button size="lg">Criar conta</Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline">
              Já tenho conta
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
