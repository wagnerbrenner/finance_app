import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { BrandAuthShell } from "@/features/auth/components/brand-auth-shell";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <BrandAuthShell
      title="Entra e organiza"
      subtitle="E-mail e senha — vamos colocar o bolso em ordem."
    >
      <Suspense fallback={<p className="text-sm text-slate-400">Carregando…</p>}>
        <LoginForm />
      </Suspense>
    </BrandAuthShell>
  );
}
