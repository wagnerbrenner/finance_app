"use client";

import { TransactionDialog } from "@/features/transactions/components/transaction-dialog";

/** Um único hub de lançamento para FAB mobile + botão desktop. */
export function LaunchHost() {
  return <TransactionDialog global />;
}
