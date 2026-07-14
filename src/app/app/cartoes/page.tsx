import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { FinancePage } from "@/features/finance/components/finance-page";
import { createCard, createInstallment, createRecurrence, deleteCard, deleteRecurrence } from "@/features/finance/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { creditCards, installments, recurrences } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";

export default async function CardsPage() {
  const userId = await requireUserId();
  const [cards, plans, recurring] = await Promise.all([
    db.select().from(creditCards).where(and(eq(creditCards.userId, userId), isNull(creditCards.deletedAt))).orderBy(desc(creditCards.createdAt)),
    db.select().from(installments).where(and(eq(installments.userId, userId), isNull(installments.deletedAt), eq(installments.isActive, true))),
    db.select().from(recurrences).where(and(eq(recurrences.userId, userId), isNull(recurrences.deletedAt), eq(recurrences.isActive, true))),
  ]);
  return <AppShell title="Cartões"><FinancePage title="Cartões" description="Limites, compras parceladas e recorrências." path="/app/cartoes" createAction={createCard} deleteAction={deleteCard} fields={[{ name: "name", label: "Nome" }, { name: "limitAmount", label: "Limite", type: "number", step: "0.01" }, { name: "closingDay", label: "Dia de fechamento", type: "number", defaultValue: "1" }, { name: "dueDay", label: "Dia de vencimento", type: "number", defaultValue: "10" }]} rows={cards.map((card) => ({ id: card.id, title: card.name, detail: `Fecha dia ${card.closingDay} · vence dia ${card.dueDay}`, amount: formatBRL(toNumber(card.limitAmount)) }))}>
    <section className="grid gap-3 border-t pt-4"><p className="font-medium">Parcelamentos ativos</p>{plans.map((plan) => <p key={plan.id} className="text-sm">{plan.description}: {plan.paidInstallments}/{plan.totalInstallments} · {formatBRL(toNumber(plan.installmentAmount))}</p>)}<form action={createInstallment} className="grid gap-2 md:grid-cols-4"><input type="hidden" name="path" value="/app/cartoes" /><Input name="description" placeholder="Compra parcelada" required /><Input name="totalAmount" type="number" step="0.01" placeholder="Valor total" required /><Input name="totalInstallments" type="number" placeholder="Parcelas" required /><Input name="startDate" type="date" required /><Input name="creditCardId" placeholder="ID do cartão (opcional)" /><Button type="submit">Adicionar parcela</Button></form></section>
    <section className="grid gap-3 border-t pt-4"><p className="font-medium">Recorrências</p>{recurring.map((item) => <div key={item.id} className="flex justify-between text-sm"><span>{item.description} · {formatBRL(toNumber(item.amount))}</span><form action={deleteRecurrence}><input type="hidden" name="id" value={item.id} /><input type="hidden" name="path" value="/app/cartoes" /><Button variant="ghost">Excluir</Button></form></div>)}<form action={createRecurrence} className="grid gap-2 md:grid-cols-4"><input type="hidden" name="path" value="/app/cartoes" /><Input name="description" placeholder="Descrição" required /><Input name="amount" type="number" step="0.01" placeholder="Valor" required /><Input name="type" defaultValue="expense" placeholder="income/expense" /><Input name="frequency" defaultValue="monthly" /><Input name="dayOfMonth" type="number" defaultValue="1" /><Input name="startDate" type="date" required /><Button type="submit">Adicionar recorrência</Button></form></section>
  </FinancePage></AppShell>;
}
