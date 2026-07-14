# Finance OS

SaaS pessoal de gestão financeira (ERP + planejador + CFO).

## Setup

1. `cp .env.example .env.local` e preencha as variáveis
2. No Supabase SQL Editor (ou scripts), rode na ordem:
   - `supabase/migrations/0000_phase0_profiles.sql`
   - `supabase/migrations/0001_domain_schema.sql`
   - `supabase/migrations/0002_ux_renda_consorcio.sql`
3. Auth → Email: desative **Confirm email** em desenvolvimento
4. `npm install && npm run dev`

## Módulos

| Rota | Função |
|------|--------|
| `/dashboard` | KPIs, fluxo, projeções, advisor, vencimentos |
| `/app/contas` | Contas com saldo calculado |
| `/app/transacoes` | Lançamentos via modal (+ CTA no topbar) |
| `/app/cartoes` | Cartões, parcelas e recorrências |
| `/app/dividas` | Dívidas/financiamentos + simulador |
| `/app/metas` | Metas com progresso |
| `/app/investimentos` | Carteira + consórcios |
| `/app/renda-extra` | Uber e freelance |
| `/app/relatorios` | Relatórios |

Notificações in-app: sino no topbar (recorrências, dívidas, parcelas, consórcios).
