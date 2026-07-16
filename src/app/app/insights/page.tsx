import Link from "next/link";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { ProGate } from "@/features/billing/components/pro-gate";
import { requireUserId } from "@/server/auth";
import { getEntitlements, hasProAccess } from "@/server/services/entitlements.service";
import { getUserInsights } from "@/server/services/insights.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default async function InsightsPage() {
  const userId = await requireUserId();
  const ent = await getEntitlements(userId);
  const pro = hasProAccess(ent);

  const insights = pro ? await getUserInsights(userId) : [];

  const placeholder = (
    <div className="grid gap-3 md:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <CardTitle className="text-base">Insight de exemplo {i}</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Com o Pro, aqui aparecem alertas e sugestões com base nos seus lançamentos.
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <AppShell title="Insights">
      <PageHeader
        title="Insights"
        description="Leituras simples a partir do que você lança — sem enrolação."
      />
      {!pro ? (
        <ProGate title="Insights fazem parte do Pro">{placeholder}</ProGate>
      ) : insights.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Lance algumas receitas e despesas neste mês para gerar Insights.
        </p>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {insights.map((item) => (
            <Card
              key={item.title}
              className={cn(
                item.tone === "warning" && "border-amber-500/30",
                item.tone === "positive" && "border-emerald-500/30",
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>{item.description}</p>
                {item.href ? (
                  <Link href={item.href} className="text-cyan-400 hover:underline">
                    Abrir área relacionada
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
