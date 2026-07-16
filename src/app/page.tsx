import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/shared/lib/brand";

export default function HomePage() {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_-10%,_rgba(45,212,191,0.22),_transparent_55%),radial-gradient(ellipse_50%_40%_at_90%_80%,_rgba(20,184,166,0.08),_transparent),linear-gradient(160deg,_oklch(0.14_0.02_175)_0%,_oklch(0.12_0.005_260)_45%,_oklch(0.11_0.01_200)_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="flex items-center gap-2.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          <img
            src="/logo.svg"
            alt=""
            width={28}
            height={28}
            className="size-7 rounded-md shadow-[0_0_24px_rgba(45,212,191,0.35)]"
          />
          {BRAND.name}
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
        <h1 className="font-[family-name:var(--font-display)] text-5xl font-semibold leading-[0.95] tracking-tight md:text-7xl">
          {BRAND.name}
        </h1>
        <p className="mt-5 max-w-lg text-lg text-muted-foreground md:text-xl">
          {BRAND.tagline}. {BRAND.shortPitch}
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <Link href="/signup">
            <Button size="lg">Criar conta grátis</Button>
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
