"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/shared/components/form-field";
import { formatBRL } from "@/shared/lib/formatters";

type Debt = { id: string; name: string; balance: number; interestRate: number };

export function AmortizationSimulator({ debts }: { debts: Debt[] }) {
  const [amount, setAmount] = useState("1000");
  const amortization = Number(amount) || 0;
  const estimate = useMemo(
    () =>
      debts.map((debt) => ({
        ...debt,
        applied: Math.min(debt.balance, amortization),
        saved: Math.min(debt.balance, amortization) * (debt.interestRate / 100) * 12,
      })),
    [amortization, debts],
  );

  return (
    <Card>
      <CardHeader><CardTitle>Simulador de amortização</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <FormField name="amortization" label="Valor extra para amortizar" type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} />
        {estimate.length ? estimate.map((debt) => <div key={debt.id} className="border-b pb-3 last:border-0"><p className="font-medium">{debt.name}</p><p className="text-sm text-muted-foreground">Aplicando {formatBRL(debt.applied)}, a economia estimada em 12 meses é {formatBRL(debt.saved)}.</p></div>) : <p className="text-sm text-muted-foreground">Cadastre uma dívida para comparar uma amortização extra.</p>}
      </CardContent>
    </Card>
  );
}
