"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "Preciso saber de finanças pra usar?",
    a: "Não. Se você recebe e gasta dinheiro, já dá pra usar. O app é em português simples: lançou o gasto, o painel mostra o mês.",
  },
  {
    q: "Como funciona o mês de degustação?",
    a: "Ao criar a conta você usa o app completo por um mês, sem cartão. É pra sentir se faz sentido. Depois desse mês, para continuar é preciso assinar.",
  },
  {
    q: "Depois do mês grátis eu continuo de graça?",
    a: "Não. Não há plano gratuito eterno depois da degustação. Ou você assina o Pro, ou o acesso fica pausado até a assinatura.",
  },
  {
    q: "Posso cancelar a assinatura?",
    a: "Sim. Em Assinatura você cancela a recorrência. O acesso continua até o fim do período já pago.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. Abra pelo navegador no celular ou no computador. Não precisa baixar nada nas lojas por enquanto.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Cada conta só enxerga os próprios registros. Não vendemos dados e não colocamos anúncios no app.",
  },
] as const;

export function MarketingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-2xl divide-y divide-white/10 rounded-2xl border border-white/10 bg-[#0B1220]/80">
      {FAQS.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
            >
              <span className="font-[family-name:var(--font-display)] text-sm font-semibold text-white sm:text-base">
                {item.q}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-cyan-300 transition",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            {isOpen ? (
              <p className="px-5 pb-4 text-sm leading-relaxed text-slate-400">{item.a}</p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
