import { and, desc, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { FinancePage } from "@/features/finance/components/finance-page";
import { createUberPeriod, deleteUberPeriod } from "@/features/finance/actions";
import { requireUserId, toNumber } from "@/server/auth";
import { db } from "@/server/db";
import { uberPeriods } from "@/server/db/schema";
import { formatBRL } from "@/shared/lib/formatters";

export default async function UberPage() {
  const userId = await requireUserId(); const rows = await db.select().from(uberPeriods).where(and(eq(uberPeriods.userId, userId), isNull(uberPeriods.deletedAt))).orderBy(desc(uberPeriods.periodMonth));
  const last = rows[0]; const costFields = ["fuelCost", "tolls", "wash", "maintenance", "otherCosts"] as const;
  const costs = (item: typeof rows[number]) => costFields.reduce((sum, key) => sum + toNumber(item[key]), 0);
  const margin = last ? Math.max(0.01, (toNumber(last.grossRevenue) - costs(last)) / toNumber(last.grossRevenue)) : 0.5;
  return <AppShell title="Uber"><FinancePage title="Uber" description={`Simulador: para lucrar ${formatBRL(1000)}, fature ${formatBRL(1000 / margin)} (margem base ${(margin * 100).toFixed(0)}%).`} path="/app/uber" createAction={createUberPeriod} deleteAction={deleteUberPeriod} fields={[{ name: "periodMonth", label: "Mês", type: "date" }, { name: "grossRevenue", label: "Faturamento", type: "number", step: "0.01" }, { name: "daysWorked", label: "Dias trabalhados", type: "number" }, { name: "hoursWorked", label: "Horas", type: "number", step: "0.01" }, { name: "kmDriven", label: "KM rodados", type: "number", step: "0.01" }, { name: "fuelCost", label: "Combustível", type: "number", step: "0.01" }, { name: "tolls", label: "Pedágios", type: "number", step: "0.01", defaultValue: "0" }, { name: "maintenance", label: "Manutenção", type: "number", step: "0.01", defaultValue: "0" }, { name: "otherCosts", label: "Outros custos", type: "number", step: "0.01", defaultValue: "0" }]} rows={rows.map((row) => { const net = toNumber(row.grossRevenue) - costs(row); return { id: row.id, title: row.periodMonth, detail: `Líquido ${formatBRL(net)} · ${formatBRL(net / Math.max(1, toNumber(row.hoursWorked)))}/h · ${formatBRL(costs(row) / Math.max(1, toNumber(row.kmDriven)))}/km`, amount: formatBRL(toNumber(row.grossRevenue)) }; })} /></AppShell>;
}
