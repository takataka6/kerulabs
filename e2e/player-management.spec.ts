import { test, expect } from "@playwright/test";
import {
  waitForDBInit,
  seedTeam,
  clearTeams,
  clearPreferences,
} from "./helpers";

/**
 * 選手管理のE2Eテスト。
 * 戦術シミュレーターのメイン画面から選手の追加・削除・検索・フィルタを検証する。
 */

/** チームを選択してメイン画面に入り、選手管理モーダルを開くヘルパー */
async function openPlayerManagement(page: import("@playwright/test").Page) {
  await waitForDBInit(page);
  await clearTeams(page);
  await clearPreferences(page);
  await seedTeam(page);
  await page.goto("/tactics-simulator");
  await page.waitForSelector("text=テストチームA", { timeout: 15000 });

  // チームを選択
  await page
    .locator("button")
    .filter({ hasText: "テストチームA" })
    .first()
    .dispatchEvent("click");
  await expect(
    page.locator("h1").filter({ hasText: "テストチームA" }),
  ).toBeVisible({ timeout: 15000 });

  // サイドバー描画完了を待つ
  await page.waitForSelector("aside", { timeout: 15000 });
  await expect(page.locator('button[aria-label="選手管理"]')).toBeVisible({
    timeout: 10000,
  });

  // エラーバウンダリが発動した場合は再試行
  const errorH1 = page.locator("h1").filter({ hasText: "問題が発生しました" });
  if (await errorH1.isVisible().catch(() => false)) {
    await page.locator("button").filter({ hasText: "再試行" }).click();
    await expect(
      page.locator("h1").filter({ hasText: "テストチームA" }),
    ).toBeVisible({ timeout: 15000 });
    await page.waitForSelector("aside", { timeout: 15000 });
  }

  // 👥 ボタンをクリック
  const playerBtn = page.locator("button").filter({ hasText: "👥" });
  await expect(playerBtn.first()).toBeVisible({ timeout: 10000 });
  await playerBtn.first().dispatchEvent("click");

  // 選手管理モーダルが表示される
  const modal = page.locator('[aria-labelledby="player-mgmt-title"]');
  await expect(modal).toBeVisible({ timeout: 10000 });
  return modal;
}

test.describe("選手管理", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(60000);

  // ── 選手一覧表示 ──────────────────────────────

  test("選手管理モーダルが開き選手一覧が表示される", async ({ page }) => {
    const modal = await openPlayerManagement(page);

    // チーム名がモーダルヘッダーに表示される
    await expect(modal.getByText("テストチームA").first()).toBeVisible();

    // 選手一覧テキストが存在する
    await expect(modal.getByText("選手一覧")).toBeVisible();

    // シードデータの選手が表示される（選手1 = GK）
    await expect(
      modal
        .locator("div.text-white.font-semibold")
        .filter({ hasText: "選手1" })
        .first(),
    ).toBeVisible();
  });

  // ── 選手追加 ──────────────────────────────────

  test("新しい選手を追加できる", async ({ page }) => {
    const modal = await openPlayerManagement(page);

    // 選手追加ボタン
    await modal.getByRole("button", { name: "選手を追加" }).click();

    // フォームが表示される
    await expect(modal.getByText("新しい選手")).toBeVisible();

    // 名前と背番号を入力
    await modal.locator('input[aria-label="名前"]').fill("新規テスト選手");
    await modal.locator('input[aria-label="背番号"]').fill("99");

    // 追加ボタンをクリック
    await modal.getByRole("button", { name: "追加" }).click();

    // 追加された選手が一覧に表示される
    await expect(modal.getByText("新規テスト選手")).toBeVisible();
  });

  test("名前と背番号が空では選手を追加できない", async ({ page }) => {
    const modal = await openPlayerManagement(page);

    await modal.getByRole("button", { name: "選手を追加" }).click();

    // 空のまま追加ボタンをクリック
    await modal.getByRole("button", { name: "追加" }).click();

    // エラートーストが表示される
    await expect(page.getByText("名前と背番号を入力してください")).toBeVisible({
      timeout: 5000,
    });
  });

  test("重複する背番号では選手を追加できない", async ({ page }) => {
    const modal = await openPlayerManagement(page);

    await modal.getByRole("button", { name: "選手を追加" }).click();

    // シードデータの選手1と同じ背番号1を入力
    await modal.locator('input[aria-label="名前"]').fill("重複テスト");
    await modal.locator('input[aria-label="背番号"]').fill("1");
    await modal.getByRole("button", { name: "追加" }).click();

    // エラートーストが表示される（背番号が使用中）
    await expect(page.getByText("背番号1は既に使用されています")).toBeVisible({
      timeout: 5000,
    });
  });

  // ── 選手削除 ──────────────────────────────────

  test("選手を削除できる", async ({ page }) => {
    const modal = await openPlayerManagement(page);

    // 最初の選手の削除ボタンをクリック（テキストベースのボタン）
    await modal.getByRole("button", { name: "削除" }).first().click();

    // 確認ダイアログ
    const confirmDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "OK" }).click();

    // 選手数が減少していることを確認（10名登録）
    await expect(
      modal.locator("p").filter({ has: page.getByText(/^10名登録$/) }),
    ).toBeVisible({ timeout: 5000 });
  });

  // ── 検索 ──────────────────────────────────────

  test("選手を名前で検索できる", async ({ page }) => {
    const modal = await openPlayerManagement(page);

    // 検索欄に入力（type="text", id="player-search"）
    const searchInput = modal.locator("#player-search");
    await searchInput.fill("選手1");

    // 選手2は表示されないことを確認
    await expect(
      modal
        .locator("div.text-white.font-semibold")
        .filter({ hasText: "選手2" }),
    ).not.toBeVisible({ timeout: 5000 });
  });

  // ── ポジションフィルタ ─────────────────────────

  test("ポジションでフィルタリングできる", async ({ page }) => {
    const modal = await openPlayerManagement(page);

    // フィルタドロップダウンで GK を選択
    const filterSelect = modal.locator(
      'select[aria-label="ポジションフィルター"]',
    );
    await filterSelect.selectOption("gk");

    // GK は1人（選手1）のみ - モーダル内でスコープ
    await expect(
      modal
        .locator("div.text-white.font-semibold")
        .filter({ hasText: "選手1" })
        .first(),
    ).toBeVisible({ timeout: 5000 });
    // MF の選手は表示されない
    await expect(
      modal
        .locator("div.text-white.font-semibold")
        .filter({ hasText: "選手6" }),
    ).not.toBeVisible({ timeout: 5000 });
  });

  // ── モーダルの閉じる ──────────────────────────

  test("選手管理モーダルを閉じられる", async ({ page }) => {
    await openPlayerManagement(page);

    // 閉じるボタンをクリック
    await page.locator("button").filter({ hasText: "✕" }).click();

    // モーダルが閉じる
    await expect(
      page.locator('[aria-labelledby="player-mgmt-title"]'),
    ).not.toBeVisible();
  });
});
