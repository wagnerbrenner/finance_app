import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { CreateEntityDialog } from "@/shared/components/create-entity-dialog";
import { EditEntityDialog } from "@/shared/components/edit-entity-dialog";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import { FormField } from "@/shared/components/form-field";
import { FormSelect } from "@/shared/components/form-select";
import {
  createConsortium,
  createInvestment,
  deleteConsortium,
  deleteInvestment,
  updateConsortium,
  updateInvestment,
} from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { consortia, investments } from "@/server/db/schema";
import { formatBRL, formatDate } from "@/shared/lib/formatters";
import { INVESTMENT_TYPE_LABELS, labelOf } from "@/shared/lib/labels";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const investmentTypeOptions = [
  { value: "tesouro", label: "Tesouro" },
  { value: "cdb", label: "CDB" },
  { value: "lci", label: "LCI" },
  { value: "lca", label: "LCA" },
  { value: "etf", label: "ETF" },
  { value: "fii", label: "FII" },
  { value: "stock", label: "Ações" },
  { value: "crypto", label: "Cripto" },
  { value: "other", label: "Outro" },
];

function investmentFields(row?: {
  name?: string;
  type?: string;
  ticker?: string | null;
  quantity?: string;
  averagePrice?: string;
  currentPrice?: string;
  expectedYield?: string;
}) {
  return (
    <>
      <FormField name="name" label="Ativo" required defaultValue={row?.name} />
      <FormSelect
        name="type"
        label="Tipo"
        defaultValue={row?.type ?? "other"}
        required
        options={investmentTypeOptions}
      />
      <FormField name="ticker" label="Código (ticker)" defaultValue={row?.ticker ?? undefined} />
      <FormField
        name="quantity"
        label="Quantidade"
        type="number"
        min="0"
        step="0.0001"
        defaultValue={row?.quantity != null ? String(toNumber(row.quantity)) : "0"}
        required
      />
      <FormField
        name="averagePrice"
        label="Preço médio"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.averagePrice != null ? String(toNumber(row.averagePrice)) : "0"}
        required
      />
      <FormField
        name="currentPrice"
        label="Preço atual"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.currentPrice != null ? String(toNumber(row.currentPrice)) : "0"}
        required
      />
      <FormField
        name="expectedYield"
        label="Rendimento esperado (%)"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.expectedYield != null ? String(toNumber(row.expectedYield)) : "0"}
        required
      />
    </>
  );
}

function consortiumFields(row?: {
  name?: string;
  administrator?: string | null;
  groupNumber?: string | null;
  letterNumber?: string | null;
  creditAmount?: string;
  installmentAmount?: string;
  totalInstallments?: number;
  paidInstallments?: number;
  nextDueDate?: string | null;
  contemplated?: boolean;
  status?: string;
  notes?: string | null;
}) {
  return (
    <>
      <FormField name="name" label="Nome" required defaultValue={row?.name} />
      <FormField
        name="administrator"
        label="Administradora"
        defaultValue={row?.administrator ?? undefined}
      />
      <FormField name="groupNumber" label="Grupo" defaultValue={row?.groupNumber ?? undefined} />
      <FormField name="letterNumber" label="Cota" defaultValue={row?.letterNumber ?? undefined} />
      <FormField
        name="creditAmount"
        label="Carta de crédito"
        type="number"
        min="0"
        step="0.01"
        defaultValue={row?.creditAmount != null ? String(toNumber(row.creditAmount)) : "0"}
        required
      />
      <FormField
        name="installmentAmount"
        label="Valor da parcela"
        type="number"
        min="0"
        step="0.01"
        defaultValue={
          row?.installmentAmount != null ? String(toNumber(row.installmentAmount)) : "0"
        }
        required
      />
      <FormField
        name="totalInstallments"
        label="Total de parcelas"
        type="number"
        min="0"
        step="1"
        defaultValue={row?.totalInstallments != null ? String(row.totalInstallments) : "0"}
        required
      />
      <FormField
        name="paidInstallments"
        label="Parcelas pagas"
        type="number"
        min="0"
        step="1"
        defaultValue={row?.paidInstallments != null ? String(row.paidInstallments) : "0"}
        required
      />
      <FormField
        name="nextDueDate"
        label="Próximo vencimento"
        type="date"
        defaultValue={row?.nextDueDate ?? undefined}
      />
      <FormSelect
        name="contemplated"
        label="Contemplado?"
        defaultValue={row?.contemplated ? "true" : "false"}
        required
        options={[
          { value: "false", label: "Não" },
          { value: "true", label: "Sim" },
        ]}
      />
      <FormSelect
        name="status"
        label="Status"
        defaultValue={row?.status ?? "active"}
        required
        options={[
          { value: "active", label: "Ativo" },
          { value: "paused", label: "Pausado" },
          { value: "completed", label: "Concluído" },
        ]}
      />
      <FormField
        name="notes"
        label="Observações"
        className="sm:col-span-2"
        defaultValue={row?.notes ?? undefined}
      />
    </>
  );
}

export default async function InvestmentsPage() {
  const userId = await requireUserId();
  const [rows, consortiumRows] = await Promise.all([
    db
      .select()
      .from(investments)
      .where(and(eq(investments.userId, userId), isNull(investments.deletedAt)))
      .orderBy(desc(investments.createdAt)),
    db
      .select()
      .from(consortia)
      .where(and(eq(consortia.userId, userId), isNull(consortia.deletedAt)))
      .orderBy(desc(consortia.createdAt)),
  ]);
  const total = rows.reduce(
    (sum, item) => sum + toNumber(item.quantity) * toNumber(item.currentPrice),
    0,
  );

  return (
    <AppShell title="Investimentos">
      <div className="space-y-6">
        <PageHeader title="Investimentos" description={formatBRL(total)} />
        <Tabs defaultValue="portfolio">
          <TabsList>
            <TabsTrigger value="portfolio">Carteira</TabsTrigger>
            <TabsTrigger value="consortia">Consórcios</TabsTrigger>
          </TabsList>
          <TabsContent value="portfolio" className="space-y-4 pt-4">
            <CreateEntityDialog
              title="Novo investimento"
              triggerLabel="Novo investimento"
              path="/app/investimentos"
              action={createInvestment}
              successMessage="Investimento criado."
            >
              {investmentFields()}
            </CreateEntityDialog>
            <Card>
              <CardContent className="pt-6">
                {rows.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Ativo</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead className="text-right">Valor atual</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="font-medium">{row.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {row.ticker ?? "Sem ticker"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {labelOf(INVESTMENT_TYPE_LABELS, row.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>{toNumber(row.quantity)}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatBRL(toNumber(row.quantity) * toNumber(row.currentPrice))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center justify-end gap-0.5">
                              <EditEntityDialog
                                title="Editar investimento"
                                path="/app/investimentos"
                                action={updateInvestment}
                                id={row.id}
                              >
                                {investmentFields(row)}
                              </EditEntityDialog>
                              <ConfirmDeleteButton
                                id={row.id}
                                path="/app/investimentos"
                                action={deleteInvestment}
                                label="investimento"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum investimento cadastrado.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="consortia" className="space-y-4 pt-4">
            <CreateEntityDialog
              title="Novo consórcio"
              triggerLabel="Novo consórcio"
              path="/app/investimentos"
              action={createConsortium}
              successMessage="Consórcio criado."
            >
              {consortiumFields()}
            </CreateEntityDialog>
            <Card>
              <CardContent className="pt-6">
                {consortiumRows.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Consórcio</TableHead>
                        <TableHead>Andamento</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead className="text-right">Parcela</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {consortiumRows.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell>
                            <div className="font-medium">{row.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {row.administrator ?? "Sem administradora"} ·{" "}
                              {row.contemplated ? "Contemplado" : "Não contemplado"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {row.paidInstallments}/{row.totalInstallments}
                          </TableCell>
                          <TableCell>
                            {row.nextDueDate ? formatDate(row.nextDueDate) : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatBRL(toNumber(row.installmentAmount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="inline-flex items-center justify-end gap-0.5">
                              <EditEntityDialog
                                title="Editar consórcio"
                                path="/app/investimentos"
                                action={updateConsortium}
                                id={row.id}
                              >
                                {consortiumFields(row)}
                              </EditEntityDialog>
                              <ConfirmDeleteButton
                                id={row.id}
                                path="/app/investimentos"
                                action={deleteConsortium}
                                label="consórcio"
                              />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum consórcio cadastrado.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
