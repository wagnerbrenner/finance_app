import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { CreateEntityDialog } from "@/shared/components/create-entity-dialog";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import { FormField } from "@/shared/components/form-field";
import { FormSelect } from "@/shared/components/form-select";
import { createAccount, deleteAccount } from "@/features/finance/actions";
import { requireUserId } from "@/server/auth";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { getAccountBalances } from "@/server/services/recurring-bills.service";
import { formatBRL } from "@/shared/lib/formatters";
import { ACCOUNT_TYPE_LABELS } from "@/shared/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AccountsPage() {
  const userId = await requireUserId();
  await db.execute(sql`select public.seed_default_categories(${userId})`);

  const [rows, balances] = await Promise.all([
    db
      .select()
      .from(accounts)
      .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt)))
      .orderBy(desc(accounts.createdAt)),
    getAccountBalances(userId),
  ]);

  const balanceByAccount = new Map(balances.map((b) => [b.id, b.balance]));

  const typeLabel = ACCOUNT_TYPE_LABELS;

  return (
    <AppShell title="Contas">
      <div className="space-y-6">
        <PageHeader title="Contas">
          <CreateEntityDialog
            title="Nova conta"
            triggerLabel="Nova conta"
            path="/app/contas"
            action={createAccount}
            successMessage="Conta criada."
          >
            <FormField name="name" label="Nome" required className="sm:col-span-2" />
            <FormField name="institution" label="Instituição" />
            <FormSelect
              name="type"
              label="Tipo"
              required
              defaultValue="checking"
              options={[
                { value: "checking", label: "Conta corrente" },
                { value: "savings", label: "Poupança" },
                { value: "cash", label: "Dinheiro" },
                { value: "investment", label: "Investimento" },
                { value: "other", label: "Outra" },
              ]}
            />
            <FormField
              name="amount"
              label="Saldo inicial"
              type="number"
              step="0.01"
              defaultValue="0"
              required
            />
          </CreateEntityDialog>
        </PageHeader>

        <Card>
          <CardContent className="pt-6">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Conta</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell>
                        <div className="font-medium">{row.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.institution ?? "Sem instituição"}
                        </div>
                      </TableCell>
                      <TableCell>{typeLabel[row.type] ?? row.type}</TableCell>
                      <TableCell>
                        <Badge variant={row.isActive ? "default" : "secondary"}>
                          {row.isActive ? "Ativa" : "Inativa"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatBRL(balanceByAccount.get(row.id) ?? 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <ConfirmDeleteButton
                          id={row.id}
                          path="/app/contas"
                          action={deleteAccount}
                          label="conta"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
