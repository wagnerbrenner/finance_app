import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { FinancePage } from "@/features/finance/components/finance-page";
import { createInvestment, deleteInvestment } from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { investments } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";

export default async function InvestmentsPage() {
  const userId = await requireUserId(); const rows = await db.select().from(investments).where(and(eq(investments.userId, userId), isNull(investments.deletedAt))).orderBy(desc(investments.createdAt));
  const total = rows.reduce((sum, item) => sum + toNumber(item.quantity) * toNumber(item.currentPrice), 0);
  return <AppShell title="Investimentos"><FinancePage title={`Investimentos · ${formatBRL(total)}`} description="Patrimônio investido a valor de mercado." path="/app/investimentos" createAction={createInvestment} deleteAction={deleteInvestment} fields={[{ name: "name", label: "Ativo" }, { name: "type", label: "Tipo", defaultValue: "other" }, { name: "ticker", label: "Ticker", required: false }, { name: "quantity", label: "Quantidade", type: "number", step: "0.0001" }, { name: "averagePrice", label: "Preço médio", type: "number", step: "0.01" }, { name: "currentPrice", label: "Preço atual", type: "number", step: "0.01" }, { name: "expectedYield", label: "Rendimento esperado (%)", type: "number", step: "0.01", defaultValue: "0" }]} rows={rows.map((row) => ({ id: row.id, title: row.name, detail: `${row.ticker ?? row.type} · ${toNumber(row.quantity)} unidades`, amount: formatBRL(toNumber(row.quantity) * toNumber(row.currentPrice)) }))} /></AppShell>;
}
