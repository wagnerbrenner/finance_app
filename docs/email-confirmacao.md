# E-mail de confirmação (Finora)

O visual do e-mail **não vem do código Next.js** — ele é configurado no painel do Supabase.
O app já envia o link de confirmação para a URL de produção via `emailRedirectTo`.

## 1. Site URL e redirects (obrigatório para ir à prod)

No Supabase → **Authentication → URL Configuration**:

| Campo | Valor |
|--------|--------|
| **Site URL** | `https://finance-app-nine-blush.vercel.app` |
| **Redirect URLs** | `https://finance-app-nine-blush.vercel.app/auth/callback` |
| | `http://localhost:3000/auth/callback` (só para dev) |

Na Vercel, confirme a env:

`NEXT_PUBLIC_SITE_URL=https://finance-app-nine-blush.vercel.app`

## 2. Template próprio (Confirm signup)

1. Abra o HTML: [`confirm-signup.html`](./email-templates/confirm-signup.html)
2. Supabase → **Authentication → Email Templates → Confirm signup**
3. **Subject:** `Confirme sua conta no Finora`
4. Cole o HTML completo (substitua o template padrão em inglês)
5. Salve

O botão usa `{{ .ConfirmationURL }}` (variável do Supabase). Esse link já inclui o redirect para `/auth/callback` na prod.

## 3. (Recomendado) SMTP próprio — Resend

Sem SMTP custom, o remetente continua `noreply@mail.app.supabase.io` e o rodapé “powered by Supabase”.

**Authentication → SMTP Settings:**

- Host: `smtp.resend.com`
- Port: `465` (ou `587`)
- User: `resend`
- Pass: sua `RESEND_API_KEY`
- Sender: ex. `Finora <onboarding@resend.dev>` ou domínio verificado no Resend

## 4. Testar

1. Delete o usuário de teste (se precisar) e cadastre de novo **pelo site de produção**
2. O e-mail deve vir em PT-BR com marca Finora
3. O link deve abrir `https://finance-app-nine-blush.vercel.app/auth/callback?...` e depois o painel/login

## Outros templates (opcional)

No mesmo painel dá para customizar **Magic Link**, **Reset Password**, etc., com o mesmo visual.
