import { describe, expect, it } from "vitest";
import { brDateToIso, formatBRL, isoToBrDate } from "@/shared/lib/formatters";

describe("formatters", () => {
  it("formats BRL", () => {
    expect(formatBRL(1234.5)).toMatch(/1\.234,50/);
  });

  it("converts br date to iso", () => {
    expect(brDateToIso("15/07/2026")).toBe("2026-07-15");
  });

  it("converts iso to br date", () => {
    expect(isoToBrDate("2026-07-15")).toBe("15/07/2026");
  });
});
