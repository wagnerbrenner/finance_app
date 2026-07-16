import Link from "next/link";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import { BRAND } from "@/shared/lib/brand";
import { cn } from "@/lib/utils";

const space = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-te-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-te-mono",
});

export function BrandAuthShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div
      className={cn(
        space.variable,
        mono.variable,
        "relative flex h-svh max-h-svh overflow-hidden bg-[#070B14] text-[#E8EEF7]",
        "font-[family-name:var(--font-te-display)]",
      )}
    >
      {/* Clean nerd atmosphere */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 55% at 20% 30%, rgba(34,211,238,0.14), transparent 55%),
            radial-gradient(ellipse 50% 40% at 85% 70%, rgba(245,158,11,0.08), transparent 50%),
            linear-gradient(160deg, #070B14 0%, #0B1220 45%, #080D18 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(103,232,249,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(103,232,249,0.15) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-8 top-24 hidden font-[family-name:var(--font-te-mono)] text-[11px] leading-5 text-cyan-400/25 lg:block"
      >
        {"const saldo = 'organizado';"}
        <br />
        {"if (voce) organiza();"}
      </div>

      <div className="relative z-10 mx-auto grid h-full w-full max-w-5xl lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-6 lg:px-8">
        <section className="flex min-h-0 flex-col items-center justify-center gap-3 px-5 py-3 text-center lg:items-start lg:py-0 lg:text-left">
          <Link href="/" className="inline-flex shrink-0 items-center gap-2.5 self-center lg:self-start">
            <img
              src="/logo.svg"
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-lg shadow-[0_0_24px_rgba(34,211,238,0.35)]"
            />
            <span className="text-lg font-semibold tracking-tight text-cyan-300 lg:text-xl">
              {BRAND.name}
            </span>
          </Link>

          <div className="relative shrink-0">
            <div
              aria-hidden
              className="absolute left-1/2 top-1/2 size-44 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(34,211,238,0.22),transparent_70%)] blur-2xl lg:size-52"
            />
            <img
              src="/brand/nerd-mascot.png"
              alt="Mascote do Te Organiza apontando para você"
              width={240}
              height={300}
              className="relative mx-auto h-[min(36svh,240px)] w-auto object-contain drop-shadow-[0_16px_40px_rgba(0,0,0,0.55)] lg:h-[min(40svh,280px)]"
            />
          </div>

          <div className="shrink-0 max-w-sm">
            <h1 className="text-2xl font-semibold leading-tight tracking-tight text-white lg:text-3xl">
              {BRAND.tagline}
            </h1>
            <p className="mt-2 text-sm leading-snug text-slate-400 lg:text-[15px]">
              {BRAND.shortPitch}
            </p>
            <p className="mt-2 font-[family-name:var(--font-te-mono)] text-[11px] tracking-wide text-amber-400/90">
              {"// você + clareza = bolso em ordem"}
            </p>
          </div>
        </section>

        <section className="flex min-h-0 items-center justify-center px-4 py-3 lg:px-2 lg:py-0">
          <div className="w-full max-w-[400px] rounded-2xl border border-cyan-500/20 bg-[#0B1220]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.5)] backdrop-blur-md sm:p-7">
            <div className="mb-4">
              <p className="font-[family-name:var(--font-te-mono)] text-[11px] uppercase tracking-[0.18em] text-cyan-400">
                {BRAND.greeting}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {title}
              </h2>
              <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
            </div>
            <div className="te-auth-form">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}

/** @deprecated use BrandAuthShell */
export const TcheAuthShell = BrandAuthShell;
