import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import { EditEntityDialog } from "@/shared/components/edit-entity-dialog";
import { FormField } from "@/shared/components/form-field";
import { FormSelect } from "@/shared/components/form-select";
import { deleteTransaction, updateTransaction } from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { accounts, categories, transactions } from "@/server/db/schema";
import { formatBRL, formatDate } from "@/shared/lib/formatters";
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

function transactionEditFields(
  row: {
    description: string;
    amount: string;
    date: string;
    type: string;
    status: string;
    accountId: string | null;
    categoryId: string | null;
    notes: string | null;
  },
  accountOptions: { value: string; label: string }[],
  categoryOptions: { value: string; label: string }[],
) {
  return (
    <>
      <FormField name="description" label="Descrição" required className="sm:col-span-2" defaultValue={row.description} />
      <FormField
        name="amount"
        label="Valor"
        type="number"
        min="0.01"
        step="0.01"
        required
        defaultValue={String(toNumber(row.amount))}
      />
      <FormField name="date" label="Data" type="date" required defaultValue={row.date} />
      <FormSelect
        name="type"
        label="Tipo"
        required
        defaultValue={row.type}
        options={[
          { value: "income", label: "Receita" },
          { value: "expense", label: "Despesa" },
        ]}
      />
      <FormSelect
        name="status"
        label="Situação"
        required
        defaultValue={row.status || "cleared"}
        options={[
          { value: "cleared", label: "Confirmado" },
          { value: "pending", label: "Pendente" },
        ]}
      />
      <FormSelect
        name="accountId"
        label="Conta"
        defaultValue={row.accountId ?? undefined}
        options={accountOptions}
      />
      <FormSelect
        name="categoryId"
        label="Categoria"
        defaultValue={row.categoryId ?? undefined}
        options={categoryOptions}
      />
      <FormField
        name="notes"
        label="Observações"
        className="sm:col-span-2"
        defaultValue={row.notes ?? undefined}
      />
    </>
  );
}

export default async function TransactionsPage() {
  const userId = await requireUserId();
  await db.execute(sql`select public.seed_default_categories(${userId})`);

  const [rows, accountRows, categoryRows] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), isNull(transactions.deletedAt)))
      .orderBy(desc(transactions.date), desc(transactions.createdAt)),
    db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt))),
    db
      .select({ id: categories.id, name: categories.name })
      .from(categories)
      .where(and(eq(categories.userId, userId), isNull(categories.deletedAt))),
  ]);

  const accountMap = Object.fromEntries(accountRows.map((a) => [a.id, a.name]));
  const accountOptions = accountRows.map((a) => ({ value: a.id, label: a.name }));
  const categoryOptions = categoryRows.map((c) => ({ value: c.id, label: c.name }));

  return (
    <AppShell title="Transações">
      <div className="space-y-6">
        <PageHeader title="Lançamentos" />

        <Card>
          <CardContent className="pt-6">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum lançamento ainda.</p>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {rows.map((row) => (
                    <div key={row.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium">{row.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(row.date)}
                            {row.accountId ? ` · ${accountMap[row.accountId] ?? ""}` : ""}
                          </p>
                        </div>
                        <div className="inline-flex shrink-0 items-center gap-0.5">
                          <EditEntityDialog
                            title="Editar lançamento"
                            path="/app/transacoes"
                            action={updateTransaction}
                            id={row.id}
                          >
                            {transactionEditFields(row, accountOptions, categoryOptions)}
                          </EditEntityDialog>
                          <ConfirmDeleteButton
                            id={row.id}
                            path="/app/transacoes"
                            action={deleteTransaction}
                            label="lançamento"
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <Badge variant={row.type === "income" ? "default" : "secondary"}>
                          {row.type === "income" ? "Receita" : "Despesa"}
                        </Badge>
                        <span
                          className={`font-medium ${row.type === "expense" ? "text-red-400" : "text-teal-400"}`}
                        >
                          {row.type === "expense" ? "−" : "+"}
                          {formatBRL(toNumber(row.amount))}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Conta</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>{formatDate(row.date)}</TableCell>
                          <TableCell>
                            <div className="font-medium">{row.description}</div>
                            {row.notes ? (
                              <div className="text-xs text-muted-foreground">{row.notes}</div>
                            ) : null}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {row.accountId ? accountMap[row.accountId] ?? "—" : "—"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={row.type === "income" ? "default" : "secondary"}>
                              {row.type === "income" ? "Receita" : "Despesa"}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={`text-right font-medium ${row.type === "expense" ? "text-red-400" : "text-teal-400"}`}
                          >
                            {row.type === "expense" ? "−" : "+"}
                            {formatBRL(toNumber(row.amount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center justify-end gap-0.5">
                              <EditEntityDialog
                                title="Editar lançamento"
                                path="/app/transacoes"
                                action={updateTransaction}
                                id={row.id}
                              >
                                {transactionEditFields(row, accountOptions, categoryOptions)}
                              </EditEntityDialog>
                              <ConfirmDeleteButton
                                id={row.id}
                                path="/app/transacoes"
                                action={deleteTransaction}
                                label="lançamento"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
