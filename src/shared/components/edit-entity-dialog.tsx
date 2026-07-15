"use client";

import { useState, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actionToast } from "@/shared/components/action-toast";
import { LaunchDialog } from "@/shared/components/launch-dialog";
import type { ActionResult } from "@/features/finance/types";

export function EditEntityDialog({
  title,
  path,
  action,
  successMessage = "Registro atualizado.",
  id,
  children,
}: {
  title: string;
  path: string;
  action: (data: FormData) => Promise<ActionResult>;
  successMessage?: string;
  id: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  async function submit(formData: FormData) {
    formData.set("path", path);
    formData.set("id", id);
    if (await actionToast(() => action(formData), successMessage)) setOpen(false);
  }

  return (
    <LaunchDialog
      title={title}
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Editar">
          <Pencil />
        </Button>
      }
    >
      <form action={submit} className="flex flex-col gap-4">
        <input type="hidden" name="id" value={id} />
        <div className="grid gap-3 sm:grid-cols-2">{children}</div>
        <div className="sticky bottom-0 -mx-4 border-t border-border/60 bg-popover px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
          <Button type="submit" className="h-11 w-full sm:ml-auto sm:w-auto">
            Salvar
          </Button>
        </div>
      </form>
    </LaunchDialog>
  );
}
