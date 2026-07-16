# FAQ do Te Organiza — base do chat de ajuda

Documento mestre das respostas do assistente (widget SAC).  
O motor em `src/features/support/knowledge.ts` espelha estes tópicos com palavras-chave.  
**Regra:** só responder o que o produto faz de verdade. Sem inventar integração bancária, Nubank conectado ou importação automática ativa.

---

## O produto

**O que é o Te Organiza?**  
App web de finanças pessoais: você registra o que ganha e o que gasta, vê o mês em gráficos e acompanha contas, dívidas, metas e investimentos. Frase de marca: *Suas finanças, no controle.*

**Preciso instalar?**  
Não. Funciona no celular e no computador pelo navegador.

**É só para quem entende de finanças?**  
Não. A linguagem e o fluxo são para qualquer pessoa que recebe e gasta dinheiro.

**Tem anúncio?**  
Não.

---

## Conta e acesso

**Como criar conta?**  
Na home, “Criar conta” (ou `/signup`). Informe e-mail e senha e confirme o e-mail que chegar.

**Não recebi o e-mail de confirmação**  
Olhe spam/lixo eletrônico. Na tela de login use “Reenviar e-mail de confirmação”.

**Como entrar?**  
`/login` com e-mail e senha.

**Esqueci a senha**  
Na tela de login use a opção de recuperação de senha do Supabase (link por e-mail). Se não encontrar o botão ou o e-mail não chegar, fale com o suporte pelo chat (deixe seu e-mail).

**Posso usar no celular?**  
Sim. Abra o site no navegador do celular; o menu inferior ajuda a navegar.

---

## Lançamentos (gasto e receita)

**Como registro um gasto?**  
No app, botão **+ / Lançar** (barra superior ou atalho no celular). Informe valor, data, categoria e conta.

**Como registro uma receita?**  
Mesmo fluxo de lançar, escolhendo tipo receita — ou pela área **Renda**.

**Onde vejo tudo que lancei?**  
**Transações** lista os lançamentos. Dá para editar ou excluir.

**Errei um lançamento**  
Abra Transações (ou a lista da área), edite ou exclua e lance de novo se precisar.

---

## Painel (dashboard)

**O que aparece no Painel?**  
Receitas do mês, despesas do mês, saldo do mês, fluxo de caixa e gastos por categoria.

**O saldo não bate com o banco**  
O painel usa só o que você lançou no Te Organiza no mês atual. Se faltou algum gasto/receita ou a data está em outro mês, o número muda.

**Por que o gráfico está vazio?**  
Ainda não há lançamentos no mês, ou todos foram excluídos.

---

## Contas

**Para que serve Contas?**  
Representa onde o dinheiro “mora” (conta corrente, poupança, carteira etc.). Os lançamentos se ligam a uma conta.

**Preciso cadastrar várias?**  
Não. Pode começar com uma e ir adicionando depois.

---

## Categorias

**O que são categorias?**  
Grupos como alimentação, moradia, transporte — para o gráfico do mês fazer sentido. O app já traz categorias básicas no início.

---

## Recorrentes

**O que são recorrentes?**  
Receitas ou despesas que se repetem (salário, aluguel, streaming). Você cadastra uma vez e acompanha os vencimentos.

**Como marco que paguei?**  
Nas ocorrências do mês, marque como pago quando fizer o pagamento na vida real.

---

## Cartões

**O que faço em Cartões?**  
Cadastre cartões de crédito e acompanhe o que registrou ligado a eles. Não conecta sozinho ao banco/app do cartão.

---

## Dívidas

**Como uso Dívidas?**  
Registre o que você deve (parcelas, empréstimos) e vá marcando pagamentos do mês.

---

## Metas

**Como funcionam as metas?**  
Defina um objetivo (ex.: reserva, viagem) e registre aportes quando guardar dinheiro.

---

## Investimentos

**O que tem em Investimentos?**  
Você registra a carteira e os aportes manualmente. Não há cotação automática nem corretora conectada nesta versão.

---

## Renda

**Para que serve Renda?**  
Centraliza o que você ganha (salário, freela, etc.) e preferências de renda. Útil se sua entrada não é só um salário fixo.

---

## Avisos e lembretes

**O que são os avisos / sino?**  
Alertas de contas e vencimentos próximos ou atrasados, com base no que você cadastrou.

**Recebo e-mail de lembrete?**  
Lembretes por e-mail fazem parte do plano futuro (Pro). Hoje o foco é o aviso dentro do app.

---

## Importação de extrato / Nubank / CSV

**Posso importar CSV do Nubank (ou de outro banco)?**  
**Ainda não.** A importação automática de extrato **não está liberada** nesta versão.  
Por enquanto: lance gastos e receitas pelo botão **+**.  
Quando a importação estiver pronta, a gente avisa — não prometemos data no chat.

**Tem integração Open Finance / conectar banco?**  
Ainda não. Está no plano futuro (ver `docs/integrations-banking.md` e `docs/billing-plan.md`).

---

## Privacidade e segurança

**Meus dados ficam seguros?**  
Cada pessoa só vê os próprios registros. Não vendemos dados e não tem anúncio no app. Use senha forte e confirme o e-mail.

**Vocês pedem senha do banco?**  
Não. Nunca peça senha do banco, cartão ou app financeiro a ninguém — nem no chat.

---

## Planos e preço

**É grátis?**  
Sim. Hoje o core do app está liberado para organizar o dia a dia.

**O que vem no Grátis?**  
Lançamentos, categorias, contas, recorrentes, dívidas, metas, painel com gráficos e ajuda no app.

**O que é o Pro?**  
Sugestão futura: R$ 12,90/mês ou R$ 99/ano — investimentos avançados, visão de patrimônio, lembretes por e-mail e futuras integrações. **Cobrança ainda não está ativa.**

**Já posso pagar?**  
Ainda não. Crie a conta e use normalmente; quando a assinatura abrir, será pela página de preços.

---

## Ajuda humana

**O chat não resolveu**  
O assistente registra a dúvida e, se você deixar e-mail, o time responde. Fale com clareza o que tentou fazer e qual tela estava.

**Horário de resposta**  
Melhor esforço — não há SLA formal ainda.

---

## O que o assistente NÃO deve prometer

- Importação Nubank/CSV/OFX ativa  
- Conexão automática com banco  
- API de cotação de investimentos  
- Pagamento Pro / Mercado Pago já funcionando  
- App nativo na loja (só web por enquanto)
