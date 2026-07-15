import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import {
  createGoal,
  deleteGoal,
  updateGoal,
} from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { accounts, goals } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";
import { PageHeader } from "@/shared/components/page-header";
import { CreateEntityDialog } from "@/shared/components/create-entity-dialog";
import { EditEntityDialog } from "@/shared/components/edit-entity-dialog";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import { FormField } from "@/shared/components/form-field";
import { ContributeGoalButton } from "@/features/goals/components/contribute-goal-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function goalFields(row?: {
  name?: string;
  targetAmount?: string;
  currentAmount?: string;
  monthlyContribution?: string;
  deadline?: string | null;
}) {
  return (
    <>
      <FormField
        name="name"
        label="Meta"
        required
        className="sm:col-span-2"
        defaultValue={row?.name}
      />
      <FormField
        name="targetAmount"
        label="Valor alvo"
        type="number"
        min="0.01"
        step="0.01"
        required
        defaultValue={row?.targetAmount ? String(toNumber(row.targetAmount)) : undefined}
      />
      <FormField
        name="currentAmount"
        label="Já acumulado"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.currentAmount != null ? String(toNumber(row.currentAmount)) : "0"}
        required
      />
      <FormField
        name="monthlyContribution"
        label="Aporte mensal"
        type="number"
        min="0"
        step="0.01"
        defaultValue={
          row?.monthlyContribution != null ? String(toNumber(row.monthlyContribution)) : "0"
        }
        required
      />
      <FormField
        name="deadline"
        label="Prazo"
        type="date"
        defaultValue={row?.deadline ?? undefined}
      />
    </>
  );
}

export default async function GoalsPage() {
  const userId = await requireUserId();
  const [rows, accountRows] = await Promise.all([
    db
      .select()
      .from(goals)
      .where(and(eq(goals.userId, userId), isNull(goals.deletedAt)))
      .orderBy(desc(goals.createdAt)),
    db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt))),
  ]);

  return (
    <AppShell title="Metas">
      <div className="space-y-6">
        <PageHeader title="Metas">
          <CreateEntityDialog
            title="Nova meta"
            triggerLabel="Nova meta"
            path="/app/metas"
            action={createGoal}
            successMessage="Meta criada."
          >
            {goalFields()}
          </CreateEntityDialog>
        </PageHeader>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((row) => {
            const target = toNumber(row.targetAmount);
            const current = toNumber(row.currentAmount);
            const monthly = toNumber(row.monthlyContribution);
            const remaining = Math.max(0, target - current);
            const percent = target ? Math.min(100, (current / target) * 100) : 0;
            const months = monthly ? Math.ceil(remaining / monthly) : null;
            return (
              <Card key={row.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span className="min-w-0 truncate">{row.name}</span>
                    <span className="inline-flex shrink-0 items-center gap-0.5">
                      <ContributeGoalButton
                        goalId={row.id}
                        goalName={row.name}
                        accounts={accountRows}
                      />
                      <EditEntityDialog
                        title="Editar meta"
                        path="/app/metas"
                        action={updateGoal}
                        id={row.id}
                      >
                        {goalFields(row)}
                      </EditEntityDialog>
                      <ConfirmDeleteButton
                        id={row.id}
                        path="/app/metas"
                        action={deleteGoal}
                        label="meta"
                      />
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">Progresso</span>
                    <span className="text-muted-foreground">{percent.toFixed(0)}%</span>
                  </div>
                  <Progress value={percent} />
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Acumulado</p>
                      <p className="font-medium">{formatBRL(current)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Falta</p>
                      <p className="font-medium">{formatBRL(remaining)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Aporte mensal</p>
                      <p className="font-medium">{formatBRL(monthly)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Estimativa</p>
                      <p className="font-medium">
                        {months === null
                          ? "Defina aporte"
                          : months === 0
                            ? "Concluída"
                            : `${months} meses`}
                      </p>
                    </div>
                  </div>
                  <ContributeGoalButton
                    goalId={row.id}
                    goalName={row.name}
                    accounts={accountRows}
                    triggerLabel="Registrar aporte"
                  />
                </CardContent>
              </Card>
            );
          })}
        </div>
        {rows.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-sm text-muted-foreground">
              Nenhuma meta cadastrada.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
