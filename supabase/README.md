# Supabase setup

## Email rate limit (importante)

O SMTP padrão do Supabase free permite ~2 e-mails/hora. Signup com **Confirm email** ligado estoura isso rápido.

Para uso pessoal:
1. **Authentication → Providers → Email** → desative **Confirm email**
2. Ou crie o usuário no dashboard (**Users → Add user**, Auto Confirm)
3. Ou rode `npx tsx scripts/create-user.mts`

## Checklist

1. Rodar `supabase/migrations/0000_phase0_profiles.sql` no SQL Editor
2. Email provider ligado; Confirm email OFF em desenvolvimento
3. URL Configuration: Site URL `http://localhost:3000`, Redirect `http://localhost:3000/auth/callback`
4. Copiar `.env.example` → `.env.local`
