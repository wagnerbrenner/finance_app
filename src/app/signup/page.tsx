import type { Metadata } from "next";
import { SignupForm } from "@/features/auth/components/signup-form";
import { BrandAuthShell } from "@/features/auth/components/brand-auth-shell";

export const metadata: Metadata = {
  title: "Criar conta",
};

export default function SignupPage() {
  return (
    <BrandAuthShell
      title="Começa agora"
      subtitle="Cria tua conta e deixa o Te Organiza no comando do dinheiro."
    >
      <SignupForm />
    </BrandAuthShell>
  );
}
