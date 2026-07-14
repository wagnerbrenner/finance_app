import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { FinancePage } from "@/features/finance/components/finance-page";
import { createTransaction, deleteTransaction } from "@/features/transactions/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { transactions } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";

export default async function TransactionsPage() {
  const userId = await requireUserId();
  const rows = await db.select().from(transactions).where(and(eq(transactions.userId, userId), isNull(transactions.deletedAt))).orderBy(desc(transactions.date));
  return <AppShell title="Transações"><FinancePage title="Transações" description="Registre receitas e despesas realizadas." path="/app/transacoes" createAction={createTransaction} deleteAction={deleteTransaction} fields={[{ name: "description", label: "Descrição" }, { name: "amount", label: "Valor", type: "number", step: "0.01" }, { name: "type", label: "Tipo (income ou expense)", defaultValue: "expense" }, { name: "date", label: "Data", type: "date", defaultValue: new Date().toISOString().slice(0, 10) }]} rows={rows.map((row) => ({ id: row.id, title: row.description, detail: `${row.date} · ${row.type === "income" ? "Receita" : "Despesa"}`, amount: `${row.type === "expense" ? "−" : "+"}${formatBRL(toNumber(row.amount))}` }))} /></AppShell>;
}
