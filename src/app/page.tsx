import Link from "next/link";
import { Rowdies, Nunito } from "next/font/google";
import { Button } from "@/components/ui/button";
import { BRAND } from "@/shared/lib/brand";

const rowdies = Rowdies({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-tche-display",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-tche-body",
});

export default function HomePage() {
  return (
    <div
      className={`${rowdies.variable} ${nunito.variable} relative flex min-h-svh flex-col overflow-hidden bg-[#0C1F18] font-[family-name:var(--font-tche-body)] text-[#E8F0EB]`}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -10%, rgba(27,122,90,0.4), transparent 55%),
            radial-gradient(ellipse 50% 40% at 90% 70%, rgba(240,193,74,0.12), transparent 50%),
            linear-gradient(180deg, #0C1F18, #0A1812)
          `,
        }}
      />
      <header className="relative z-10 flex items-center justify-between px-6 py-5 md:px-10">
        <span className="flex items-center gap-2.5 font-[family-name:var(--font-tche-display)] text-xl tracking-wide text-[#F0C14A]">
          <img src="/logo.svg" alt="" width={28} height={28} className="size-7 rounded-md" />
          {BRAND.name}
        </span>
        <div className="flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" className="text-[#E8F0EB] hover:bg-[#1B7A5A]/30 hover:text-white">
              Entrar
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-[#1B7A5A] text-[#E8F0EB] hover:bg-[#23966D]">Começar</Button>
          </Link>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center gap-8 px-6 pb-20 pt-6 md:flex-row md:items-center md:gap-12 md:px-10">
        <div className="max-w-lg text-center md:text-left">
          <h1 className="font-[family-name:var(--font-tche-display)] text-5xl leading-[0.95] tracking-wide text-[#E8F0EB] md:text-7xl">
            {BRAND.name}
          </h1>
          <p className="mt-4 text-xl text-[#F0C14A] md:text-2xl">{BRAND.tagline}</p>
          <p className="mt-4 text-base text-[#A8C4B8] md:text-lg">{BRAND.shortPitch}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link href="/signup">
              <Button size="lg" className="bg-[#C43C3C] text-white hover:bg-[#d64a4a]">
                Criar conta grátis
              </Button>
            </Link>
            <Link href="/login">
              <Button
                size="lg"
                variant="outline"
                className="border-[#1B7A5A] bg-transparent text-[#E8F0EB] hover:bg-[#1B7A5A]/25"
              >
                Já tenho conta
              </Button>
            </Link>
          </div>
        </div>
        <img
          src="/brand/gaucho-mascot.png"
          alt="Gaúcho do Tchê Organiza"
          width={380}
          height={380}
          className="w-56 drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)] sm:w-72 md:w-[380px]"
        />
      </main>
    </div>
  );
}
