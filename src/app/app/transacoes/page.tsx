import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import { deleteTransaction } from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { accounts, transactions } from "@/server/db/schema";
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

export default async function TransactionsPage() {
  const userId = await requireUserId();
  await db.execute(sql`select public.seed_default_categories(${userId})`);

  const [rows, accountRows] = await Promise.all([
    db
      .select()
      .from(transactions)
      .where(and(eq(transactions.userId, userId), isNull(transactions.deletedAt)))
      .orderBy(desc(transactions.date), desc(transactions.createdAt)),
    db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt))),
  ]);

  const accountMap = Object.fromEntries(accountRows.map((a) => [a.id, a.name]));

  return (
    <AppShell title="Transações">
      <div className="space-y-6">
        <PageHeader
          title="Lançamentos"
          description="Consulte e exclua receitas e despesas. Novos lançamentos pelo botão + (celular) ou Novo lançamento (desktop)."
        />

        <Card>
          <CardContent className="pt-6">
            {rows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhum lançamento ainda. Use o botão <strong>+</strong> no celular ou{" "}
                <strong>Novo lançamento</strong> no computador.
              </p>
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
                        <ConfirmDeleteButton
                          id={row.id}
                          path="/app/transacoes"
                          action={deleteTransaction}
                          label="lançamento"
                        />
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
                        <ConfirmDeleteButton
                          id={row.id}
                          path="/app/transacoes"
                          action={deleteTransaction}
                          label="lançamento"
                        />
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
