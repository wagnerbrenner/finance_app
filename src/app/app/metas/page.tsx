import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { FinancePage } from "@/features/finance/components/finance-page";
import { createGoal, deleteGoal } from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { goals } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";

export default async function GoalsPage() {
  const userId = await requireUserId(); const rows = await db.select().from(goals).where(and(eq(goals.userId, userId), isNull(goals.deletedAt))).orderBy(desc(goals.createdAt));
  return <AppShell title="Metas"><FinancePage title="Metas financeiras" description="Acompanhe o progresso e a contribuição necessária." path="/app/metas" createAction={createGoal} deleteAction={deleteGoal} fields={[{ name: "name", label: "Meta" }, { name: "targetAmount", label: "Valor alvo", type: "number", step: "0.01" }, { name: "currentAmount", label: "Já acumulado", type: "number", step: "0.01", defaultValue: "0" }, { name: "monthlyContribution", label: "Aporte mensal", type: "number", step: "0.01", defaultValue: "0" }, { name: "deadline", label: "Prazo", type: "date", required: false }]} rows={rows.map((row) => { const target = toNumber(row.targetAmount), current = toNumber(row.currentAmount), monthly = toNumber(row.monthlyContribution), remaining = Math.max(0, target - current), months = monthly ? Math.ceil(remaining / monthly) : 0; return { id: row.id, title: row.name, detail: `${Math.min(100, (current / target) * 100).toFixed(0)}% concluída · faltam ${formatBRL(remaining)}${months ? ` · ${months} meses` : " · defina um aporte"}`, amount: formatBRL(target) }; })} /></AppShell>;
}
