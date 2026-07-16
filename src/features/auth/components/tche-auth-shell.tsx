import Link from "next/link";
import { Rowdies, Nunito } from "next/font/google";
import { BRAND } from "@/shared/lib/brand";
import { cn } from "@/lib/utils";

const rowdies = Rowdies({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-tche-display",
});

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-tche-body",
});

export function TcheAuthShell({
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
        rowdies.variable,
        nunito.variable,
        "relative flex h-svh max-h-svh overflow-hidden bg-[#0C1F18] text-[#E8F0EB]",
        "font-[family-name:var(--font-tche-body)]",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 90% 70% at 15% 20%, rgba(27,122,90,0.45), transparent 55%),
            radial-gradient(ellipse 60% 50% at 85% 80%, rgba(196,60,60,0.18), transparent 50%),
            radial-gradient(ellipse 40% 30% at 70% 10%, rgba(240,193,74,0.12), transparent 45%),
            linear-gradient(165deg, #0C1F18 0%, #102820 40%, #0A1812 100%)
          `,
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E8F0EB' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative z-10 mx-auto grid h-full w-full max-w-6xl lg:grid-cols-2">
        {/* Brand / mascot — compact to fit one viewport */}
        <section className="flex min-h-0 flex-col items-center justify-center gap-2 px-5 py-4 text-center lg:items-start lg:gap-3 lg:px-10 lg:py-6 lg:text-left">
          <Link
            href="/"
            className="inline-flex shrink-0 items-center gap-2 self-center lg:self-start"
          >
            <img
              src="/logo.svg"
              alt=""
              width={36}
              height={36}
              className="size-9 rounded-xl shadow-[0_0_28px_rgba(240,193,74,0.35)]"
            />
            <span className="font-[family-name:var(--font-tche-display)] text-xl tracking-wide text-[#F0C14A] lg:text-2xl">
              {BRAND.name}
            </span>
          </Link>

          <div className="relative flex min-h-0 w-full max-w-[200px] flex-1 items-center justify-center sm:max-w-[240px] lg:max-w-[280px]">
            <div
              aria-hidden
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(240,193,74,0.18),transparent_65%)] blur-2xl"
            />
            <img
              src="/brand/gaucho-mascot.png"
              alt="Gaúcho do Tchê Organiza com dinheiro na mão"
              width={280}
              height={280}
              className="relative max-h-[min(42svh,280px)] w-auto object-contain drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)]"
            />
          </div>

          <div className="shrink-0">
            <h1 className="font-[family-name:var(--font-tche-display)] text-2xl leading-tight tracking-wide text-[#E8F0EB] lg:text-4xl">
              {BRAND.tagline}
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-[#A8C4B8] lg:text-base">
              {BRAND.shortPitch}
            </p>
            <p className="mt-2 hidden font-[family-name:var(--font-tche-display)] text-xs tracking-wider text-[#C43C3C] sm:block">
              ★ organização financeira com sotaque do Sul ★
            </p>
          </div>
        </section>

        {/* Form */}
        <section className="flex min-h-0 items-center justify-center overflow-y-auto px-4 py-4 lg:px-8 lg:py-6">
          <div className="w-full max-w-md rounded-3xl border border-[#1B7A5A]/45 bg-[#102820]/90 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-7">
            <div className="mb-4">
              <p className="font-[family-name:var(--font-tche-display)] text-xs uppercase tracking-[0.2em] text-[#F0C14A]">
                {BRAND.greeting}
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-tche-display)] text-xl tracking-wide text-[#E8F0EB] sm:text-2xl">
                {title}
              </h2>
              <p className="mt-1 text-sm text-[#A8C4B8]">{subtitle}</p>
            </div>
            <div className="tche-auth-form">{children}</div>
          </div>
        </section>
      </div>
    </div>
  );
}
