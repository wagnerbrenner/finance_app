import { expect, test } from "@playwright/test";

test.describe("smoke", () => {
  test("landing shows brand and CTAs without support chat", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/organizar o dinheiro/i);
    await expect(
      page.getByRole("link", { name: /mês grátis|começar grátis|criar conta/i }).first(),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: /abrir ajuda/i })).toHaveCount(0);
  });

  test("login page renders without support chat", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText(/entra e organiza/i)).toBeVisible();
    await expect(page.getByLabel(/e-mail/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /abrir ajuda/i })).toHaveCount(0);
  });

  test("signup page renders", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText(/começa agora/i)).toBeVisible();
  });
});
