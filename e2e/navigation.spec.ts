import { test, expect } from "@playwright/test";

test.describe("ページ間ナビゲーション", () => {
  test("ホーム → 各ページ → ホームの往復が正しく動作する", async ({ page }) => {
    // ホームへアクセス
    await page.goto("/");
    await page.waitForSelector("text=KeruLabs", { timeout: 15000 });

    // 用語集ページへ遷移
    await page.getByRole("button", { name: /チーム用語辞典/ }).click();
    await page.waitForURL("**/glossary");
    expect(page.url()).toContain("/glossary");

    // ホームに戻る
    await page.locator("button").filter({ hasText: "←" }).click();
    await page.waitForSelector("text=KeruLabs", { timeout: 15000 });

    // コードラボへ遷移
    await page.getByRole("button", { name: /コードラボ/ }).click();
    await page.waitForURL("**/code-lab");
    expect(page.url()).toContain("/code-lab");

    // ホームに戻る
    await page.locator("button").filter({ hasText: "←" }).click();
    await page.waitForSelector("text=KeruLabs", { timeout: 15000 });
  });

  test("存在しないURLはホームへリダイレクトされる", async ({ page }) => {
    await page.goto("/invalid-page");
    // DB初期化 + リダイレクト完了を待つ
    await page.waitForSelector("text=KeruLabs", { timeout: 15000 });
    await expect(page).toHaveURL("/");
  });

  test("URLを直接入力して各ページへアクセスできる", async ({ page }) => {
    // 用語集
    await page.goto("/glossary");
    await expect(
      page.getByRole("heading", { name: "チーム用語辞典" }),
    ).toBeVisible({ timeout: 15000 });

    // コードラボ
    await page.goto("/code-lab");
    await expect(page.getByRole("heading", { name: "コードラボ" })).toBeVisible(
      { timeout: 15000 },
    );
  });
});
