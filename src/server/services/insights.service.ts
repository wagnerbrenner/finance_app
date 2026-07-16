import { and, eq, gte, isNull, lt, sql } from "drizzle-orm";
import { format, startOfMonth, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { db } from "@/server/db";
import { categories, transactions } from "@/server/db/schema";
import { toNumber } from "@/server/auth";
import {
  generateAdvisorInsights,
  type AdvisorInsight,
} from "@/server/services/advisor.service";
import { getDashboard } from "@/server/services/dashboard.service";

export type InsightCard = AdvisorInsight & {
  href?: string;
};

export async function getUserInsights(userId: string): Promise<InsightCard[]> {
  const dash = await getDashboard(userId);
  const base = generateAdvisorInsights({
    netWorth: dash.kpis.netWorth,
    monthlyIncome: dash.kpis.month.income,
    monthlyExpense: dash.kpis.month.expense,
    debts: dash.kpis.debtBalance,
    invested: dash.kpis.invested,
  });

  const cards: InsightCard[] = base.map((b) => ({
    ...b,
    href: b.title.includes("dívida") ? "/app/dividas" : "/dashboard",
  }));

  const now = new Date();
  const thisStart = startOfMonth(now);
  const lastStart = startOfMonth(subMonths(now, 1));

  const thisMonthCat = await db
    .select({
      name: categories.name,
      total: sql<string>`coalesce(sum(abs(${transactions.amount})), 0)`,
    })
    .from(transactions)
    .innerJoin(categories, eq(categories.id, transactions.categoryId))
    .where(
      and(
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
        eq(transactions.type, "expense"),
        gte(transactions.date, format(thisStart, "yyyy-MM-dd")),
      ),
    )
    .groupBy(categories.name)
    .orderBy(sql`sum(abs(${transactions.amount})) desc`)
    .limit(3);

  const lastMonthExpense = await db
    .select({
      total: sql<string>`coalesce(sum(abs(${transactions.amount})), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        isNull(transactions.deletedAt),
        eq(transactions.type, "expense"),
        gte(transactions.date, format(lastStart, "yyyy-MM-dd")),
        lt(transactions.date, format(thisStart, "yyyy-MM-dd")),
      ),
    )
    .limit(1);

  const lastTotal = toNumber(lastMonthExpense[0]?.total ?? 0);
  const thisTotal = dash.kpis.month.expense;

  if (thisMonthCat[0] && toNumber(thisMonthCat[0].total) > 0) {
    cards.push({
      title: `Maior gasto: ${thisMonthCat[0].name}`,
      description: `Neste mês, ${thisMonthCat[0].name} lidera suas despesas (${toNumber(thisMonthCat[0].total).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}). Vale revisar lançamentos nessa categoria.`,
      tone: "neutral",
      href: "/app/transacoes",
    });
  }

  if (lastTotal > 0) {
    const delta = ((thisTotal - lastTotal) / lastTotal) * 100;
    const monthName = format(lastStart, "MMMM", { locale: ptBR });
    if (delta > 15) {
      cards.push({
        title: "Despesas subiram vs mês passado",
        description: `Você está ~${Math.round(delta)}% acima de ${monthName}. Olhe recorrentes e categorias que cresceram.`,
        tone: "warning",
        href: "/app/recorrentes",
      });
    } else if (delta < -10) {
      cards.push({
        title: "Despesas menores que o mês passado",
        description: `Boa: cerca de ${Math.abs(Math.round(delta))}% a menos que ${monthName}. Se sobrar, considere um aporte na meta.`,
        tone: "positive",
        href: "/app/metas",
      });
    }
  }

  const surplus = dash.kpis.month.income - dash.kpis.month.expense;
  if (surplus > 50) {
    cards.push({
      title: "Sobra pode virar meta",
      description: `Com ~${surplus.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} de sobra no mês, um aporte pequeno na meta acelera o objetivo.`,
      tone: "positive",
      href: "/app/metas",
    });
  }

  // unique by title
  const seen = new Set<string>();
  return cards.filter((c) => {
    if (seen.has(c.title)) return false;
    seen.add(c.title);
    return true;
  }).slice(0, 8);
}
