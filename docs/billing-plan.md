# Plano de cobrança — Te Organiza

Documento estratégico (sem integração de pagamento nesta versão). Preços pensados para ser acessíveis e competitivos frente a produtos como [Planilha by UdinePay](https://planilha.udinepay.com/) (Pro ~R$ 14,90/mês).

## Posicionamento

- **Grátis forte** para adquirir usuários e gerar hábito.
- **Pro acessível** um pouco abaixo do mercado (~R$ 12,90/mês) para converter quem quer patrimônio/investimentos e lembretes.
- Trial curto **sem cartão** (3–7 dias do Pro) quando o checkout existir — reduz fricção.

## Planos sugeridos

### Grátis — R$ 0

Para o dia a dia:

- Transações e categorias ilimitadas
- Importação de extrato (CSV/OFX)
- Contas, renda, recorrentes, dívidas, metas
- Dashboard (receitas, despesas, saldo, gráficos)
- SAC / ajuda no app

### Pro — R$ 12,90/mês ou R$ 99/ano

Equivale a ~R$ 8,25/mês no anual (desconto ~36%).

Tudo do Grátis, mais:

- Investimentos: carteira, aportes e alocação
- Visão de patrimônio (bens + dívidas + evolução)
- Lembretes por e-mail de vencimentos (volume maior / prioridade)
- Futuro: sync Open Finance / agregadores (quando houver custo de provedor coberto pela assinatura)
- Futuro: calculadoras (juros, reserva, independência)

**Por que esses valores**

| Critério | Decisão |
|----------|---------|
| Ticket baixo | Facilita “testar sem pensar” |
| Anual com desconto | Melhora LTV e previsibilidade |
| Grátis completo no core | Evita muro de paywall cedo demais |

## O que fica no Grátis vs Pro (produto atual)

Hoje o app já expõe investimentos e várias áreas sem gate. Antes de cobrar de verdade:

1. Definir feature flags (`plan = free | pro`)
2. Soft-gate no Pro (mostrar UI + CTA “Assinar”) ou hard-gate
3. Migrar usuários early-adopter com grace period

## Fluxo futuro — Mercado Pago (assinatura cartão)

### Modelo recomendado

1. **Checkout próprio + Preference / Assinaturas Mercado Pago** (ou Checkout Pro com recorrência).
2. Usuário escolhe Mensal ou Anual na página `/precos` (ou modal).
3. Redireciona / embute checkout MP com cartão.
4. Webhook MP → API Te Organiza atualiza `subscriptions`.
5. App lê `subscriptions.status` para liberar Pro.

### Eventos / webhooks a tratar

- `subscription_authorized` / pagamento aprovado → `active`
- `payment` rejected / overdue → `past_due` + e-mail
- cancelamento → `canceled` no fim do período pago

### Tabelas sugeridas (futuro)

- `subscriptions`: user_id, mp_subscription_id, plan (`monthly`|`annual`), status, current_period_end, created_at
- `subscription_events`: payload bruto do webhook (auditoria)

### Trial sem cartão

- Ao signup: `trial_ends_at = now() + 3 days`, `plan_effective = pro`
- Depois do trial: volta a `free` até assinar
- Não exigir cartão no trial (conversão honest + LGPD-friendly)

### Segurança

- Validar assinatura do webhook MP
- Nunca confiar só no client
- Idempotência por `payment_id` / `event_id`

## Checklist legal antes de cobrar

- [ ] Página Privacidade
- [ ] Página Termos de uso (cancelamento, renovação, reembolso)
- [ ] CNPJ / dados do prestador no checkout
- [ ] Política clara de cancelamento (“cancele quando quiser”)

## Fora de escopo agora

- SDK Mercado Pago
- Webhooks
- UI de cartão / checkout real
- Feature flags de plano no código

## Próximo passo de produto (quando for implementar)

1. Conta Mercado Pago + credenciais de teste
2. Migration `subscriptions`
3. `POST /api/billing/checkout` + `POST /api/billing/webhook`
4. Página preços com CTAs reais
5. Gates no app (investimentos / patrimônio / e-mail reminders volume)
