# Integrações bancárias (Nubank e Open Finance) — Finora

Plano para conectar bancos brasileiros ao Finora: o que dá para fazer **grátis agora**, o que custa, e como implementar sync automático depois.

---

## Resumo executivo

| Caminho | Custo | Esforço | Quando usar |
|--------|-------|---------|-------------|
| **CSV / OFX (já existe)** | Grátis | Baixo | Agora — Nubank e a maioria dos bancos |
| **Open Finance via agregador** (Pluggy, Belvo…) | Pago em produção (~R$ 2,5k–6k+/mês de entrada) | Médio/alto | Quando tiver usuários pagantes e precisar de sync automático |
| **API direta do Nubank** | Não existe para PF | — | Não é opção |
| **Scraping do app/site** | “Grátis” mas ilegal/frágil | Alto | **Não fazer** (quebra ToS, LGPD, quebra fácil) |

**Conclusão:** Nubank **não oferece API pública gratuita** para apps pessoais. O caminho regulado é **Open Finance Brasil** via um **ITP / agregador autorizado**. Até lá, o Finora deve dobrar na importação de extrato (já em `/app/importar`).

---

## 1. Situação atual no produto

| Banco / canal | API gratuita pública? | No Finora hoje |
|---------------|----------------------|----------------|
| Nubank | Não | Export CSV → **Importar** |
| Itaú, Inter, C6, Bradesco, etc. | Em geral não para apps independentes | CSV / OFX |
| Open Finance (Pluggy, Belvo, Quanto, Klavi…) | Sandbox grátis; produção paga | **Não implementado** (planejado abaixo) |

### Como importar agora (gratuito)

1. No app do banco, exporte o extrato (CSV ou OFX).
2. No Finora → **Importar** (`/app/importar`).
3. Escolha a conta destino → upload → revise → confirme.

**CSV:** `;` ou `,`; valores BR (`1.234,56`); datas `dd/mm/yyyy`; colunas Data / Valor / Descrição (Nubank costuma trazer identificador). Negativo = despesa; positivo = receita.  
**OFX:** blocos `<STMTTRN>` com `TRNAMT`, `DTPOSTED`, `MEMO`/`NAME`.

---

## 2. Por que não “integrar Nubank de graça”

1. **Não há API pública Nubank** para consumidores/apps indie lerem extrato.
2. **Open Finance** exige consentimento no app do banco + participante autorizado pelo Bacen.
3. Apps indie **não** conectam direto ao Nubank; usam um **agregador** (Pluggy, Belvo, etc.) que já é participante/parceiro do ecossistema.
4. Scraping viola termos, é instável e arriscado juridicamente — fora de escopo.

---

## 3. Opções de agregadores (Brasil)

Valores são **ordens de grandeza** (2025–2026); confirme com vendas — listas mudam.

| Provedor | Sandbox | Produção (entrada típica) | Nubank via OF | Notas |
|----------|---------|---------------------------|---------------|--------|
| **[Pluggy](https://pluggy.ai)** | Trial ~14 dias; “Meu Pluggy” p/ projetos pessoais em alguns casos | A partir de ~**R$ 2.500/mês** (plano básico citado publicamente) | Sim (OF + connectors) | Forte cobertura BR, widget Connect |
| **[Belvo](https://belvo.com)** | Sandbox **grátis** (só teste) | A partir de ~**US$ 1.000 / ~R$ 6.000/mês** | Sim (`ofnubank_br_retail`) | LatAm; pricing por volume |
| Quanto / Klavi / Celcoin | Varia | Sob consulta | Via OF | Avaliar se o caso for crédito/analytics |

**Grátis de verdade em produção?** Quase nunca para sync multi-usuário. O que é grátis:

- Importação CSV/OFX no Finora
- Sandbox dos agregadores (sem clientes reais)
- Às vezes tier “developer / personal project” (ex.: iniciativas tipo Meu Pluggy) — **não** escala para SaaS

---

## 4. Plano de implementação (fases)

### Fase 0 — Agora (custo R$ 0)

- Manter e melhorar `/app/importar` (Nubank CSV, OFX genérico).
- UX: presets “Nubank”, “Inter”, “Itaú” com dicas de exportação.
- Dedupe por fingerprint (`data + valor + descrição + account_id`).

### Fase 1 — Descoberta (1–2 semanas, custo ~R$ 0)

1. Criar conta sandbox Pluggy **e/ou** Belvo.
2. Testar widget de consentimento com conta de teste.
3. Mapear payloads → modelo `transactions` do Finora.
4. Decidir provedor (recomendação inicial: **Pluggy** se foco 100% Brasil).

### Fase 2 — MVP Open Finance (2–4 semanas + custo mensal do provedor)

```
[Finora UI] → Connect Widget (Pluggy/Belvo)
     → usuário autoriza no Nubank/banco
     → agregador devolve item/link_id
     → Finora grava bank_connections
     → webhook ou cron sincroniza contas + lançamentos
     → dedupe → transactions (source = open_finance)
```

**Tabelas sugeridas**

- `bank_connections` — user_id, provider, external_item_id, institution, status, last_sync_at, consent_expires_at  
- `bank_raw_transactions` — payload JSON, hash único, connection_id  
- (opcional) `bank_accounts` — mapeamento conta agregador ↔ `accounts` do Finora  

**Jobs**

- Webhook `transactions/created|updated`
- Cron diário de fallback
- UI de reconciliação (match com lançamentos manuais)

**Compliance**

- LGPD: base legal = consentimento; retenção; exclusão
- Portal de gestão de consentimento (My Pluggy / My Belvo ou tela própria)
- Não armazenar senha do banco (só tokens do agregador)

### Fase 3 — Produto (depois do MVP)

- Sync incremental, categorização automática, alertas de fatura
- Multi-banco por usuário
- Precificação Finora: o custo do agregador entra no plano Pro

---

## 5. Estimativa de custo para o Finora

| Cenário | Custo mensal estimado | Observação |
|---------|----------------------|------------|
| Só CSV/OFX | **R$ 0** | Recomendado até validar produto |
| Sandbox OF | **R$ 0** | Sem usuários reais |
| Produção Pluggy (entrada) | **~R$ 2.500+** | Confirmar com sales |
| Produção Belvo (entrada) | **~R$ 6.000 / US$ 1.000+** | Confirmar com sales |
| Escala (muitos links) | Negociado por volume | MAU / connections / calls |

**Regra prática:** só assinar agregador quando a receita do Finora (ou orçamento) cobrir o piso mensal com folga.

---

## 6. Decisão recomendada

1. **Curto prazo:** CSV Nubank + OFX — grátis, já no app.  
2. **Médio prazo:** sandbox Pluggy, prototipar 1 fluxo “Conectar Nubank”.  
3. **Produção OF:** só com plano pago do agregador + LGPD/consentimento ok.

---

## 7. Fora de escopo (por enquanto)

- Scraping Nubank / Selenium
- API não oficial de terceiros sem contrato
- Pix initiation (PIS) — possível via mesmos agregadores, mas é outro produto

---

## Referências

- [Belvo — planos](https://belvo.com/pt-br/planos-precos/)
- [Belvo — instituições BR (incl. Nubank)](https://developers.belvo.com/products/aggregation_brazil/aggregation-brazil-institutions)
- [Pluggy](https://www.pluggy.ai/)
- Open Finance Brasil (Bacen) — consentimento e participantes autorizados
