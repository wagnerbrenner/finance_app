import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { CreateEntityDialog } from "@/shared/components/create-entity-dialog";
import { ConfirmDeleteButton } from "@/shared/components/confirm-delete-button";
import { FormField } from "@/shared/components/form-field";
import { FormSelect } from "@/shared/components/form-select";
import {
  createCard,
  createInstallment,
  deleteCard,
  deleteInstallment,
  deleteRecurrence,
} from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { accounts, creditCards, installments, recurrences } from "@/server/db/schema";
import { formatBRL, formatDate } from "@/shared/lib/formatters";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function CardsPage() {
  const userId = await requireUserId();
  const [cards, plans, recurring, accountRows] = await Promise.all([
    db
      .select()
      .from(creditCards)
      .where(and(eq(creditCards.userId, userId), isNull(creditCards.deletedAt)))
      .orderBy(desc(creditCards.createdAt)),
    db
      .select()
      .from(installments)
      .where(
        and(
          eq(installments.userId, userId),
          isNull(installments.deletedAt),
          eq(installments.isActive, true),
        ),
      ),
    db
      .select()
      .from(recurrences)
      .where(
        and(
          eq(recurrences.userId, userId),
          isNull(recurrences.deletedAt),
          eq(recurrences.isActive, true),
        ),
      ),
    db
      .select({ id: accounts.id, name: accounts.name })
      .from(accounts)
      .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt))),
  ]);
  const accountOptions = accountRows.map((account) => ({
    value: account.id,
    label: account.name,
  }));
  const cardOptions = cards.map((card) => ({ value: card.id, label: card.name }));

  return (
    <AppShell title="Cartões">
      <div className="space-y-6">
        <PageHeader title="Cartões" description="Limites, compras parceladas e recorrências fixas.">
          <CreateEntityDialog
            title="Novo cartão"
            triggerLabel="Novo cartão"
            path="/app/cartoes"
            action={createCard}
            successMessage="Cartão criado."
          >
            <FormField name="name" label="Nome" required />
            <FormSelect name="accountId" label="Conta de pagamento" options={accountOptions} />
            <FormField name="limitAmount" label="Limite" type="number" min="0" step="0.01" required />
            <FormField
              name="closingDay"
              label="Dia de fechamento"
              type="number"
              min="1"
              max="31"
              defaultValue="1"
              required
            />
            <FormField
              name="dueDay"
              label="Dia de vencimento"
              type="number"
              min="1"
              max="31"
              defaultValue="10"
              required
            />
          </CreateEntityDialog>
        </PageHeader>
        <Tabs defaultValue="cards">
          <TabsList>
            <TabsTrigger value="cards">Cartões</TabsTrigger>
            <TabsTrigger value="installments">Parcelas</TabsTrigger>
            <TabsTrigger value="recurrences">Recorrências</TabsTrigger>
          </TabsList>
          <TabsContent value="cards" className="pt-4">
            <Card>
              <CardContent className="pt-6">
                {cards.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cartão</TableHead>
                        <TableHead>Próximo vencimento</TableHead>
                        <TableHead className="text-right">Limite</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cards.map((card) => (
                        <TableRow key={card.id}>
                          <TableCell>
                            <div className="font-medium">{card.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Fecha no dia {card.closingDay}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Dia {card.dueDay}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatBRL(toNumber(card.limitAmount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <ConfirmDeleteButton
                              id={card.id}
                              path="/app/cartoes"
                              action={deleteCard}
                              label="cartão"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum cartão cadastrado.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="installments" className="space-y-4 pt-4">
            <CreateEntityDialog
              title="Nova compra parcelada"
              triggerLabel="Adicionar parcela"
              path="/app/cartoes"
              action={createInstallment}
              successMessage="Parcela criada."
            >
              <FormField name="description" label="Descrição" required className="sm:col-span-2" />
              <FormSelect name="creditCardId" label="Cartão" options={cardOptions} />
              <FormField
                name="totalAmount"
                label="Valor total"
                type="number"
                min="0.01"
                step="0.01"
                required
              />
              <FormField
                name="totalInstallments"
                label="Quantidade de parcelas"
                type="number"
                min="1"
                step="1"
                required
              />
              <FormField name="startDate" label="Primeiro vencimento" type="date" required />
            </CreateEntityDialog>
            <Card>
              <CardContent className="pt-6">
                {plans.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Compra</TableHead>
                        <TableHead>Andamento</TableHead>
                        <TableHead>Início</TableHead>
                        <TableHead className="text-right">Parcela</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {plans.map((plan) => (
                        <TableRow key={plan.id}>
                          <TableCell className="font-medium">{plan.description}</TableCell>
                          <TableCell>
                            {plan.paidInstallments}/{plan.totalInstallments}
                          </TableCell>
                          <TableCell>{formatDate(plan.startDate)}</TableCell>
                          <TableCell className="text-right">
                            {formatBRL(toNumber(plan.installmentAmount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <ConfirmDeleteButton
                              id={plan.id}
                              path="/app/cartoes"
                              action={deleteInstallment}
                              label="parcelamento"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhum parcelamento ativo.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recurrences" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Contas variáveis (luz, água): use <strong>Novo lançamento</strong> → Despesa → É recorrente.
              Aqui ficam só as recorrências fixas já cadastradas.
            </p>
            <Card>
              <CardContent className="pt-6">
                {recurring.length ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descrição</TableHead>
                        <TableHead>Periodicidade</TableHead>
                        <TableHead>Vencimento</TableHead>
                        <TableHead className="text-right">Valor</TableHead>
                        <TableHead />
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recurring.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.description}</div>
                            <Badge variant={item.type === "income" ? "default" : "secondary"}>
                              {item.type === "income" ? "Receita" : "Despesa"}
                            </Badge>
                          </TableCell>
                          <TableCell>{item.frequency}</TableCell>
                          <TableCell>Dia {item.dayOfMonth ?? 1}</TableCell>
                          <TableCell className="text-right">
                            {formatBRL(toNumber(item.amount))}
                          </TableCell>
                          <TableCell className="text-right">
                            <ConfirmDeleteButton
                              id={item.id}
                              path="/app/cartoes"
                              action={deleteRecurrence}
                              label="recorrência"
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-sm text-muted-foreground">Nenhuma recorrência ativa.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}
