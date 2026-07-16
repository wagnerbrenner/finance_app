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
        "relative flex min-h-svh overflow-hidden bg-[#0C1F18] text-[#E8F0EB]",
        "font-[family-name:var(--font-tche-body)]",
      )}
    >
      {/* Campo atmosphere */}
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

      <div className="relative z-10 mx-auto grid w-full max-w-6xl flex-1 lg:grid-cols-2">
        {/* Brand / mascot panel */}
        <section className="flex flex-col items-center justify-center px-6 pb-4 pt-10 text-center lg:items-start lg:px-12 lg:pb-12 lg:pt-12 lg:text-left">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2.5 self-center lg:self-start"
          >
            <img
              src="/logo.svg"
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-xl shadow-[0_0_28px_rgba(240,193,74,0.35)]"
            />
            <span className="font-[family-name:var(--font-tche-display)] text-2xl tracking-wide text-[#F0C14A]">
              {BRAND.name}
            </span>
          </Link>

          <div className="relative mb-4 w-full max-w-[280px] lg:max-w-[360px]">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-full bg-[radial-gradient(circle,rgba(240,193,74,0.22),transparent_65%)] blur-2xl"
            />
            <img
              src="/brand/gaucho-mascot.png"
              alt="Gaúcho do Tchê Organiza com dinheiro na mão"
              width={360}
              height={360}
              className="relative mx-auto w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.45)]"
            />
          </div>

          <h1 className="font-[family-name:var(--font-tche-display)] text-3xl leading-tight tracking-wide text-[#E8F0EB] md:text-4xl lg:text-5xl">
            {BRAND.tagline}
          </h1>
          <p className="mt-3 max-w-md text-base text-[#A8C4B8] md:text-lg">
            {BRAND.shortPitch}
          </p>
          <p className="mt-4 font-[family-name:var(--font-tche-display)] text-sm tracking-wider text-[#C43C3C]">
            ★ organização financeira com sotaque do Sul ★
          </p>
        </section>

        {/* Form panel */}
        <section className="flex items-center justify-center px-4 pb-12 lg:px-10 lg:py-12">
          <div className="w-full max-w-md rounded-3xl border border-[#1B7A5A]/45 bg-[#102820]/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md sm:p-8">
            <div className="mb-6">
              <p className="font-[family-name:var(--font-tche-display)] text-xs uppercase tracking-[0.2em] text-[#F0C14A]">
                {BRAND.greeting}
              </p>
              <h2 className="mt-1 font-[family-name:var(--font-tche-display)] text-2xl tracking-wide text-[#E8F0EB]">
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
