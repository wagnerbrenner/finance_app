export function MarketingDemo() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0B1220]/95 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-[family-name:var(--font-mono)] text-[10px] text-slate-500">
          teorganiza.app/dashboard
        </span>
        <span className="rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-950">
          + Lançar gasto
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Receitas do mês", value: "R$ 8.780", color: "text-emerald-400" },
          { label: "Despesas do mês", value: "R$ 4.706", color: "text-rose-400" },
          { label: "Saldo do mês", value: "R$ 4.074", color: "text-emerald-400" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-white/10 bg-black/30 p-2.5">
            <p className="text-[9px] leading-tight text-slate-500">{k.label}</p>
            <p className={`mt-1 text-xs font-semibold tabular-nums sm:text-sm ${k.color}`}>
              {k.value}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-[10px] font-medium text-slate-300">Fluxo de caixa</p>
          <div className="mt-3 flex h-16 items-end gap-1">
            {[40, 65, 35, 80, 55, 70].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-amber-500/80"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <p className="text-[10px] font-medium text-slate-300">Por categoria</p>
          <ul className="mt-2 space-y-1.5 text-[10px] text-slate-400">
            <li className="flex justify-between gap-1">
              <span>
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-sky-400" />
                Moradia
              </span>
              <span>39%</span>
            </li>
            <li className="flex justify-between gap-1">
              <span>
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-orange-400" />
                Alimentação
              </span>
              <span>21%</span>
            </li>
            <li className="flex justify-between gap-1">
              <span>
                <span className="mr-1.5 inline-block size-1.5 rounded-full bg-violet-400" />
                Transporte
              </span>
              <span>13%</span>
            </li>
          </ul>
        </div>
      </div>
      <p className="mt-3 text-center text-[9px] text-slate-600">
        Demo com dados fictícios — no app, seus números reais.
      </p>
    </div>
  );
}
