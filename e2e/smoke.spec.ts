import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("landing shows brand and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/ganha/i);
    await expect(page.getByRole("link", { name: /criar conta grátis/i }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /abrir ajuda/i })).toBeVisible();
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/entra e organiza/i)).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText(/começa agora/i)).toBeVisible();
  });

  test("support FAQ shortcut replies", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /abrir ajuda/i }).click();
    await page.getByRole("button", { name: /planos e preços/i }).click();
    await expect(page.getByText(/r\$ 12,90/i).first()).toBeVisible({ timeout: 10_000 });
  });
});
