"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actionToast } from "@/shared/components/action-toast";
import { FormField } from "@/shared/components/form-field";
import { FormSelect } from "@/shared/components/form-select";
import { LaunchDialog } from "@/shared/components/launch-dialog";
import { payDebtDue } from "@/features/finance/actions";
import { localDateISO } from "@/shared/lib/formatters";

export function PayDebtButton({
  debtId,
  debtName,
  defaultAmount,
  accounts,
}: {
  debtId: string;
  debtName: string;
  defaultAmount: number;
  accounts: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);

  async function submit(formData: FormData) {
    formData.set("path", "/app/dividas");
    formData.set("id", debtId);
    if (await actionToast(() => payDebtDue(formData), "Pagamento registrado.")) setOpen(false);
  }

  return (
    <LaunchDialog
      title={`Paguei · ${debtName}`}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Marcar pagamento do mês">
          <CheckCircle2 />
        </Button>
      }
    >
      <form action={submit} className="flex flex-col gap-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            name="amount"
            label="Valor pago"
            type="number"
            min="0.01"
            step="0.01"
            defaultValue={defaultAmount > 0 ? String(defaultAmount) : undefined}
            required
          />
          <FormField name="date" label="Data" type="date" defaultValue={localDateISO()} required />
          <FormSelect
            name="accountId"
            label="Conta"
            className="sm:col-span-2"
            options={accounts.map((a) => ({ value: a.id, label: a.name }))}
          />
        </div>
        <Button type="submit" className="h-11 w-full sm:ml-auto sm:w-auto">
          Confirmar pagamento
        </Button>
      </form>
    </LaunchDialog>
  );
}
