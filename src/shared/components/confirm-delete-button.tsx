"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { actionToast } from "./action-toast";
import { LaunchDialog } from "./launch-dialog";

import type { ActionResult } from "@/features/finance/types";

export function ConfirmDeleteButton({
  id,
  path,
  action,
  label = "registro",
}: {
  id: string;
  path: string;
  action: (data: FormData) => Promise<ActionResult>;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  async function remove() {
    const data = new FormData();
    data.set("id", id);
    data.set("path", path);
    if (await actionToast(() => action(data), "Registro excluído.")) setOpen(false);
  }
  return (
    <LaunchDialog title={`Excluir ${label}?`} open={open} onOpenChange={setOpen} trigger={<Button variant="ghost" size="icon-sm" aria-label={`Excluir ${label}`}><Trash2 /></Button>}>
      <DialogFooter>
        <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
        <Button variant="destructive" onClick={() => void remove()}>Excluir</Button>
      </DialogFooter>
    </LaunchDialog>
  );
}
