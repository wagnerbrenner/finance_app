import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import {
  ConfirmOccurrenceDialog,
  SkipOccurrenceButton,
} from "@/features/recurring-bills/components/confirm-occurrence-dialog";
import { deleteRecurringBill } from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { recurringBills } from "@/server/db/schema";
import { listPendingOccurrences } from "@/server/services/recurring-bills.service";
import { formatBRL, formatDate } from "@/shared/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function RecurringBillsPage() {
  const userId = await requireUserId();

  const [bills, pending] = await Promise.all([
    db
      .select()
      .from(recurringBills)
      .where(and(eq(recurringBills.userId, userId), isNull(recurringBills.deletedAt)))
      .orderBy(desc(recurringBills.createdAt)),
    listPendingOccurrences(userId),
  ]);

  return (
    <AppShell title="Recorrentes">
      <div className="space-y-5 md:space-y-6">
        <PageHeader title="Contas recorrentes" />

        <Card>
          <CardHeader>
            <CardTitle>Pendentes / próximos vencimentos</CardTitle>
          </CardHeader>
          <CardContent>
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma ocorrência pendente.</p>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {pending.map((row) => (
                    <div key={row.id} className="rounded-lg border p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium">{row.billName}</p>
                          <p className="text-xs text-muted-foreground">
                            Vence {formatDate(row.dueDate)}
                          </p>
                        </div>
                        <Badge variant={row.status === "due" ? "destructive" : "outline"}>
                          {row.status === "due" ? "Vencida" : "Agendada"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-right font-medium">
                        {formatBRL(toNumber(row.expectedAmount))}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <ConfirmOccurrenceDialog
                          occurrenceId={row.id}
                          billName={row.billName}
                          expectedAmount={toNumber(row.expectedAmount)}
                        />
                        <SkipOccurrenceButton occurrenceId={row.id} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Conta</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Estimado</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pending.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.billName}</TableCell>
                          <TableCell>{formatDate(row.dueDate)}</TableCell>
                          <TableCell>
                            <Badge variant={row.status === "due" ? "destructive" : "outline"}>
                              {row.status === "due" ? "Vencida / hoje" : "Agendada"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {formatBRL(toNumber(row.expectedAmount))}
                          </TableCell>
                          <TableCell className="flex justify-end gap-1">
                            <ConfirmOccurrenceDialog
                              occurrenceId={row.id}
                              billName={row.billName}
                              expectedAmount={toNumber(row.expectedAmount)}
                            />
                            <SkipOccurrenceButton occurrenceId={row.id} />
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

        <Card>
          <CardHeader>
            <CardTitle>Cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            {bills.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Nenhuma conta recorrente.
              </p>
            ) : (
              <>
                <div className="space-y-3 md:hidden">
                  {bills.map((row) => (
                    <div key={row.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{row.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Todo dia {row.dayOfMonth} · {formatBRL(toNumber(row.estimatedAmount))}
                        </p>
                      </div>
                      <ConfirmDeleteButton
                        id={row.id}
                        path="/app/recorrentes"
                        action={deleteRecurringBill}
                        label="recorrente"
                      />
                    </div>
                  ))}
                </div>
                <div className="hidden md:block">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Dia</TableHead>
                        <TableHead className="text-right">Estimado</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bills.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.name}</TableCell>
                          <TableCell>Todo dia {row.dayOfMonth}</TableCell>
                          <TableCell className="text-right">
                            {formatBRL(toNumber(row.estimatedAmount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <ConfirmDeleteButton
                              id={row.id}
                              path="/app/recorrentes"
                              action={deleteRecurringBill}
                              label="recorrente"
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
