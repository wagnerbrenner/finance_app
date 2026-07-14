import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { FinancePage } from "@/features/finance/components/finance-page";
import { createDebt, deleteDebt } from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { debts } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";

export default async function DebtsPage() {
  const userId = await requireUserId();
  const rows = await db.select().from(debts).where(and(eq(debts.userId, userId), isNull(debts.deletedAt))).orderBy(desc(debts.createdAt));
  return <AppShell title="Dívidas"><FinancePage title="Dívidas" description="Registre saldos e simule amortizações." path="/app/dividas" createAction={createDebt} deleteAction={deleteDebt} fields={[{ name: "name", label: "Dívida" }, { name: "creditor", label: "Credor", required: false }, { name: "balance", label: "Saldo atual", type: "number", step: "0.01" }, { name: "originalAmount", label: "Valor original", type: "number", step: "0.01" }, { name: "interestRate", label: "Juros ao mês (%)", type: "number", step: "0.01", defaultValue: "0" }]} rows={rows.map((row) => { const balance = toNumber(row.balance), rate = toNumber(row.interestRate) / 100, amortization = balance * 0.1; return { id: row.id, title: row.name, detail: `${row.creditor ?? "Sem credor"} · amortizar 10% (${formatBRL(amortization)}) economiza aprox. ${formatBRL(amortization * rate * 12)} em 12 meses`, amount: formatBRL(balance) }; })} /></AppShell>;
}
