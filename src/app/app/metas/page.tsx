import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { createGoal, deleteGoal } from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { goals } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";
import { PageHeader } from "@/shared/components/page-header";
import { CreateEntityDialog } from "@/shared/components/create-entity-dialog";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import { FormField } from "@/shared/components/form-field";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default async function GoalsPage() {
  const userId = await requireUserId();
  const rows = await db.select().from(goals).where(and(eq(goals.userId, userId), isNull(goals.deletedAt))).orderBy(desc(goals.createdAt));
  return <AppShell title="Metas"><div className="space-y-6">
    <PageHeader title="Metas financeiras" description="Acompanhe o progresso e a contribuição necessária.">
      <CreateEntityDialog title="Nova meta" triggerLabel="Nova meta" path="/app/metas" action={createGoal} successMessage="Meta criada.">
        <FormField name="name" label="Meta" required className="sm:col-span-2" /><FormField name="targetAmount" label="Valor alvo" type="number" min="0.01" step="0.01" required /><FormField name="currentAmount" label="Já acumulado" type="number" min="0" step="0.01" defaultValue="0" required /><FormField name="monthlyContribution" label="Aporte mensal" type="number" min="0" step="0.01" defaultValue="0" required /><FormField name="deadline" label="Prazo" type="date" />
      </CreateEntityDialog>
    </PageHeader>
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{rows.map((row) => { const target = toNumber(row.targetAmount); const current = toNumber(row.currentAmount); const monthly = toNumber(row.monthlyContribution); const remaining = Math.max(0, target - current); const percent = target ? Math.min(100, (current / target) * 100) : 0; const months = monthly ? Math.ceil(remaining / monthly) : null; return <Card key={row.id}><CardHeader><CardTitle className="flex items-center justify-between gap-2"><span>{row.name}</span><ConfirmDeleteButton id={row.id} path="/app/metas" action={deleteGoal} label="meta" /></CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between text-sm"><span className="font-medium">Progresso</span><span className="text-muted-foreground">{percent.toFixed(0)}%</span></div><Progress value={percent} /><div className="grid grid-cols-2 gap-3 text-sm"><div><p className="text-muted-foreground">Acumulado</p><p className="font-medium">{formatBRL(current)}</p></div><div><p className="text-muted-foreground">Falta</p><p className="font-medium">{formatBRL(remaining)}</p></div><div><p className="text-muted-foreground">Aporte mensal</p><p className="font-medium">{formatBRL(monthly)}</p></div><div><p className="text-muted-foreground">Estimativa</p><p className="font-medium">{months === null ? "Defina aporte" : months === 0 ? "Concluída" : `${months} meses`}</p></div></div></CardContent></Card>})}</div>
    {rows.length === 0 ? <Card><CardContent className="pt-6 text-sm text-muted-foreground">Nenhuma meta cadastrada.</CardContent></Card> : null}
  </div></AppShell>;
}
