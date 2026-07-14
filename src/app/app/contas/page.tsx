import { and, desc, eq, isNull, sql } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { FinancePage } from "@/features/finance/components/finance-page";
import { createAccount, deleteAccount } from "@/features/accounts/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";

export default async function AccountsPage() {
  const userId = await requireUserId();
  await db.execute(sql`select public.seed_default_categories(${userId})`);
  const rows = await db.select().from(accounts).where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt))).orderBy(desc(accounts.createdAt));
  return <AppShell title="Contas"><FinancePage title="Contas" description="Acompanhe os saldos das suas contas." path="/app/contas" createAction={createAccount} deleteAction={deleteAccount} fields={[{ name: "name", label: "Nome" }, { name: "institution", label: "Instituição", required: false }, { name: "type", label: "Tipo", defaultValue: "checking" }, { name: "amount", label: "Saldo inicial", type: "number", step: "0.01" }]} rows={rows.map((row) => ({ id: row.id, title: row.name, detail: `${row.institution ?? "Sem instituição"} · ${row.type}`, amount: formatBRL(toNumber(row.initialBalance)) }))} /></AppShell>;
}
