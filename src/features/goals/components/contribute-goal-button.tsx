"use client";

import { useState } from "react";
import { PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actionToast } from "@/shared/components/action-toast";
import { FormField } from "@/shared/components/form-field";
import { FormSelect } from "@/shared/components/form-select";
import { LaunchDialog } from "@/shared/components/launch-dialog";
import { contributeToGoal } from "@/features/finance/actions";
import { localDateISO } from "@/shared/lib/formatters";

export function ContributeGoalButton({
  goalId,
  goalName,
  accounts,
  triggerLabel,
}: {
  goalId: string;
  goalName: string;
  accounts: { id: string; name: string }[];
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  async function submit(formData: FormData) {
    formData.set("path", "/app/metas");
    formData.set("goalId", goalId);
    if (await actionToast(() => contributeToGoal(formData), "Aporte registrado.")) setOpen(false);
  }

  return (
    <LaunchDialog
      title={`Aporte · ${goalName}`}
      open={open}
      onOpenChange={setOpen}
      trigger={
        triggerLabel ? (
          <Button type="button" variant="outline" size="sm" className="cursor-pointer">
            {triggerLabel}
          </Button>
        ) : (
          <Button type="button" variant="ghost" size="icon-sm" aria-label="Registrar aporte">
            <PiggyBank />
          </Button>
        )
      }
    >
      <form action={submit} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField name="amount" label="Valor" type="number" min="0.01" step="0.01" required />
          <FormField name="date" label="Data" type="date" defaultValue={localDateISO()} required />
          <FormSelect
            name="accountId"
            label="Conta"
            className="sm:col-span-2"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          />
        </div>
        <Button type="submit" className="h-11 w-full sm:ml-auto sm:w-auto">
          Registrar aporte
        </Button>
      </form>
    </LaunchDialog>
  );
}
