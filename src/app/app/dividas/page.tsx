import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import {
  createDebt,
  deleteDebt,
  updateDebt,
} from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { accounts, debts } from "@/server/db/schema";
import { formatBRL, formatDate } from "@/shared/lib/formatters";
import { PageHeader } from "@/shared/components/page-header";
import { CreateEntityDialog } from "@/shared/components/create-entity-dialog";
import { EditEntityDialog } from "@/shared/components/edit-entity-dialog";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import { FormField } from "@/shared/components/form-field";
import { FormSelect } from "@/shared/components/form-select";
import { AmortizationSimulator } from "@/features/debts/components/amortization-simulator";
import { PayDebtButton } from "@/features/debts/components/pay-debt-button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const debtFields = (row?: {
  name?: string;
  creditor?: string | null;
  type?: string;
  balance?: string;
  originalAmount?: string;
  interestRate?: string;
  installmentAmount?: string | null;
  dueDate?: string | null;
  priority?: string;
}) => (
  <>
    <FormField name="name" label="Dívida" required className="sm:col-span-2" defaultValue={row?.name} />
    <FormField name="creditor" label="Credor" defaultValue={row?.creditor ?? undefined} />
    <FormSelect
      name="type"
      label="Tipo"
      defaultValue={row?.type ?? "other"}
      required
      options={[
        { value: "loan", label: "Empréstimo" },
        { value: "financing", label: "Financiamento" },
        { value: "credit_card", label: "Cartão de crédito" },
        { value: "other", label: "Outra" },
      ]}
    />
    <FormField
      name="balance"
      label="Saldo atual"
      type="number"
      min="0.01"
      step="0.01"
      required
      defaultValue={row?.balance ? String(toNumber(row.balance)) : undefined}
    />
    <FormField
      name="originalAmount"
      label="Valor original"
      type="number"
      min="0"
      step="0.01"
      required
      defaultValue={row?.originalAmount ? String(toNumber(row.originalAmount)) : undefined}
    />
    <FormField
      name="interestRate"
      label="Juros ao mês (%)"
      type="number"
      min="0"
      step="0.01"
      defaultValue={row?.interestRate != null ? String(toNumber(row.interestRate)) : "0"}
    />
    <FormField
      name="installmentAmount"
      label="Parcela mensal"
      type="number"
      min="0"
      step="0.01"
      defaultValue={row?.installmentAmount ? String(toNumber(row.installmentAmount)) : undefined}
    />
    <FormField name="dueDate" label="Próximo vencimento" type="date" defaultValue={row?.dueDate ?? undefined} />
    <FormSelect
      name="priority"
      label="Prioridade"
      defaultValue={row?.priority ?? "medium"}
      required
      options={[
        { value: "high", label: "Alta" },
        { value: "medium", label: "Média" },
        { value: "low", label: "Baixa" },
      ]}
    />
  </>
);

export default async function DebtsPage() {
  const userId = await requireUserId();
  const [rows, accountRows] = await Promise.all([
    db
      .select()
      .from(debts)
      .where(and(eq(debts.userId, userId), isNull(debts.deletedAt)))
      .orderBy(desc(debts.createdAt)),
    db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt))),
  ]);

  return (
    <AppShell title="Dívidas">
      <div className="space-y-6">
        <PageHeader title="Dívidas">
          <CreateEntityDialog
            title="Nova dívida"
            triggerLabel="Nova dívida"
            path="/app/dividas"
            action={createDebt}
            successMessage="Dívida criada."
          >
            {debtFields()}
          </CreateEntityDialog>
        </PageHeader>
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardContent className="pt-6">
              {rows.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Dívida</TableHead>
                      <TableHead>Prioridade</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Saldo</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => {
                      const installment = toNumber(row.installmentAmount);
                      return (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="font-medium">{row.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {row.creditor ?? "Sem credor"} · {toNumber(row.interestRate)}% a.m.
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                row.priority === "high"
                                  ? "destructive"
                                  : row.priority === "low"
                                    ? "outline"
                                    : "secondary"
                              }
                            >
                              {row.priority === "high"
                                ? "Alta"
                                : row.priority === "low"
                                  ? "Baixa"
                                  : "Média"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {row.dueDate ? (
                              <Badge variant="outline">{formatDate(row.dueDate)}</Badge>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatBRL(toNumber(row.balance))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center justify-end gap-0.5">
                              <PayDebtButton
                                debtId={row.id}
                                debtName={row.name}
                                defaultAmount={installment > 0 ? installment : toNumber(row.balance)}
                                accounts={accountRows}
                              />
                              <EditEntityDialog
                                title="Editar dívida"
                                path="/app/dividas"
                                action={updateDebt}
                                id={row.id}
                              >
                                {debtFields(row)}
                              </EditEntityDialog>
                              <ConfirmDeleteButton
                                id={row.id}
                                path="/app/dividas"
                                action={deleteDebt}
                                label="dívida"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma dívida cadastrada.</p>
              )}
            </CardContent>
          </Card>
          <AmortizationSimulator
            debts={rows.map((row) => ({
              id: row.id,
              name: row.name,
              balance: toNumber(row.balance),
              interestRate: toNumber(row.interestRate),
            }))}
          />
        </div>
      </div>
    </AppShell>
  );
}
