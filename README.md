# Finance OS

SaaS pessoal de gestão financeira (ERP + planejador + CFO).

## Stack

Next.js (App Router), TypeScript, Supabase Auth, PostgreSQL, Drizzle ORM, Tailwind, shadcn/ui, TanStack Query, Zustand.

## Setup

1. Copie o ambiente:

```bash
cp .env.example .env.local
```

2. Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `DATABASE_URL` e `NEXT_PUBLIC_SITE_URL`.

3. No Supabase SQL Editor, rode [`supabase/migrations/0000_phase0_profiles.sql`](supabase/migrations/0000_phase0_profiles.sql).

4. Ative Email e Google em Auth → Providers. Redirect: `http://localhost:3000/auth/callback`.

5. Instale e rode:

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` — desenvolvimento
- `npm run build` — build de produção
- `npm run db:generate` — gerar migrations Drizzle
- `npm run db:studio` — Drizzle Studio

## Arquitetura

Feature-based em `src/features`, persistência em `src/server` (repositories → services → server actions), UI compartilhada em `src/shared` e `src/components/ui`.
