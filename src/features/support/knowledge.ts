export type SupportIntent = {
  id: string;
  /** Frases longas pontuam mais. */
  phrases?: string[];
  keywords: string[];
  reply: string;
  /** Abre o card de sugestão no widget. */
  openFeedback?: boolean;
};

/**
 * FAQ do chat (usuário já logado) — só funcionalidade.
 * Fonte: docs/support-faq.md
 */
export const SUPPORT_INTENTS: SupportIntent[] = [
  {
    id: "greeting",
    keywords: ["oi", "olá", "ola", "eai", "e aí", "bom dia", "boa tarde", "boa noite", "hey", "ajuda"],
    reply:
      "E aí! Posso te ajudar com o app: lançar gasto, painel, recorrentes, metas, dívidas, Insights, assinatura… Ou manda uma sugestão de melhoria. O que você precisa?",
  },
  {
    id: "feedback",
    phrases: ["sugerir melhoria", "sugestao de melhoria", "ideia de melhoria"],
    keywords: [
      "sugestão",
      "sugestao",
      "melhoria",
      "seria legal",
      "podia ter",
      "poderia ter",
      "feature",
      "ideia",
      "reclamação",
      "reclamacao",
      "feedback",
    ],
    reply:
      "Boa! Abre o card de sugestão abaixo, descreve a ideia com clareza e envia — chega no e-mail do time.",
    openFeedback: true,
  },
  {
    id: "transactions",
    phrases: [
      "como lancar",
      "como lanço",
      "como registrar gasto",
      "adicionar despesa",
      "novo lancamento",
    ],
    keywords: [
      "lançar",
      "lancar",
      "gasto",
      "transação",
      "transacao",
      "despesa",
      "receita",
      "registrar",
      "editar lancamento",
      "excluir gasto",
    ],
    reply:
      "Toque em + / Novo lançamento (barra superior ou atalho no celular): valor, data, categoria e conta. Em Transações você vê a lista, edita ou exclui. Receitas também entram por Renda.",
  },
  {
    id: "dashboard",
    phrases: ["saldo do mes", "nao bate", "grafico vazio", "como funciona o painel"],
    keywords: [
      "dashboard",
      "painel",
      "receitas",
      "despesas",
      "saldo",
      "gráfico",
      "grafico",
      "categoria",
      "fluxo",
    ],
    reply:
      "No Painel: Receitas, Despesas e Saldo do mês + gráficos — tudo do que você lançou no mês atual. Se não bater com o banco, falta lançamento ou a data está em outro mês. Sem lançamentos = gráfico vazio.",
  },
  {
    id: "accounts",
    keywords: ["conta", "contas", "carteira", "poupança", "poupanca", "corrente"],
    reply:
      "Em Contas você cadastra onde o dinheiro “mora” (corrente, poupança, carteira). Cada lançamento se liga a uma conta. Pode começar com uma só.",
  },
  {
    id: "recurring",
    phrases: ["marcar como pago", "conta fixa", "gasto fixo"],
    keywords: ["recorrente", "recorrentes", "fix", "aluguel", "vencimento", "streaming"],
    reply:
      "Em Recorrentes cadastre o que se repete (aluguel, streaming, salário). Acompanhe as ocorrências do mês e marque como pago quando pagar na vida real.",
  },
  {
    id: "cards",
    keywords: ["cartão", "cartao", "cartões", "cartoes", "crédito", "credito", "fatura"],
    reply:
      "Em Cartões você cadastra cartões e o que registrou neles. O app não baixa fatura do banco sozinho — o lançamento é manual.",
  },
  {
    id: "debts",
    keywords: ["dívida", "divida", "dívidas", "dividas", "parcela", "emprestimo", "empréstimo"],
    reply:
      "Em Dívidas registre o que deve e marque pagamentos do mês. Dá para simular amortização na própria tela.",
  },
  {
    id: "goals",
    keywords: ["meta", "metas", "aporte", "reserva", "viagem", "objetivo"],
    reply:
      "Em Metas defina um alvo (reserva, viagem…) e registre aportes quando guardar dinheiro. O progresso aparece na lista.",
  },
  {
    id: "investments",
    keywords: ["investir", "investimento", "investimentos", "renda fixa", "corretora", "ação"],
    reply:
      "Em Investimentos registre a carteira e os aportes à mão. Não há cotação automática nem conexão com corretora nesta versão.",
  },
  {
    id: "insights",
    keywords: ["insight", "insights", "dica", "conselheiro", "analise", "análise"],
    reply:
      "Em Insights você vê leituras a partir dos lançamentos (categorias fortes, comparação com o mês passado, sobra → meta). É parte do Pro (liberado na degustação e na assinatura).",
  },
  {
    id: "income",
    keywords: ["renda", "freela", "freelance", "salário", "salario", "uber", "extra"],
    reply:
      "A área Renda organiza o que você ganha (salário, freela, apps). Preferências de onboarding ajudam a montar as abas certas.",
  },
  {
    id: "notifications",
    keywords: ["aviso", "avisos", "lembrete", "lembretes", "notificação", "notificacao", "sino", "atrasado"],
    reply:
      "O sino mostra vencimentos próximos ou atrasados com base no que você cadastrou. E-mails de lembrete entram para quem está no Pro/degustação.",
  },
  {
    id: "import_coming",
    phrases: ["importar csv", "importar extrato", "conectar banco"],
    keywords: ["importar", "csv", "ofx", "extrato", "nubank", "open finance", "sincronizar"],
    reply:
      "Importação automática de extrato ainda não está liberada. Por enquanto use + Lançar. Nunca pedimos senha do banco.",
  },
  {
    id: "billing",
    phrases: ["cancelar assinatura", "pagou este mes", "degustacao", "primeiro mes"],
    keywords: [
      "assinatura",
      "assinar",
      "preço",
      "preco",
      "plano",
      "pro",
      "pagar",
      "cobrança",
      "cobranca",
      "cancelar",
      "mercado pago",
      "degustação",
      "mensal",
      "anual",
    ],
    reply:
      "Você tem o primeiro mês completo na degustação. Depois, para continuar, assine em Assinatura (menu da conta): mensal R$ 12,90 ou anual R$ 108,36 (~30% off). Lá você vê se pagou o ciclo, o histórico e cancela a recorrência.",
  },
  {
    id: "privacy",
    keywords: ["privado", "privacidade", "seguro", "segurança", "seguranca", "dados", "lgpd"],
    reply:
      "Cada conta só vê os próprios registros. Não vendemos dados e não tem anúncio. Nunca pedimos senha de banco. Detalhes em /privacidade.",
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
  | { intentId: string; reply: string; escalated: false; openFeedback?: boolean }
  | { intentId: null; reply: string; escalated: true; openFeedback?: boolean };

const ESCALATE_REPLY =
  "Não tenho uma resposta pronta. Já registrei pra o time. Enquanto isso, pergunte sobre lançar gasto, painel, recorrentes, metas, Insights ou assinatura — ou use “Sugerir melhoria”.";

export function isFeedbackIntent(rawMessage: string): boolean {
  const message = normalize(rawMessage);
  const intent = SUPPORT_INTENTS.find((i) => i.id === "feedback");
  if (!intent) return false;
  for (const p of intent.phrases ?? []) {
    if (message.includes(normalize(p))) return true;
  }
  for (const kw of intent.keywords) {
    if (message.includes(normalize(kw))) return true;
  }
  return false;
}

/**
 * Keyword + phrase scorer — frases longas pesam mais; threshold → escalate.
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

  let best: {
    id: string;
    reply: string;
    score: number;
    openFeedback?: boolean;
  } | null = null;

  for (const intent of SUPPORT_INTENTS) {
    let score = 0;
    for (const phrase of intent.phrases ?? []) {
      const needle = normalize(phrase);
      if (!needle) continue;
      if (message.includes(needle)) score += 6 + Math.min(needle.length / 10, 4);
    }
    for (const kw of intent.keywords) {
      const needle = normalize(kw);
      if (!needle) continue;
      if (message === needle) score += 5;
      else if (message.includes(needle)) {
        // palavras curtas (ex.: "acao") exigem match mais forte
        score += needle.length >= 5 ? 3 : 1;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = {
        id: intent.id,
        reply: intent.reply,
        score,
        openFeedback: intent.openFeedback,
      };
    }
  }

  if (!best || best.score < 3) {
    return { intentId: null, reply: ESCALATE_REPLY, escalated: true };
  }

  return {
    intentId: best.id,
    reply: best.reply,
    escalated: false,
    openFeedback: best.openFeedback,
  };
}

export const SUPPORT_SHORTCUTS = [
  { label: "Como lançar?", message: "Como eu registro um gasto no app?", kind: "chat" as const },
  { label: "Painel / saldo", message: "Como funciona o painel e o saldo do mês?", kind: "chat" as const },
  { label: "Recorrentes", message: "Como uso recorrentes e marco como pago?", kind: "chat" as const },
  { label: "Assinatura", message: "Como funciona a assinatura e cancelar?", kind: "chat" as const },
  { label: "Sugerir melhoria", message: "Quero sugerir uma melhoria", kind: "feedback" as const },
] as const;
