import { test, expect, type Page } from "@playwright/test";
import {
  waitForDBInit,
  seedTeam,
  clearTeams,
  clearPreferences,
} from "./helpers";

async function waitForTacticsMainScreen(page: Page) {
  const teamHeading = page.locator("h1").filter({ hasText: "テストチームA" });
  const errorHeading = page
    .locator("h1")
    .filter({ hasText: "問題が発生しました" });
  const tacticsCanvas = page.getByRole("img", {
    name: "戦術フィールド 3Dビュー",
  });

  await expect(teamHeading).toBeVisible({ timeout: 15000 });
  await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });

  try {
    await Promise.any([
      tacticsCanvas.waitFor({ state: "visible", timeout: 10000 }),
      errorHeading.waitFor({ state: "visible", timeout: 10000 }),
    ]);
  } catch {
    // Canvas 表示が遅い環境でも、ヘッダーとサイドバーが揃っていれば
    // 主要UIの検証は継続できる。
  }

  if (await errorHeading.isVisible().catch(() => false)) {
    await page.locator("button").filter({ hasText: "再試行" }).click();
    await expect(teamHeading).toBeVisible({ timeout: 15000 });
    await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });
    await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });
  }
}

test.describe("戦術シミュレーターページ", () => {
  // ── チーム未登録状態 ──────────────────────────────

  test.describe("チーム未登録", () => {
    test.beforeEach(async ({ page }) => {
      await waitForDBInit(page);
      await clearTeams(page);
      await clearPreferences(page);
      await page.goto("/tactics-simulator");
      // チーム選択画面のロード待ち
      await page.waitForSelector("text=チームを選択してください", {
        timeout: 15000,
      });
    });

    test("チーム選択画面が表示される", async ({ page }) => {
      await expect(page.getByText("チームを選択してください")).toBeVisible();
    });

    test("チーム作成ボタンが表示される", async ({ page }) => {
      const createBtn = page.getByRole("button", {
        name: "新しいチームを作成",
      });
      await expect(createBtn).toBeVisible();
    });

    test("ホームに戻れる", async ({ page }) => {
      await page.locator("button").filter({ hasText: "←" }).first().click();
      await page.waitForSelector("text=KeruLabs", { timeout: 15000 });
    });
  });

  // ── チーム登録済み：チーム選択画面 ──────────────────

  test.describe("チーム登録済み - 選択画面", () => {
    test.beforeEach(async ({ page }) => {
      await waitForDBInit(page);
      await clearTeams(page);
      await clearPreferences(page);
      await seedTeam(page);
      await page.goto("/tactics-simulator");
      await page.waitForSelector("text=チームを選択してください", {
        timeout: 15000,
      });
    });

    test("チームカードが表示される", async ({ page }) => {
      await expect(page.getByText("テストチームA")).toBeVisible({
        timeout: 10000,
      });
    });

    test("チームを選択するとメイン画面に遷移する", async ({ page }) => {
      await page.getByText("テストチームA").click();

      // メイン画面が表示される（h1 にチーム名が出る）
      await expect(
        page.locator("h1").filter({ hasText: "テストチームA" }),
      ).toBeVisible({
        timeout: 15000,
      });
    });
  });

  // ── メイン画面 ──────────────────────────────
  // Note: sidebar-toggle は全画面サイズで表示。
  // Desktop (1280px) ではサイドバーはデフォルトで開いた状態。

  test.describe("メイン画面", () => {
    test.beforeEach(async ({ page }) => {
      await waitForDBInit(page);
      await clearTeams(page);
      await clearPreferences(page);
      await seedTeam(page);
      await page.goto("/tactics-simulator");
      await page.waitForSelector("text=テストチームA", { timeout: 15000 });

      // チームを選択
      await page.getByText("テストチームA").click();
      await waitForTacticsMainScreen(page);
    });

    test("ヘッダーにチーム名が表示される", async ({ page }) => {
      await expect(
        page.locator("h1").filter({ hasText: "テストチームA" }),
      ).toBeVisible({
        timeout: 10000,
      });
    });

    test("フォーメーション名が表示される", async ({ page }) => {
      // チームのデフォルトフォーメーション 4-3-3 がヘッダーのサブタイトルに表示される
      await expect(page.locator("p").filter({ hasText: "4-3-3" })).toBeVisible({
        timeout: 10000,
      });
    });

    test("ゲームモードを切り替えられる", async ({ page }) => {
      const gameModeSelect = page.locator("header select");
      await expect(gameModeSelect).toBeVisible({ timeout: 10000 });

      await gameModeSelect.selectOption("futsal");

      await expect(gameModeSelect).toHaveValue("futsal", { timeout: 10000 });
    });

    test("フェーズ選択ダイヤモンドが表示される", async ({ page }) => {
      await expect(page.locator("aside").getByText("攻撃")).toBeVisible({
        timeout: 10000,
      });
      await expect(page.locator("aside").getByText("守備")).toBeVisible({
        timeout: 10000,
      });
    });

    test("プレーモード切替タブが表示される", async ({ page }) => {
      await expect(page.getByText("フィールドプレー")).toBeVisible({
        timeout: 10000,
      });
      await expect(page.getByText("セットプレー")).toBeVisible({
        timeout: 10000,
      });
    });

    test("選手管理ボタンが表示される", async ({ page }) => {
      // ヘッダー右側の 👥 ボタン
      const btn = page.locator("button").filter({ hasText: "👥" });
      await expect(btn.first()).toBeVisible({ timeout: 10000 });
    });

    test("チーム選択画面に戻れる", async ({ page }) => {
      // ← ボタンを dispatchEvent で安定的にクリック（DOM 再描画で detach 回避）
      await page
        .locator('button[aria-label="チーム選択"]')
        .dispatchEvent("click");

      // チーム選択画面が表示される
      await expect(page.getByText("チームを選択してください")).toBeVisible({
        timeout: 15000,
      });
    });

    test("撮影モードを切り替えられる", async ({ page }) => {
      // 📸 ボタンを dispatchEvent でクリック
      const captureBtn = page.locator('button[aria-label="撮影モード"]');
      await expect(captureBtn).toBeVisible({ timeout: 10000 });
      await captureBtn.dispatchEvent("click");

      // 撮影モードになるとヘッダーが非表示になる
      await expect(page.locator("header").first()).toBeHidden({
        timeout: 5000,
      });

      // ヘッダーが非表示のため dispatchEvent でクリック
      await captureBtn.dispatchEvent("click");
      await expect(page.locator("header").first()).toBeVisible({
        timeout: 5000,
      });
    });

    test("サイドバーを開閉できる", async ({ page }) => {
      const toggleBtn = page.locator(".sidebar-toggle");
      await expect(toggleBtn).toBeVisible({ timeout: 10000 });

      // 初期状態: サイドバーが開いている（1280px >= 1100px）
      await expect(toggleBtn).toHaveAttribute("aria-expanded", "true", {
        timeout: 5000,
      });

      // ◀ をクリックしてサイドバーを閉じる
      await toggleBtn.dispatchEvent("click");
      await expect(toggleBtn).toHaveAttribute("aria-expanded", "false", {
        timeout: 5000,
      });

      // ▶ をクリックしてサイドバーを開く
      await toggleBtn.dispatchEvent("click");
      await expect(toggleBtn).toHaveAttribute("aria-expanded", "true", {
        timeout: 5000,
      });
    });
  });
});
