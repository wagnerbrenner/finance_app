export type AdvisorInsight = {
  title: string;
  description: string;
  tone: "positive" | "warning" | "neutral";
};

export function generateAdvisorInsights(input: {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  debts: number;
  invested: number;
}): AdvisorInsight[] {
  const insights: AdvisorInsight[] = [];
  const surplus = input.monthlyIncome - input.monthlyExpense;
  const expenseRatio =
    input.monthlyIncome > 0 ? input.monthlyExpense / input.monthlyIncome : 0;

  if (surplus > 0) {
    insights.push({
      title: "Você fechou o mês no azul",
      description: `Sobram R$ ${surplus.toFixed(2)} no fluxo mensal. Direcione parte para suas metas.`,
      tone: "positive",
    });
  } else {
    insights.push({
      title: "Atenção ao fluxo mensal",
      description:
        "Suas despesas estão iguais ou acima das receitas. Revise os gastos recorrentes.",
      tone: "warning",
    });
  }

  if (expenseRatio > 0.85 && input.monthlyIncome > 0) {
    insights.push({
      title: "Quase tudo do salário está comprometido",
      description: `Despesas consomem cerca de ${Math.round(expenseRatio * 100)}% da renda do mês. Folga pequena aumenta o risco no dia a dia.`,
      tone: "warning",
    });
  }

  if (input.debts > input.invested) {
    insights.push({
      title: "Priorize as dívidas",
      description:
        "O saldo de dívidas supera seus investimentos; compare os juros antes de aportar.",
      tone: "warning",
    });
  } else if (input.invested > 0 && input.debts === 0) {
    insights.push({
      title: "Patrimônio sem dívida ativa",
      description:
        "Sem saldo de dívidas cadastrado e com investimentos registrados — bom ponto de partida.",
      tone: "positive",
    });
  }

  if (input.netWorth >= 0) {
    insights.push({
      title: "Saldo sob controle",
      description:
        "Continue registrando transações para tornar as projeções e os Insights mais precisos.",
      tone: "neutral",
    });
  } else {
    insights.push({
      title: "Patrimônio líquido negativo",
      description:
        "Dívidas e obrigações estão acima dos ativos cadastrados. Foque em quitar o caro e lançar tudo com fidelidade.",
      tone: "warning",
    });
  }

  return insights.slice(0, 5);
}
