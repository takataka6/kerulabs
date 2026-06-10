import { test, expect } from "@playwright/test";

test.describe("コードラボページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/code-lab");
    await expect(page.locator("main")).toBeVisible({ timeout: 15000 });
  });

  test("コードラボページが表示される", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("カテゴリが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "プログラミング基礎" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "アーキテクチャ" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "テスト入門" }),
    ).toBeVisible();
  });

  test("プログラミング基礎のレッスンアイコンが表示される", async ({ page }) => {
    await expect(page.getByText("🏷️")).toBeVisible();
    await expect(page.getByText("👥")).toBeVisible();
    await expect(page.getByText("🚩")).toBeVisible();
    await expect(page.getByText("🔄")).toBeVisible();
    await expect(page.getByText("📋")).toBeVisible();
  });

  test("アーキテクチャのレッスンアイコンが表示される", async ({ page }) => {
    await expect(page.getByText("🏗️")).toBeVisible();
    await expect(page.getByText("📦")).toBeVisible();
    await expect(page.getByText("🔒")).toBeVisible();
    await expect(page.getByText("🏭")).toBeVisible();
  });

  test("全レッスンがReady状態である", async ({ page }) => {
    const readyBadges = page.getByText("Ready");
    await expect(readyBadges).toHaveCount(16);
  });

  test("レッスンをクリックするとレッスンページに遷移する", async ({ page }) => {
    await page.getByRole("button", { name: /Markdown/ }).click();
    await page.waitForURL("**/code-lab/lesson/markdown", { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "Markdown", exact: true }),
    ).toBeVisible({ timeout: 15000 });
  });

  test("レッスンページからレッスン一覧に戻れる", async ({ page }) => {
    await page.getByRole("button", { name: /Markdown/ }).click();
    await page.waitForURL("**/code-lab/lesson/markdown", { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: "Markdown", exact: true }),
    ).toBeVisible({ timeout: 15000 });
    await page.getByRole("button", { name: "レッスン一覧に戻る" }).click();
    await expect(page).toHaveURL(/\/code-lab$/, { timeout: 15000 });
  });

  test("ホームに戻れる", async ({ page }) => {
    await page.locator("button").filter({ hasText: "←" }).click();
    await page.waitForSelector("text=KeruLabs", { timeout: 15000 });
  });
});
