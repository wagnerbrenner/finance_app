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
    q: "É grátis mesmo?",
    a: "Sim. O essencial está liberado: lançamentos, contas, recorrentes, dívidas, metas e o painel. O plano Pro (quando a cobrança existir) adiciona camadas extras — veja a seção de preços.",
  },
  {
    q: "Funciona no celular?",
    a: "Sim. Abra pelo navegador no celular ou no computador. Não precisa baixar nada nas lojas por enquanto.",
  },
  {
    q: "Vocês conectam no meu banco?",
    a: "Ainda não. Por enquanto você registra na mão — rápido e sob o seu controle. Integração com banco fica para uma etapa futura; nunca pedimos senha do banco.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Cada conta só enxerga os próprios registros. Não vendemos dados e não colocamos anúncios no app.",
  },
  {
    q: "Já posso assinar o Pro?",
    a: "Ainda não. Crie a conta e use normalmente. Quando a assinatura abrir, será pela página de preços.",
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
