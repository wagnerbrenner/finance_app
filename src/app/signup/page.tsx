import type { Metadata } from "next";
import { SignupForm } from "@/features/auth/components/signup-form";
import { TcheAuthShell } from "@/features/auth/components/tche-auth-shell";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function SignupPage() {
  return (
    <TcheAuthShell
      title="Bora organizar"
      subtitle="Cria tua conta e deixa o gaúcho cuidar do bolso com você."
    >
      <SignupForm />
    </TcheAuthShell>
  );
}
