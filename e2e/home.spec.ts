import { test, expect } from "@playwright/test";

test.describe("ホームページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    // DB初期化完了を待つ（ローディングスピナーが消えるまで）
    await page.waitForSelector("text=KeruLabs", { timeout: 15000 });
  });

  test("アプリタイトルが表示される", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("KeruLabs");
  });

  test("4つのアプリカードが表示される", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "戦術シミュレーター" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "チーム用語辞典" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "チームマニュアル" }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "コードラボ" }),
    ).toBeVisible();
  });

  test("言語切り替えが動作する", async ({ page }) => {
    await page.getByText("🇺🇸 English").click();
    await expect(
      page.getByRole("button", { name: "🇺🇸 English" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("heading", { name: "Team Glossary" }),
    ).toBeVisible();
    await page.getByText("🇯🇵 日本語").click();
    await expect(
      page.getByRole("button", { name: "🇯🇵 日本語" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  test("戦術シミュレーターへ遷移できる", async ({ page }) => {
    await page.getByRole("button", { name: /戦術シミュレーター/ }).click();
    await page.waitForURL("**/tactics-simulator");
    expect(page.url()).toContain("/tactics-simulator");
  });

  test("用語集ページへ遷移できる", async ({ page }) => {
    await page.getByRole("button", { name: /チーム用語辞典/ }).click();
    await page.waitForURL("**/glossary");
    expect(page.url()).toContain("/glossary");
  });

  test("コードラボへ遷移できる", async ({ page }) => {
    await page.getByRole("button", { name: /コードラボ/ }).click();
    await page.waitForURL("**/code-lab");
    expect(page.url()).toContain("/code-lab");
  });
});
