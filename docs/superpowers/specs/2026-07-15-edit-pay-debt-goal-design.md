# Design: Editar tudo · Pagar dívida · Aporte em meta

**Date:** 2026-07-15  
**Status:** Approved (user: abordagem 1 + editar em todas as listas)

## Goals

1. **Editar** qualquer registro listado (contas, transações, renda/salário, freela/uber, dívidas, metas, cartões, parcelamentos, recorrências de cartão, investimentos, consórcios, contas recorrentes).
2. **Pagar vencimento da dívida:** cria despesa na conta, abate saldo, avança `dueDate` +1 mês.
3. **Aporte em meta:** cria despesa na conta + soma `goals.currentAmount`; disponível no Novo lançamento e na página Metas.

## Approach

- Reusar `LaunchDialog` / padrão FormData.
- Novo `EditEntityDialog` (lápis) espelhando create.
- `update*` server actions espelhando `create*`.
- `payDebtDue` e `contributeToGoal` (também via `createLaunch` com tipo aporte).
- `transactions.goal_id` opcional para vincular aportes.

## Out of scope

- Histórico completo de pagamentos de dívida / estorno automático meta↔tx ao editar.
