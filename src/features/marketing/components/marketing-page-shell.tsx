import Link from "next/link";
import { BrandLogo } from "@/shared/components/brand-media";
import { BRAND } from "@/shared/lib/brand";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/sobre", label: "Sobre" },
  { href: "/novidades", label: "Novidades" },
  { href: "/#precos", label: "Preços" },
] as const;

const FOOTER = [
  { href: "/sobre", label: "Sobre" },
  { href: "/novidades", label: "Novidades" },
  { href: "/termos", label: "Termos" },
  { href: "/privacidade", label: "Privacidade" },
  { href: "/signup", label: "Criar conta" },
  { href: "/login", label: "Entrar" },
] as const;

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/5 bg-[#070B14]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3.5 md:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-cyan-300"
        >
          <BrandLogo size={28} priority className="size-7" />
          {BRAND.name}
        </Link>
        <nav className="hidden items-center gap-5 text-sm text-slate-400 md:flex">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-cyan-300">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-200 hover:bg-cyan-500/10 hover:text-white">
              Entrar
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-cyan-500 text-slate-950 hover:bg-cyan-400">Mês grátis</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-white/5 py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-xs text-slate-500 md:flex-row md:px-8">
        <p>
          {BRAND.name} · {new Date().getFullYear()}
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          {FOOTER.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-cyan-300">
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}

export function MarketingPageShell({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) {
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
      <main className="relative z-10 mx-auto max-w-3xl px-5 py-12 md:px-8 md:py-16">
        {title ? (
          <h1 className="mb-8 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-white md:text-4xl">
            {title}
          </h1>
        ) : null}
        {children}
      </main>
      <MarketingFooter />
    </div>
  );
}
