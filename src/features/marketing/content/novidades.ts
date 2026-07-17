export type Novidade = {
  date: string;
  title: string;
  body: string;
};

/** Changelog estático — edite aqui para publicar novidades. */
export const NOVIDADES: Novidade[] = [
  {
    date: "2026-07-16",
    title: "Degustação de 1 mês + assinatura",
    body: "Primeiro mês completo sem cartão. Depois, assinatura mensal ou anual via Mercado Pago — com status, histórico e cancelamento em Assinatura.",
  },
  {
    date: "2026-07-16",
    title: "Insights no app",
    body: "Nova área Insights com leituras a partir dos seus lançamentos (categorias, vs mês passado, sobra → meta).",
  },
  {
    date: "2026-07-15",
    title: "Landing Te Organiza",
    body: "Nova página inicial de conversão, marca Te Organiza e fluxo claro: um mês pra sentir, depois assinatura.",
  },
  {
    date: "2026-07-14",
    title: "Ajuda no app",
    body: "Chat de suporte no canto do app (só logado) com respostas sobre funcionalidades e canal de sugestões.",
  },
];
