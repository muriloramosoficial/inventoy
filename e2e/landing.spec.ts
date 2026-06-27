import { test, expect } from "@playwright/test";

test.describe("Landing Page", () => {
  test("should load with correct title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/INVENTOY/);
  });

  test("should display pricing section", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Free").first().waitFor();
    await page.getByText("Starter").waitFor();
    await page.getByText("Pro").waitFor();
    await page.getByText("Enterprise").waitFor();
  });

  test("should navigate to login", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Entrar", { exact: true }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("API Docs Page", () => {
  test("should load API documentation", async ({ page }) => {
    await page.goto("/docs/api");
    await expect(page.getByText("API INVENTOY")).toBeVisible();
    await expect(page.getByText("Listar Produtos")).toBeVisible();
    await expect(page.getByText("cURL")).toBeVisible();
  });
});

test.describe("Static Pages", () => {
  test("should load privacy policy", async ({ page }) => {
    await page.goto("/privacidade");
    await expect(page.getByText("Política de Privacidade")).toBeVisible();
  });

  test("should load terms of service", async ({ page }) => {
    await page.goto("/termos");
    await expect(page.getByText("Termos de Serviço")).toBeVisible();
  });
});
