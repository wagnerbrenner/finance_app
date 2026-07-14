# Integrações bancárias — Finance OS

## Situação atual (este ciclo)

| Banco / canal | API gratuita pública? | Suporte no Finance OS |
|---------------|----------------------|------------------------|
| Nubank | Não | Export CSV → **Importar** (`/app/importar`) |
| Outros bancos BR | Em geral não (ou restrito) | CSV / OFX genérico |
| Open Finance (Pluggy, Belvo, etc.) | Pago / regulado | Planejado — não implementado |

Caminho **gratuito e imediato**: exportar o extrato no app do banco e importar no Finance OS.

## Como importar (agora)

1. No app do banco, exporte o extrato (CSV ou OFX).
2. Em Finance OS → **Importar**.
3. Escolha a **conta destino**.
4. Faça upload → revise o preview → confirme.

### Formato esperado (CSV)

O parser aceita:

- Delimitador `;` ou `,` (detectado automaticamente)
- Valores no padrão BR (`1.234,56` ou `-50,00`)
- Datas `dd/mm/yyyy` ou `yyyy-mm-dd`
- Colunas comuns: Data / Valor / Descrição (também Identificador do Nubank)

Valores negativos viram **despesa**; positivos, **receita**.

OFX mínimo: blocos `<STMTTRN>` com `TRNAMT`, `DTPOSTED`, `MEMO`/`NAME`.

## Arquitetura futura — Open Finance

Quando houver orçamento / necessidade de sync automático:

```
[App Finance OS]
    → OAuth no agregador (Pluggy / Belvo / equivalente)
    → Tokens por instituição (vault / encrypted)
    → Job de sync (cron / queue) puxa transações
    → Dedupe por fingerprint (data + valor + descrição + account)
    → Grava em `transactions` com origem `open_finance`
```

Componentes sugeridos:

1. Tabela `bank_connections` (user, provider, item_id, status, last_sync_at)
2. Tabela `bank_raw_transactions` (payload + hash único)
3. Worker diário + webhook do provedor
4. UI de conciliação (match com lançamentos manuais / recorrentes)

## Por que não “API Nubank free”

O Nubank **não oferece** API pública gratuita para clientes pessoa física. Scraping viola ToS e é frágil. Open Finance via instituição autorizada é o caminho regulado.

## Escopo fora deste ciclo

- Sync automático / OAuth
- Cotações de mercado
- Advisor com IA completo
