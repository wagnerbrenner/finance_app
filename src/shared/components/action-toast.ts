"use client";

import { toast } from "sonner";

import type { ActionResult } from "@/features/finance/types";

export async function actionToast(action: () => Promise<ActionResult>, success = "Alterações salvas.") {
  try {
    const result = await action();
    if (result.ok) {
      toast.success(success);
      return true;
    }
    toast.error(result.error);
  } catch {
    toast.error("Não foi possível concluir a operação.");
  }
  return false;
}
