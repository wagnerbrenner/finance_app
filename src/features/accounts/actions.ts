"use server";

import { createAccount as create, deleteAccount as remove } from "@/features/finance/actions";

export async function createAccount(data: FormData) {
  return create(data);
}

export async function deleteAccount(data: FormData) {
  return remove(data);
}
