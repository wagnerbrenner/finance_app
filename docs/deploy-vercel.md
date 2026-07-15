# Publicar o Finance OS na Vercel

Guia completo para colocar o app online (Next.js + Supabase Auth + Postgres).

## Pré-requisitos

- Conta no [GitHub](https://github.com) com o repositório do projeto
- Conta no [Vercel](https://vercel.com)
- Projeto no [Supabase](https://supabase.com) com as migrations aplicadas

## 1. Migrations no Supabase

No **SQL Editor** do Supabase, execute nesta ordem (se ainda não rodou):

1. `supabase/migrations/0000_phase0_profiles.sql`
2. `supabase/migrations/0001_domain_schema.sql`
3. `supabase/migrations/0002_ux_renda_consorcio.sql`
4. `supabase/migrations/0003_recurring_bills.sql`
5. `supabase/migrations/0004_income_preferences.sql`

Confirme em **Authentication → Providers** que e-mail/senha está ativo.  
Para testes, desative **Confirm email** se o SMTP free limitar cadastros.

## 2. Connection string (pooler)

Na Vercel (serverless), use o **pooler** do Supabase, não o host `db.*` direto:

1. Supabase → **Project Settings → Database**
2. Connection string → modo **Transaction** (porta **6543**)
3. Copie algo como:

```text
postgresql://postgres.PROJECT_REF:SENHA@aws-0-REGION.pooler.supabase.com:6543/postgres
```

Isso vira a variável `DATABASE_URL`.

## 3. Variáveis de ambiente

No Vercel → Project → **Settings → Environment Variables**, defina:

| Variável | Valor |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | chave publishable (ou use `NEXT_PUBLIC_SUPABASE_ANON_KEY`) |
| `NEXT_PUBLIC_SITE_URL` | `https://finance-app-nine-blush.vercel.app` |
| `DATABASE_URL` | string do **pooler** (porta 6543) |
| `RESEND_API_KEY` | chave da API Resend |
| `EMAIL_FROM` | ex. `Finance OS <onboarding@resend.dev>` (ou domínio verificado) |
| `CRON_SECRET` | segredo longo (Vercel Cron envia `Authorization: Bearer …`) |

Aplique em **Production** (e Preview se quiser testar PRs).

## 4. Auth redirects no Supabase

**Authentication → URL Configuration**:

- **Site URL:** `https://finance-app-nine-blush.vercel.app`
- **Redirect URLs:** adicione  
  - `https://finance-app-nine-blush.vercel.app/auth/callback`  
  - `http://localhost:3000/auth/callback` (dev local)

**E-mail de confirmação branded:**

Siga [`docs/email-confirmacao.md`](email-confirmacao.md): Site URL de prod, template HTML em Email Templates, e SMTP Resend (opcional, para sair do remetente Supabase).

**Lembretes de vencimento:** cron diário em `vercel.json` (`/api/cron/due-reminders` às 11:00 UTC ≈ 08:00 BRT). Aplique a migration `0005_email_reminder_log.sql`.

## 5. Importar o projeto na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. **Import** o repositório GitHub do Finance OS
3. Framework: **Next.js** (detectado automaticamente)
4. Build Command: `npm run build` (padrão)
5. Confirme que as env vars do passo 3 estão preenchidas
6. Clique em **Deploy**

## 6. Testar após o deploy

1. Abra `https://finance-app-nine-blush.vercel.app/login`
2. Crie conta / entre (confirme e-mail se estiver ativo)
3. Confira o **Painel**
4. Faça um **Novo lançamento** (desktop) ou **+** (celular)
5. Abra **Renda** e complete o onboarding (freela/Uber ou só salário)

Se der erro de banco: revise `DATABASE_URL` (pooler) e se as migrations rodaram.  
Se login falhar: revise Site URL / Redirect URLs e `NEXT_PUBLIC_SITE_URL`.

## 7. Domínio próprio (opcional)

1. Vercel → Project → **Settings → Domains**
2. Adicione o domínio e siga o DNS indicado
3. Atualize `NEXT_PUBLIC_SITE_URL` e as URLs do Supabase Auth para o domínio novo
4. Redeploy (ou aguarde o próximo deploy)

## 8. Redeploys

Cada `git push` na branch conectada gera um deploy automático.  
Para forçar: Vercel → Deployments → **Redeploy**.

## Checklist rápido

- [ ] Migrations 0000–0005 no Supabase  
- [ ] Env vars na Vercel (incluindo pooler, Resend, CRON_SECRET)  
- [ ] Site URL + `/auth/callback` no Supabase  
- [ ] Template de confirmação branded + SMTP Resend  
- [ ] Deploy OK  
- [ ] Login + Painel + lançamento testados  

## Observações

- As migrations **não** rodam no `npm run build` — sempre aplique no Supabase manualmente.
- O módulo **Importar** está oculto na navegação; a rota `/app/importar` ainda existe se precisar.
- Relatórios foram fundidos no Painel (`/app/relatorios` redireciona).
- Em produção, evite expor senhas do banco; use só variáveis da Vercel.
