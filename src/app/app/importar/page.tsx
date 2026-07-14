import { and, eq, isNull } from "drizzle-orm";
import { AppShell } from "@/features/shell/components/app-shell";
import { PageHeader } from "@/shared/components/page-header";
import { CsvImportForm } from "@/features/import/components/csv-import-form";
import { requireUserId } from "@/server/auth";
import { db } from "@/server/db";
import { accounts } from "@/server/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ImportPage() {
  const userId = await requireUserId();
  const accountRows = await db
    .select({ id: accounts.id, name: accounts.name })
    .from(accounts)
    .where(and(eq(accounts.userId, userId), isNull(accounts.deletedAt)));

  return (
    <AppShell title="Importar">
      <div className="space-y-6">
        <PageHeader
          title="Importar extrato"
          description="CSV/OFX do banco (Nubank e similares). Sem sync automático — veja a documentação de integrações."
        />
        <Card>
          <CardHeader>
            <CardTitle>Upload</CardTitle>
          </CardHeader>
          <CardContent>
            {accountRows.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Cadastre uma conta em Contas antes de importar.
              </p>
            ) : (
              <CsvImportForm accounts={accountRows} />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
