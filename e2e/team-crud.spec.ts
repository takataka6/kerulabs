import { test, expect } from "@playwright/test";
import { waitForDBInit, clearTeams, clearPreferences } from "./helpers";

/**
 * チーム作成・編集・削除のE2Eテスト。
 * 戦術シミュレーターのチーム選択画面でのチーム管理を検証する。
 *
 * 注意: チーム作成後はメイン画面に自動遷移するため、
 * 選択画面に戻るにはヘッダーの「チーム選択」ボタンをクリックする。
 */

test.describe("チーム管理 (CRUD)", () => {
  test.beforeEach(async ({ page }) => {
    await waitForDBInit(page);
    await clearTeams(page);
    await clearPreferences(page);
    await page.goto("/tactics-simulator");
    await page.waitForSelector("text=チームを選択してください", {
      timeout: 15000,
    });
  });

  /** チーム作成後のメイン画面から選択画面に戻る */
  async function goBackToTeamSelection(page: import("@playwright/test").Page) {
    await page
      .locator('button[aria-label="チーム選択"]')
      .click({ timeout: 5000 });
    await page.waitForSelector("text=チームを選択してください", {
      timeout: 10000,
    });
  }

  // ── チーム作成 ──────────────────────────────────

  test("新しいチームを作成できる", async ({ page }) => {
    await page.getByRole("button", { name: "新しいチームを作成" }).click();

    // チーム作成モーダル
    const modal = page.locator('[aria-labelledby="team-creator-title"]');
    await expect(modal).toBeVisible();

    // チーム名を入力
    await modal.locator("#team-name").fill("FCテスト");
    await modal.locator("#team-subtitle").fill("テスト用チーム");
    await modal.locator("#team-manager").fill("テスト監督");

    // 作成ボタン
    await modal
      .getByRole("button", { name: "チームを作成", exact: true })
      .click();

    // メイン画面に遷移してチーム名が表示される
    await expect(page.getByRole("heading", { name: "FCテスト" })).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByText("テスト用チーム")).toBeVisible();
  });

  test("チーム名が空では作成できない", async ({ page }) => {
    await page.getByRole("button", { name: "新しいチームを作成" }).click();

    const modal = page.locator('[aria-labelledby="team-creator-title"]');
    await expect(modal).toBeVisible();

    // 名前を入力せずに作成ボタンをクリック
    await modal
      .getByRole("button", { name: "チームを作成", exact: true })
      .click();

    // アラートダイアログが表示される
    const alertDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(alertDialog).toBeVisible();
    await alertDialog.getByRole("button", { name: "OK" }).click();

    // モーダルは閉じない（まだ開いている）
    await expect(modal).toBeVisible();
  });

  test("フォーメーションを複数選択してチームを作成できる", async ({ page }) => {
    await page.getByRole("button", { name: "新しいチームを作成" }).click();

    const modal = page.locator('[aria-labelledby="team-creator-title"]');
    await modal.locator("#team-name").fill("複数フォメチーム");

    // 4-4-2 を追加選択（4-3-3 はデフォルト選択済み）
    await modal.getByText("4-4-2", { exact: true }).click();

    await modal
      .getByRole("button", { name: "チームを作成", exact: true })
      .click();

    // メイン画面に遷移してチーム名が表示される
    await expect(
      page.getByRole("heading", { name: "複数フォメチーム" }),
    ).toBeVisible({
      timeout: 10000,
    });

    // フォーメーションがボタンとして表示される
    await expect(
      page.getByRole("button", { name: "4-3-3", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "4-4-2", exact: true }),
    ).toBeVisible();
  });

  // ── チーム編集 ──────────────────────────────────

  test("チームを編集できる", async ({ page }) => {
    // チーム作成
    await page.getByRole("button", { name: "新しいチームを作成" }).click();
    const createModal = page.locator('[aria-labelledby="team-creator-title"]');
    await createModal.locator("#team-name").fill("編集前チーム");
    await createModal
      .getByRole("button", { name: "チームを作成", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "編集前チーム" }),
    ).toBeVisible({
      timeout: 10000,
    });

    // 選択画面に戻る
    await goBackToTeamSelection(page);

    // チームカードの編集ボタンをクリック（aria-labelに「編集」とチーム名を含む）
    await page.locator('button[aria-label*="編集"]').first().click();

    // 編集モーダル
    const editModal = page.locator('[aria-labelledby="team-editor-title"]');
    await expect(editModal).toBeVisible({ timeout: 5000 });

    const nameInput = editModal.locator("#edit-team-name");
    await nameInput.clear();
    await nameInput.fill("編集後チーム");

    await editModal.getByText("保存").click();

    // 変更が反映される（選択画面のカードに表示）
    await expect(
      page.getByRole("heading", { name: "編集後チーム" }),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  // ── チーム削除 ──────────────────────────────────

  test("チームを削除できる", async ({ page }) => {
    // チーム作成
    await page.getByRole("button", { name: "新しいチームを作成" }).click();
    const createModal = page.locator('[aria-labelledby="team-creator-title"]');
    await createModal.locator("#team-name").fill("削除テストチーム");
    await createModal
      .getByRole("button", { name: "チームを作成", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "削除テストチーム" }),
    ).toBeVisible({
      timeout: 10000,
    });

    // 選択画面に戻る
    await goBackToTeamSelection(page);

    // チームカードの削除ボタンをクリック（aria-labelに「削除」とチーム名を含む）
    await page
      .getByRole("button", { name: /削除.*削除テストチーム/ })
      .click({ force: true });

    // 確認ダイアログ
    const confirmDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "OK" }).click();

    // チームが消えている
    await expect(
      page.getByRole("heading", { name: "削除テストチーム" }),
    ).not.toBeVisible({
      timeout: 10000,
    });
  });

  // ── 一括インポート ──────────────────────────────

  test("チームを一括インポートできる", async ({ page }) => {
    await page.getByRole("button", { name: "一括インポート" }).click();

    const modal = page.locator(".fixed.inset-0");
    await expect(modal).toBeVisible();

    const importJson = JSON.stringify([
      {
        name: "インポートチームA",
        subtitle: "インポートテスト",
        colors: { gk: "#fbbf24", main: "#3b82f6" },
        availableFormations: ["4-3-3"],
        flagType: "japan",
        headerGradient: "from-blue-600 to-blue-400",
        country: "日本",
        defaultFormation: "4-3-3",
        players: [],
      },
    ]);

    await modal.locator("textarea").fill(importJson);
    await modal.locator("button").filter({ hasText: "インポート" }).click();

    // インポート確認ダイアログ
    const confirmDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(confirmDialog).toBeVisible({ timeout: 5000 });
    await confirmDialog.getByRole("button", { name: "OK" }).click();

    // インポートされたチームが選択画面に表示される
    await expect(
      page.getByRole("heading", { name: "インポートチームA" }),
    ).toBeVisible({
      timeout: 10000,
    });
  });

  // ── チーム選択後のメイン画面 ──────────────────────

  test("作成したチームを選択してメイン画面に入れる", async ({ page }) => {
    // チーム作成（作成後はメイン画面に自動遷移）
    await page.getByRole("button", { name: "新しいチームを作成" }).click();
    const modal = page.locator('[aria-labelledby="team-creator-title"]');
    await modal.locator("#team-name").fill("メイン画面テスト");
    await modal
      .getByRole("button", { name: "チームを作成", exact: true })
      .click();

    // メイン画面にチーム名が表示される
    await expect(
      page.locator("h1").filter({ hasText: "メイン画面テスト" }),
    ).toBeVisible({ timeout: 15000 });
  });
});
