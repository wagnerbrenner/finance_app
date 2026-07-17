import { describe, expect, it } from "vitest";
import { isFeedbackIntent, matchSupportIntent } from "@/features/support/knowledge";

describe("matchSupportIntent", () => {
  it("matches how to launch expense", () => {
    const r = matchSupportIntent("Como eu registro um gasto no app?");
    expect(r.escalated).toBe(false);
    expect(r.intentId).toBe("transactions");
  });

  it("matches billing / cancel", () => {
    const r = matchSupportIntent("Como funciona a assinatura e cancelar?");
    expect(r.escalated).toBe(false);
    expect(r.intentId).toBe("billing");
  });

  it("detects feedback intent", () => {
    expect(isFeedbackIntent("Quero sugerir uma melhoria")).toBe(true);
    const r = matchSupportIntent("Seria legal ter exportar PDF");
    expect(r.escalated).toBe(false);
    expect(r.openFeedback).toBe(true);
  });

  it("does not treat signup as primary help", () => {
    const r = matchSupportIntent("Como criar conta e confirmar e-mail?");
    // may escalate or miss signup intent — must not be signup_login
    expect(r.intentId).not.toBe("signup_login");
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
