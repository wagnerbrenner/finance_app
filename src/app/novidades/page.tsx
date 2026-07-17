import type { Metadata } from "next";
import { MarketingPageShell } from "@/features/marketing/components/marketing-page-shell";
import { NOVIDADES } from "@/features/marketing/content/novidades";
import { BRAND } from "@/shared/lib/brand";
import { formatDate } from "@/shared/lib/formatters";

export const metadata: Metadata = {
  title: "Novidades",
  description: `O que há de novo no ${BRAND.name}.`,
};

export default function NovidadesPage() {
  return (
    <MarketingPageShell title="Novidades">
      <p className="mb-8 text-sm text-slate-400">
        Changelog do produto — o que lançamos e melhoramos.
      </p>
      <ol className="space-y-8">
        {NOVIDADES.map((item) => (
          <li key={`${item.date}-${item.title}`} className="border-l-2 border-cyan-500/40 pl-4">
            <p className="font-[family-name:var(--font-mono)] text-xs text-amber-400">
              {formatDate(item.date)}
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.body}</p>
          </li>
        ))}
      </ol>
    </MarketingPageShell>
  );
}
