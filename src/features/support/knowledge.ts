export type SupportIntent = {
  id: string;
  keywords: string[];
  reply: string;
};

/**
 * FAQ / knowledge base — zero LLM cost.
 * Fonte humana: docs/support-faq.md (manter alinhado).
 */
export const SUPPORT_INTENTS: SupportIntent[] = [
  {
    id: "greeting",
    keywords: ["oi", "olá", "ola", "eai", "e aí", "bom dia", "boa tarde", "boa noite", "hey", "ajuda"],
    reply:
      "E aí! Sou o assistente do Te Organiza. Posso explicar login, lançamentos, painel, contas, recorrentes, metas, dívidas, planos e privacidade. O que você precisa?",
  },
  {
    id: "what_is",
    keywords: [
      "o que é",
      "oque e",
      "para que serve",
      "pra que serve",
      "como funciona o app",
      "te organiza",
      "o que faz",
    ],
    reply:
      "O Te Organiza é um app web de finanças pessoais: você registra o que ganha e o que gasta, vê o mês em gráficos e acompanha contas, dívidas, metas e investimentos. Funciona no celular e no computador, sem instalar nada. Frase da casa: suas finanças, no controle.",
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
      "reenviar",
      "não recebi",
      "nao recebi",
    ],
    reply:
      "Criar conta: use “Criar conta” na home e confirme o e-mail. Entrar: /login com e-mail e senha. Se o e-mail de confirmação não chegou, olhe o spam e use “Reenviar e-mail de confirmação” no login. Recuperação de senha também começa pela tela de login (link por e-mail).",
  },
  {
    id: "import_coming",
    keywords: [
      "importar",
      "csv",
      "ofx",
      "extrato",
      "nubank",
      "open finance",
      "conectar banco",
      "sincronizar",
      "integração bancária",
      "integracao bancaria",
    ],
    reply:
      "A importação automática de extrato (CSV, Nubank ou outros bancos) ainda não está liberada. Por enquanto registre gastos e receitas pelo botão + Lançar. Quando a importação estiver pronta, avisamos — não pedimos senha do banco em nenhum momento.",
  },
  {
    id: "transactions",
    keywords: [
      "lançar",
      "lancar",
      "gasto",
      "transação",
      "transacao",
      "despesa",
      "receita",
      "registrar",
      "adicionar gasto",
      "como lanço",
      "como lanco",
    ],
    reply:
      "Use o botão + (Lançar) na barra superior ou no atalho do celular: valor, data, categoria e conta. Receitas também entram por ali ou pela área Renda. Em Transações você vê, edita ou exclui o que já lançou.",
  },
  {
    id: "dashboard",
    keywords: [
      "dashboard",
      "painel",
      "receitas",
      "despesas",
      "saldo",
      "gráfico",
      "grafico",
      "categoria",
      "não bate",
      "nao bate",
      "vazio",
    ],
    reply:
      "No Painel aparecem Receitas do mês, Despesas do mês, Saldo do mês, fluxo de caixa e gastos por categoria — tudo a partir do que você lançou no mês atual. Se o número não bater com o banco, falta lançamento ou a data está em outro mês. Gráfico vazio = ainda sem lançamentos no mês.",
  },
  {
    id: "accounts",
    keywords: ["conta", "contas", "carteira", "poupança", "poupanca", "corrente"],
    reply:
      "Em Contas você cadastra onde o dinheiro “mora” (corrente, poupança, carteira…). Os lançamentos se ligam a uma conta. Pode começar com uma só e ir adicionando depois.",
  },
  {
    id: "recurring",
    keywords: [
      "recorrente",
      "recorrentes",
      "fix",
      "salário",
      "salario",
      "assinatura",
      "aluguel",
      "vencimento",
    ],
    reply:
      "Em Recorrentes você cadastra o que se repete (salário, aluguel, assinaturas). Acompanhe as ocorrências por vencimento e marque como pago quando pagar na vida real.",
  },
  {
    id: "cards",
    keywords: ["cartão", "cartao", "cartões", "cartoes", "crédito", "credito", "fatura"],
    reply:
      "Em Cartões você cadastra cartões de crédito e o que registrou ligado a eles. O app não conecta sozinho ao banco nem baixa a fatura automaticamente.",
  },
  {
    id: "debts_goals",
    keywords: ["dívida", "divida", "dívidas", "dividas", "meta", "metas", "aporte", "reserva", "viagem"],
    reply:
      "Dívidas: registre o que deve e marque pagamentos do mês. Metas: defina um alvo (reserva, viagem…) e registre aportes quando guardar dinheiro.",
  },
  {
    id: "investments",
    keywords: ["investir", "investimento", "investimentos", "carteira", "renda fixa", "corretora"],
    reply:
      "Em Investimentos você registra a carteira e os aportes à mão. Nesta versão não há cotação automática nem conexão com corretora.",
  },
  {
    id: "income",
    keywords: ["renda", "freela", "freelance", "salário", "salario", "extra", "ganho"],
    reply:
      "A área Renda concentra o que você ganha (salário, freela etc.) e preferências de renda. Se a entrada não é só um salário fixo, é o lugar certo para organizar.",
  },
  {
    id: "notifications",
    keywords: ["aviso", "avisos", "lembrete", "lembretes", "notificação", "notificacao", "sino", "atrasado"],
    reply:
      "O sino mostra alertas de vencimentos próximos ou atrasados com base no que você cadastrou. Lembrete por e-mail entra no plano futuro (Pro); hoje o foco é o aviso dentro do app.",
  },
  {
    id: "mobile",
    keywords: ["celular", "mobile", "telefone", "android", "iphone", "instalar", "app store", "play store"],
    reply:
      "Não precisa instalar: abra o site no navegador do celular ou do computador. No celular o menu inferior ajuda a navegar. Ainda não há app nas lojas.",
  },
  {
    id: "privacy",
    keywords: [
      "privado",
      "privacidade",
      "seguro",
      "segurança",
      "seguranca",
      "dados",
      "lgpd",
      "senha do banco",
      "anúncio",
      "anuncio",
    ],
    reply:
      "Cada pessoa só vê os próprios registros. Não vendemos dados e não tem anúncio no app. Nunca pedimos senha do banco, cartão ou app financeiro. Use senha forte e confirme o e-mail da conta.",
  },
  {
    id: "pricing",
    keywords: [
      "preço",
      "preco",
      "plano",
      "pro",
      "grátis",
      "gratis",
      "assinatura",
      "pagar",
      "cobrança",
      "cobranca",
      "mercado pago",
    ],
    reply:
      "No cadastro você ganha o primeiro mês completo (sem cartão) pra degustar. Depois desse mês, para continuar é preciso assinar — não tem plano grátis eterno. Pro: R$ 12,90/mês ou R$ 108,36/ano (~30% off). Em Assinatura você vê se pagou o mês, o histórico e cancela a recorrência.",
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
  "Não tenho uma resposta pronta pra isso, mas já registrei sua mensagem para o time do Te Organiza. Se deixou e-mail, respondemos por lá. Enquanto isso, pergunte sobre login, lançar gasto, painel, recorrentes, metas ou planos.";

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
  { label: "Como lançar um gasto?", message: "Como eu registro um gasto no app?" },
  { label: "Esqueci a senha / login", message: "Não consigo entrar ou confirmar e-mail" },
  { label: "O que tem no painel?", message: "Como funciona o painel e o saldo do mês?" },
  { label: "Planos e preços", message: "Quais são os planos grátis e Pro?" },
] as const;
