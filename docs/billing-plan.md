# Plano de cobrança — Te Organiza

## Modelo

- **Degustação:** primeiro mês completo sem cartão (`trial_ends_at = created_at + 1 month`).
- **Depois:** só com assinatura paga. **Não há freemium / plano grátis eterno.**
- Sem pagamento após a degustação → app redireciona para `/app/assinatura` (acesso pausado).
- Gateway: **Mercado Pago** (assinaturas / preapproval + webhooks).
- Contas `account_tier = test` bypassam cobrança.

## Preços Pro

| Ciclo | Valor | Equivalente |
|-------|-------|-------------|
| Mensal | R$ 12,90/mês | — |
| Anual | R$ 108,36/ano | ~R$ 9,03/mês (**~30% off**) |

Constantes em `src/shared/lib/billing.ts`.

## O que a assinatura inclui

Tudo o que o app oferece hoje (lançamentos, painel, Insights, investimentos, lembretes, etc.) — liberado na degustação e mantido com Pro ativo.

## Contas teste

```bash
node scripts/set-account-tier.mjs voce@email.com test
```

## Gestão (`/app/assinatura`)

- Status (degustação / Pro / encerrada)
- Pagou o ciclo atual? + histórico
- Assinar mensal/anual · Cancelar recorrência

## Env Mercado Pago

- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET` (opcional)
- `MERCADOPAGO_PREAPPROVAL_PLAN_ID_MONTHLY` / `_ANNUAL` (opcional)

Webhook: `https://SEU_DOMINIO/api/billing/webhook`

## Legal

- [ ] Privacidade
- [ ] Termos (cancelamento, renovação, fim da degustação)
- [ ] CNPJ / dados do prestador no MP
