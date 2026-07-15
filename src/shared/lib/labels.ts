/** Labels em português para valores persistidos em inglês no banco. */

export const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  tesouro: "Tesouro",
  cdb: "CDB",
  lci: "LCI",
  lca: "LCA",
  etf: "ETF",
  fii: "FII",
  stock: "Ações",
  crypto: "Cripto",
  other: "Outro",
};

export const FREQUENCY_LABELS: Record<string, string> = {
  weekly: "Semanal",
  monthly: "Mensal",
  yearly: "Anual",
};

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  checking: "Conta corrente",
  savings: "Poupança",
  cash: "Dinheiro",
  investment: "Investimento",
  other: "Outro",
};

export const NOTIFICATION_SEVERITY_LABELS: Record<string, string> = {
  overdue: "Atrasado",
  due_today: "Vence hoje",
  due_in_1_day: "Vence amanhã",
  due_in_2_days: "Vence em 2 dias",
};

export function labelOf(map: Record<string, string>, value: string) {
  return map[value] ?? value;
}
