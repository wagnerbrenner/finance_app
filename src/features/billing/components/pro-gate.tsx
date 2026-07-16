import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BILLING } from "@/shared/lib/billing";

type ProGateProps = {
  title?: string;
  children?: React.ReactNode;
};

/** Soft-gate overlay (rarely shown — expired users are redirected to Assinatura). */
export function ProGate({
  title = "Assine o Te Organiza Pro",
  children,
}: ProGateProps) {
  return (
    <div className="relative min-h-[320px]">
      <div className="pointer-events-none select-none blur-[2px] opacity-40" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="max-w-md rounded-2xl border border-amber-500/40 bg-[#0B1220]/95 p-6 text-center shadow-xl">
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-white">
            {title}
          </p>
          <p className="mt-2 text-sm text-slate-400">
            Seu {BILLING.trialLabelLong} de degustação terminou. Para continuar usando o app, assine
            o Pro ({BILLING.monthly.display}).
          </p>
          <Link href="/app/assinatura" className="mt-5 inline-block">
            <Button className="bg-amber-500 text-slate-950 hover:bg-amber-400">
              Ir para assinatura
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
