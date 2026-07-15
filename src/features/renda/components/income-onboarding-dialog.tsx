"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { saveIncomeOnboarding } from "@/features/finance/actions";
import { actionToast } from "@/shared/components/action-toast";
import { LaunchDialog } from "@/shared/components/launch-dialog";

export function IncomeOnboardingDialog({ open }: { open: boolean }) {
  const router = useRouter();
  const [hasFreelance, setHasFreelance] = useState(false);
  const [hasUber, setHasUber] = useState(false);
  const [isOpen, setIsOpen] = useState(open);

  async function submit() {
    const data = new FormData();
    data.set("path", "/app/renda");
    data.set("hasFreelance", hasFreelance ? "true" : "false");
    data.set("hasUber", hasUber ? "true" : "false");
    if (await actionToast(() => saveIncomeOnboarding(data), "Preferências salvas.")) {
      setIsOpen(false);
      router.refresh();
    }
  }

  async function salaryOnly() {
    const data = new FormData();
    data.set("path", "/app/renda");
    data.set("hasFreelance", "false");
    data.set("hasUber", "false");
    if (await actionToast(() => saveIncomeOnboarding(data), "Tudo certo — só salário por enquanto.")) {
      setIsOpen(false);
      router.refresh();
    }
  }

  return (
    <LaunchDialog
      title="Fontes de renda"
      open={isOpen}
      onOpenChange={() => {
        /* force choice — no dismiss without saving */
      }}
    >
      <div className="grid gap-4">
        <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4"
            checked={hasFreelance}
            onChange={(e) => setHasFreelance(e.target.checked)}
          />
          <span>
            <span className="font-medium">Freela</span>
            <span className="block text-muted-foreground">
              Projetos, consultoria, serviços avulsos
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-lg border p-3 text-sm">
          <input
            type="checkbox"
            className="mt-0.5 size-4"
            checked={hasUber}
            onChange={(e) => setHasUber(e.target.checked)}
          />
          <span>
            <span className="font-medium">Uber / apps</span>
            <span className="block text-muted-foreground">
              Corridas e entregas com custos (combustível, etc.)
            </span>
          </span>
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={() => void salaryOnly()}>
            Só salário por enquanto
          </Button>
          <Button type="button" onClick={() => void submit()}>
            Continuar
          </Button>
        </div>
      </div>
    </LaunchDialog>
  );
}
