import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { TcheAuthShell } from "@/features/auth/components/tche-auth-shell";

export const metadata: Metadata = {
  title: "Entrar",
};

export default function LoginPage() {
  return (
    <TcheAuthShell
      title="Entra aí, tchê"
      subtitle="Bota o e-mail e a senha — vamos botar as contas em ordem."
    >
      <Suspense fallback={<p className="text-sm text-[#A8C4B8]">Carregando…</p>}>
        <LoginForm />
      </Suspense>
    </TcheAuthShell>
  );
}
