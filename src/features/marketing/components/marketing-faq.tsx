"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    q: "O Te Organiza é grátis?",
    a: "Sim. O plano Grátis cobre transações, categorias, importação de extrato, recorrentes, metas e o painel com gráficos. O Pro (quando a cobrança estiver ativa) adiciona investimentos avançados, patrimônio e lembretes — veja a seção de preços.",
  },
  {
    q: "Preciso instalar algo?",
    a: "Não. É um app web: funciona no celular e no computador pelo navegador.",
  },
  {
    q: "Como importo o extrato do Nubank?",
    a: "Exporte o CSV no app do banco, abra Importar no Te Organiza, escolha a conta destino, revise o preview e confirme.",
  },
  {
    q: "Meus dados ficam seguros?",
    a: "Cada registro é isolado por usuário no banco (Row Level Security). Não vendemos dados e não colocamos anúncios no app.",
  },
  {
    q: "Já posso pagar o Pro?",
    a: "Ainda não. A assinatura com Mercado Pago está no nosso plano de produto; por enquanto use o app normalmente. Quando abrir, você assina na página de preços.",
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
