"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { confirmRecurringOccurrence, skipRecurringOccurrence } from "@/features/finance/actions";
import { actionToast } from "@/shared/components/action-toast";
import { FormField } from "@/shared/components/form-field";
import { LaunchDialog } from "@/shared/components/launch-dialog";
import { formatBRL } from "@/shared/lib/formatters";

export function ConfirmOccurrenceDialog({
  occurrenceId,
  billName,
  expectedAmount,
}: {
  occurrenceId: string;
  billName: string;
  expectedAmount: number;
}) {
  const [open, setOpen] = useState(false);

  async function submit(data: FormData) {
    data.set("id", occurrenceId);
    data.set("path", "/app/recorrentes");
    if (await actionToast(() => confirmRecurringOccurrence(data), "Pagamento confirmado.")) {
      setOpen(false);
    }
  }

  return (
    <LaunchDialog
      title="Confirmar pagamento"
      description={`${billName} · estimado ${formatBRL(expectedAmount)}`}
      open={open}
      onOpenChange={setOpen}
      trigger={<Button type="button" size="sm">Confirmar</Button>}
    >
      <form action={submit} className="grid gap-3">
        <FormField
          name="actualAmount"
          label="Valor real pago"
          type="number"
          step="0.01"
          min="0.01"
          defaultValue={String(expectedAmount)}
          required
        />
        <FormField
          name="date"
          label="Data do pagamento"
          type="date"
          defaultValue={new Date().toISOString().slice(0, 10)}
          required
        />
        <div className="flex justify-end">
          <Button type="submit">Registrar pagamento</Button>
        </div>
      </form>
    </LaunchDialog>
  );
}

export function SkipOccurrenceButton({ occurrenceId }: { occurrenceId: string }) {
  return (
    <form
      action={async (data) => {
        data.set("id", occurrenceId);
        data.set("path", "/app/recorrentes");
        await actionToast(() => skipRecurringOccurrence(data), "Ocorrência ignorada.");
      }}
    >
      <Button type="submit" variant="ghost" size="sm">
        Pular
      </Button>
    </form>
  );
}
