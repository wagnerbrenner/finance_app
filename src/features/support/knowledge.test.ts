import { describe, expect, it } from "vitest";
import { matchSupportIntent } from "@/features/support/knowledge";

describe("matchSupportIntent", () => {
  it("matches CSV import questions", () => {
    const r = matchSupportIntent("Como importar extrato CSV do Nubank?");
    expect(r.escalated).toBe(false);
    expect(r.intentId).toBe("import_csv");
    expect(r.reply.toLowerCase()).toContain("importar");
  });

  it("matches pricing", () => {
    const r = matchSupportIntent("Quais são os planos grátis e Pro?");
    expect(r.escalated).toBe(false);
    expect(r.intentId).toBe("pricing");
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
