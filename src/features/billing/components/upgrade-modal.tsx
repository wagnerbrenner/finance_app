"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BILLING } from "@/shared/lib/billing";

const STORAGE_KEY = "teorganiza.paywall.dismissed_day";

function subscribe(onStoreChange: () => void) {
  window.addEventListener("storage", onStoreChange);
  return () => window.removeEventListener("storage", onStoreChange);
}

function getDismissedDay() {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

type UpgradeModalProps = {
  open: boolean;
};

export function UpgradeModal({ open }: UpgradeModalProps) {
  const dismissedDay = useSyncExternalStore(subscribe, getDismissedDay, () => null);
  const today = new Date().toISOString().slice(0, 10);
  const visible = open && dismissedDay !== today;

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, today);
      window.dispatchEvent(new Event("storage"));
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 p-4 sm:items-center">
      <div
        role="dialog"
        aria-labelledby="upgrade-title"
        className="relative w-full max-w-md rounded-2xl border border-cyan-500/30 bg-[#0B1220] p-6 shadow-2xl"
      >
        <button
          type="button"
          onClick={dismiss}
          className="absolute right-3 top-3 rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          aria-label="Fechar"
        >
          <X className="size-4" />
        </button>
        <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
          Mês de degustação encerrado
        </p>
        <h2
          id="upgrade-title"
          className="mt-2 font-[family-name:var(--font-display)] text-xl font-semibold text-white"
        >
          Para continuar, assine o Pro
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-400">
          Você já usou o primeiro mês completo. Depois disso o Te Organiza é por assinatura — sem
          plano gratuito paralelo.
        </p>
        <ul className="mt-4 space-y-1.5 text-sm text-slate-300">
          <li>· {BILLING.monthly.display}</li>
          <li>
            · {BILLING.annual.display} ({BILLING.annual.monthlyEquivalent} —{" "}
            {BILLING.annual.discountNote})
          </li>
          <li>· Cancele a recorrência quando quiser</li>
        </ul>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Link href="/app/assinatura" className="flex-1" onClick={dismiss}>
            <Button className="w-full bg-amber-500 text-slate-950 hover:bg-amber-400">
              Assinar agora
            </Button>
          </Link>
          <Button
            variant="outline"
            className="flex-1 border-white/15 bg-transparent"
            onClick={dismiss}
          >
            Agora não
          </Button>
        </div>
      </div>
    </div>
  );
}
