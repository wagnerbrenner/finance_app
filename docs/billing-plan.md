# Plano de cobrança — Te Organiza

## Modelo

- **Degustação Pro: primeiro mês** completo sem cartão no signup (`trial_ends_at = created_at + 1 month`).
- Depois: **Freemium** — core Grátis + Pro opcional.
- Gateway: **Mercado Pago** (assinaturas / preapproval + webhooks).
- Stripe: alternativa futura (Billing SaaS / internacional) — não integrado agora.

## Preços Pro

| Ciclo | Valor | Equivalente |
|-------|-------|-------------|
| Mensal | R$ 12,90/mês | — |
| Anual | R$ 108,36/ano | ~R$ 9,03/mês (**~30% off**) |

Constantes em `src/shared/lib/billing.ts`.

## O que cada plano inclui

### Grátis

- Lançamentos, categorias, contas, renda, recorrentes, dívidas, metas
- Painel com gráficos
- SAC no app

### Pro (trial, pago ou `account_tier = test`)

- Tudo do Grátis
- **Insights** (`/app/insights`)
- Investimentos avançados
- Lembretes por e-mail (cron)
- Futuro: import/conexão bancária

## Contas teste

`profiles.account_tier = 'test'` — Pro permanente, sem modal/checkout.

```bash
node scripts/set-account-tier.mjs voce@email.com test
```

## Gestão da assinatura (app)

Em `/app/assinatura` o usuário vê:

- Status (trial / Pro / Grátis / cancelamento agendado)
- Se **pagou o ciclo atual**
- Histórico de pagamentos
- Assinar mensal/anual (redirect MP)
- **Cancelar recorrência** (Pro até `current_period_end`)

## Integração Mercado Pago

Env:

- `MERCADOPAGO_ACCESS_TOKEN` (obrigatório para checkout)
- `MERCADOPAGO_WEBHOOK_SECRET` (opcional; query/header)
- `MERCADOPAGO_PREAPPROVAL_PLAN_ID_MONTHLY` / `_ANNUAL` (opcional; senão usa `auto_recurring` inline)

Rotas:

- `POST /api/billing/checkout` — cria preapproval, retorna `init_point`
- `POST /api/billing/webhook` — payments + preapproval
- `POST /api/billing/cancel` — cancela no MP + `cancel_at_period_end`

Webhook no painel MP: `https://SEU_DOMINIO/api/billing/webhook`

## Tabelas

Migration `0009_billing.sql`: `account_tier`, `trial_ends_at`, `subscriptions`, `subscription_payments`, `subscription_events`.

## Legal (antes de cobrar em produção)

- [ ] Privacidade
- [ ] Termos (cancelamento, renovação)
- [ ] CNPJ / dados do prestador no MP
