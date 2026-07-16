import { describe, expect, it } from "vitest";
import { matchSupportIntent } from "@/features/support/knowledge";

describe("matchSupportIntent", () => {
  it("says bank import is not active yet", () => {
    const r = matchSupportIntent("Como importar extrato CSV do Nubank?");
    expect(r.escalated).toBe(false);
    expect(r.intentId).toBe("import_coming");
    expect(r.reply.toLowerCase()).toMatch(/ainda não|nao esta|não está/);
  });

  it("matches pricing", () => {
    const r = matchSupportIntent("Quais são os planos grátis e Pro?");
    expect(r.escalated).toBe(false);
    expect(r.intentId).toBe("pricing");
  });

  it("matches how to launch expense", () => {
    const r = matchSupportIntent("Como eu registro um gasto no app?");
    expect(r.escalated).toBe(false);
    expect(r.intentId).toBe("transactions");
  });

  it("escalates unknown questions", () => {
    const r = matchSupportIntent("Quero integração com my custom blockchain wallet xyz");
    expect(r.escalated).toBe(true);
    expect(r.intentId).toBeNull();
  });

  it("greets short hi", () => {
    const r = matchSupportIntent("oi");
    expect(r.escalated).toBe(false);
    expect(r.intentId).toBe("greeting");
  });
});
