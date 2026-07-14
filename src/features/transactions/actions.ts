"use server";

import { createTransaction as create, deleteTransaction as remove } from "@/features/finance/actions";

export async function createTransaction(data: FormData) {
  return create(data);
}

export async function deleteTransaction(data: FormData) {
  return remove(data);
}
