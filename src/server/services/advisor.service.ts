export type AdvisorInsight = { title: string; description: string; tone: "positive" | "warning" | "neutral" };

export function generateAdvisorInsights(input: {
  netWorth: number; monthlyIncome: number; monthlyExpense: number; debts: number; invested: number;
}): AdvisorInsight[] {
  const insights: AdvisorInsight[] = [];
  const surplus = input.monthlyIncome - input.monthlyExpense;
  if (surplus > 0) insights.push({ title: "Você fechou o mês no azul", description: `Sobram R$ ${surplus.toFixed(2)} no fluxo mensal. Direcione parte para suas metas.`, tone: "positive" });
  else insights.push({ title: "Atenção ao fluxo mensal", description: "Suas despesas estão iguais ou acima das receitas. Revise os gastos recorrentes.", tone: "warning" });
  if (input.debts > input.invested) insights.push({ title: "Priorize as dívidas", description: "O saldo de dívidas supera seus investimentos; compare os juros antes de aportar.", tone: "warning" });
  if (input.netWorth >= 0) insights.push({ title: "Saldo sob controle", description: "Continue registrando transações para tornar as projeções mais precisas.", tone: "neutral" });
  return insights.slice(0, 3);
}
