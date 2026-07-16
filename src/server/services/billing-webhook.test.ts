import { describe, expect, it } from "vitest";

function eventKey(topic: string | null, resourceId: string | null) {
  return resourceId && topic ? `${topic}:${resourceId}` : null;
}

describe("billing webhook idempotency key", () => {
  it("builds stable event id from topic + resource", () => {
    expect(eventKey("payment", "123")).toBe("payment:123");
    expect(eventKey(null, "123")).toBeNull();
  });
});
