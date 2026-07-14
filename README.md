# Finance OS

SaaS pessoal de gestão financeira (ERP + planejador + CFO).

## Stack

Next.js (App Router), TypeScript, Supabase Auth, PostgreSQL, Drizzle ORM, Tailwind, shadcn/ui, TanStack Query, Zustand, Recharts.

## Setup

1. `cp .env.example .env.local` e preencha as variáveis
2. No Supabase SQL Editor, rode na ordem:
   - `supabase/migrations/0000_phase0_profiles.sql`
   - `supabase/migrations/0001_domain_schema.sql`
3. Auth → Providers → Email: desative **Confirm email** em desenvolvimento
4. `npm install && npm run dev`

## Módulos

| Rota | Função |
|------|--------|
| `/dashboard` | KPIs, fluxo 30d, projeções, advisor |
| `/app/contas` | Contas bancárias |
| `/app/transacoes` | Receitas e despesas |
| `/app/cartoes` | Cartões, parcelas, recorrências |
| `/app/dividas` | Dívidas + simulação de amortização |
| `/app/metas` | Metas com progresso |
| `/app/investimentos` | Carteira |
| `/app/uber` | Ganhos Uber + margem/simulador |
| `/app/relatorios` | Categorias e gráfico mensal |

## Arquitetura

Feature-based em `src/features`, persistência em `src/server` (Drizzle), UI em `src/components/ui`.
