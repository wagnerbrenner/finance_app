export type SupportIntent = {
  id: string;
  keywords: string[];
  reply: string;
};

/** FAQ / knowledge base — zero LLM cost. */
export const SUPPORT_INTENTS: SupportIntent[] = [
  {
    id: "greeting",
    keywords: ["oi", "olá", "ola", "eai", "e aí", "bom dia", "boa tarde", "boa noite", "hey"],
    reply:
      "E aí! Sou o assistente do Te Organiza. Posso ajudar com login, importação de extrato, recorrentes, dashboard e planos. O que você precisa?",
  },
  {
    id: "signup_login",
    keywords: [
      "criar conta",
      "cadastro",
      "signup",
      "entrar",
      "login",
      "senha",
      "esqueci",
      "confirmar email",
      "confirmar e-mail",
      "confirmação",
    ],
    reply:
      "Para criar conta: use Criar conta na home e confirme o e-mail. Para entrar: /login com e-mail e senha. Se o e-mail de confirmação não chegou, na tela de login use “Reenviar e-mail de confirmação” (verifique spam).",
  },
  {
    id: "import_csv",
    keywords: ["importar", "csv", "ofx", "extrato", "nubank", "planilha"],
    reply:
      "No app: menu Importar. Exporte o extrato no banco (CSV ou OFX), escolha a conta destino, faça upload, revise o preview e confirme. Valores negativos viram despesa; positivos, receita. Nubank costuma exportar CSV com Data / Valor / Descrição.",
  },
  {
    id: "dashboard",
    keywords: ["dashboard", "painel", "receitas", "despesas", "saldo", "gráfico", "categoria"],
    reply:
      "No Painel você vê Receitas do mês, Despesas do mês e Saldo do mês, além de fluxo de caixa e despesas por categoria. Os números vêm dos lançamentos do mês atual — se algo sumiu, confira se a transação não foi excluída e se a data está no mês corrente.",
  },
  {
    id: "recurring",
    keywords: ["recorrente", "recorrentes", "fix", "salário", "salario", "assinatura", "aluguel"],
    reply:
      "Em Recorrentes você cadastra receitas/despesas que se repetem (ex.: salário, aluguel). Contas a pagar recorrentes ficam em Recorrentes (contas) com ocorrências por vencimento. Você pode marcar como paga no mês.",
  },
  {
    id: "transactions",
    keywords: ["lançar", "lancar", "gasto", "transação", "transacao", "despesa", "receita"],
    reply:
      "Use o botão + (lançar) na barra superior para registrar gasto ou receita em segundos. Também dá para editar/excluir nas listas de Transações e nas outras áreas.",
  },
  {
    id: "privacy",
    keywords: ["privado", "privacidade", "seguro", "segurança", "dados", "lgpd", "rls"],
    reply:
      "Seus dados ficam isolados por usuário no banco (Row Level Security no Supabase). Não vendemos dados e não há anúncios no app. Use uma senha forte e confirme o e-mail da conta.",
  },
  {
    id: "pricing",
    keywords: ["preço", "preco", "plano", "pro", "grátis", "gratis", "assinatura", "pagar", "cobrança"],
    reply:
      "Hoje o app está aberto para uso. O plano Grátis cobre o dia a dia (transações, import CSV, recorrentes, metas, dashboard). O Pro sugerido é R$ 12,90/mês ou R$ 99/ano (investimentos avançados, patrimônio, lembretes). A cobrança recorrente (Mercado Pago) ainda não está ativa — quando estiver, você assina na página de preços.",
  },
  {
    id: "debts_goals",
    keywords: ["dívida", "divida", "meta", "aporte", "investir", "investimento"],
    reply:
      "Em Dívidas você registra saldos e pode marcar pagamento do mês. Em Metas, defina o alvo e registre aportes. Investimentos ficam na área Investimentos (carteira e aportes).",
  },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .trim();
}

export type MatchResult =
  | { intentId: string; reply: string; escalated: false }
  | { intentId: null; reply: string; escalated: true };

const ESCALATE_REPLY =
  "Não tenho uma resposta pronta pra isso, mas já registrei sua mensagem para o time do Te Organiza. Se deixou e-mail, respondemos por lá. Enquanto isso, tente perguntar sobre login, importar CSV, painel, recorrentes ou planos.";

/**
 * Simple keyword scorer — highest score wins; below threshold → escalate.
 */
export function matchSupportIntent(rawMessage: string): MatchResult {
  const message = normalize(rawMessage);
  if (!message || message.length < 2) {
    return {
      intentId: "greeting",
      reply: SUPPORT_INTENTS[0].reply,
      escalated: false,
    };
  }

  let best: { id: string; reply: string; score: number } | null = null;

  for (const intent of SUPPORT_INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      const needle = normalize(kw);
      if (!needle) continue;
      if (message === needle) score += 5;
      else if (message.includes(needle)) score += 2;
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { id: intent.id, reply: intent.reply, score };
    }
  }

  if (!best || best.score < 2) {
    return { intentId: null, reply: ESCALATE_REPLY, escalated: true };
  }

  return { intentId: best.id, reply: best.reply, escalated: false };
}

export const SUPPORT_SHORTCUTS = [
  { label: "Como importar CSV?", message: "Como importar extrato CSV do Nubank?" },
  { label: "Esqueci a senha / login", message: "Não consigo entrar ou confirmar e-mail" },
  { label: "O que tem no painel?", message: "Como funciona o dashboard e o saldo do mês?" },
  { label: "Planos e preços", message: "Quais são os planos grátis e Pro?" },
] as const;
