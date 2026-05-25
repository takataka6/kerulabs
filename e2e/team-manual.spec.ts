import { test, expect } from "@playwright/test";

/**
 * チームマニュアルページのE2Eテスト。
 * マニュアルの一覧・作成・編集・削除、セクション・項目のCRUD、インポートを検証する。
 */

/** teamManuals ストアをクリアする */
async function clearTeamManuals(page: import("@playwright/test").Page) {
  await page.evaluate(async () => {
    return new Promise<void>((resolve, reject) => {
      const req = indexedDB.open("tactics_simulator_db");
      req.onsuccess = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains("teamManuals")) {
          db.close();
          resolve();
          return;
        }
        const tx = db.transaction("teamManuals", "readwrite");
        tx.objectStore("teamManuals").clear();
        tx.oncomplete = () => {
          db.close();
          resolve();
        };
        tx.onerror = () => {
          db.close();
          reject(tx.error);
        };
      };
      req.onerror = () => reject(req.error);
    });
  });
}

test.describe("チームマニュアルページ", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector("text=KeruLabs", { timeout: 15000 });
    await clearTeamManuals(page);
    await page.goto("/team-manual");
    await page.waitForSelector("text=チームマニュアル", { timeout: 15000 });
  });

  // ── 一覧表示 ──────────────────────────────────

  test("マニュアルページが表示される", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("空の状態でメッセージが表示される", async ({ page }) => {
    await expect(page.getByText("まだマニュアルがありません")).toBeVisible();
  });

  // ── マニュアル作成 ──────────────────────────────

  test("新しいマニュアルを作成できる", async ({ page }) => {
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();

    const modal = page.locator(".fixed.inset-0");
    await expect(modal).toBeVisible();

    await modal.locator("#manual-form-name").fill("テスト戦術マニュアル");
    await modal.locator("#manual-form-desc").fill("E2Eテスト用");
    await modal.getByText("保存").click();

    await expect(page.getByText("テスト戦術マニュアル")).toBeVisible();
  });

  test("名前が空ではマニュアルを作成できない", async ({ page }) => {
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();

    const modal = page.locator(".fixed.inset-0");
    const saveButton = modal.getByText("保存");
    await expect(saveButton).toBeDisabled();
  });

  // ── マニュアル編集 ──────────────────────────────

  test("マニュアルを編集できる", async ({ page }) => {
    // 作成
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const modal = page.locator(".fixed.inset-0");
    await modal.locator("#manual-form-name").fill("編集前マニュアル");
    await modal.locator("#manual-form-desc").fill("編集前の説明");
    await modal.getByText("保存").click();
    await expect(page.getByText("編集前マニュアル")).toBeVisible();

    // 編集ボタンをクリック
    await page
      .locator('button[title="削除"]')
      .first()
      .locator("..")
      .locator('button[title="編集"]')
      .click({ force: true });

    // 実際には title 属性で特定
    const editModal = page.locator(".fixed.inset-0");
    await expect(editModal).toBeVisible();
    const nameInput = editModal.locator("#manual-form-name");
    await nameInput.clear();
    await nameInput.fill("編集後マニュアル");
    await editModal.getByText("保存").click();

    await expect(page.getByText("編集後マニュアル")).toBeVisible();
  });

  // ── マニュアル削除 ──────────────────────────────

  test("マニュアルを削除できる", async ({ page }) => {
    // 作成
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const modal = page.locator(".fixed.inset-0");
    await modal.locator("#manual-form-name").fill("削除テストマニュアル");
    await modal.getByText("保存").click();
    await expect(page.getByText("削除テストマニュアル")).toBeVisible();

    // 削除ボタンをクリック
    await page.locator('button[title="削除"]').first().click({ force: true });

    // 確認ダイアログ
    const confirmDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "OK" }).click();

    await expect(page.getByText("まだマニュアルがありません")).toBeVisible();
  });

  // ── マニュアル詳細・セクション ──────────────────

  test("マニュアル詳細画面に遷移できる", async ({ page }) => {
    // 作成
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const modal = page.locator(".fixed.inset-0");
    await modal.locator("#manual-form-name").fill("詳細テスト");
    await modal.getByText("保存").click();

    // カードをクリック
    await page.getByText("詳細テスト").click();

    // 詳細画面のh1にマニュアル名が表示される
    await expect(
      page.locator("h1").filter({ hasText: "詳細テスト" }),
    ).toBeVisible();
  });

  test("セクションを追加できる", async ({ page }) => {
    // マニュアル作成 → 詳細画面
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#manual-form-name").fill("セクションテスト");
    await createModal.getByText("保存").click();
    await page.getByText("セクションテスト").click();
    await expect(
      page.locator("h1").filter({ hasText: "セクションテスト" }),
    ).toBeVisible();

    // 空状態のメッセージ
    await expect(page.getByText("まだセクションがありません")).toBeVisible();

    // セクション追加ボタン
    await page.getByRole("button", { name: "セクションを追加" }).click();
    const sectionModal = page.locator(".fixed.inset-0");
    await sectionModal.locator("#section-form-title").fill("ビルドアップ原則");
    // カテゴリ選択（デフォルトは offense）
    await sectionModal
      .locator("#section-form-formations")
      .fill("4-3-3, 4-2-3-1");
    await sectionModal.getByText("保存").click();

    // セクションが表示される
    await expect(page.getByText("ビルドアップ原則")).toBeVisible();
    await expect(page.getByText("4-3-3")).toBeVisible();
  });

  test("セクションを編集できる", async ({ page }) => {
    // マニュアル作成 → セクション追加
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#manual-form-name").fill("セクション編集テスト");
    await createModal.getByText("保存").click();
    await page.getByText("セクション編集テスト").click();

    await page.getByRole("button", { name: "セクションを追加" }).click();
    const sectionModal = page.locator(".fixed.inset-0");
    await sectionModal.locator("#section-form-title").fill("編集前セクション");
    await sectionModal.getByText("保存").click();
    await expect(page.getByText("編集前セクション")).toBeVisible();

    // 編集ボタン
    await page.locator('button[title="編集"]').first().click();
    const editModal = page.locator(".fixed.inset-0");
    const titleInput = editModal.locator("#section-form-title");
    await titleInput.clear();
    await titleInput.fill("編集後セクション");
    await editModal.getByText("保存").click();

    await expect(page.getByText("編集後セクション")).toBeVisible();
    await expect(page.getByText("編集前セクション")).not.toBeVisible();
  });

  test("セクションを削除できる", async ({ page }) => {
    // マニュアル作成 → セクション追加
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#manual-form-name").fill("セクション削除テスト");
    await createModal.getByText("保存").click();
    await page.getByText("セクション削除テスト").click();

    await page.getByRole("button", { name: "セクションを追加" }).click();
    const sectionModal = page.locator(".fixed.inset-0");
    await sectionModal
      .locator("#section-form-title")
      .fill("削除対象セクション");
    await sectionModal.getByText("保存").click();
    await expect(page.getByText("削除対象セクション")).toBeVisible();

    // 削除ボタン
    await page.locator('button[title="削除"]').first().click();
    const confirmDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "OK" }).click();

    await expect(page.getByText("まだセクションがありません")).toBeVisible();
  });

  // ── 項目 CRUD ──────────────────────────────────

  test("セクションに項目を追加できる", async ({ page }) => {
    // マニュアル → セクション作成
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#manual-form-name").fill("項目テスト");
    await createModal.getByText("保存").click();
    await page.getByText("項目テスト").click();

    await page.getByRole("button", { name: "セクションを追加" }).click();
    const sectionModal = page.locator(".fixed.inset-0");
    await sectionModal.locator("#section-form-title").fill("攻撃原則");
    await sectionModal.getByText("保存").click();

    // 空状態メッセージ
    await expect(page.getByText("まだ項目がありません")).toBeVisible();

    // 項目追加ボタン（セクションヘッダー内の ➕）
    await page.locator('button[title="項目を追加"]').click();
    const itemModal = page.locator(".fixed.inset-0");
    await itemModal.locator("#item-form-title").fill("GKビルドアップ");
    await itemModal
      .locator("#item-form-content")
      .fill("GKからCBへの配球を基本とする");
    await itemModal.getByText("保存").click();

    await expect(page.getByText("GKビルドアップ")).toBeVisible();
    await expect(page.getByText("GKからCBへの配球を基本とする")).toBeVisible();
  });

  test("項目を編集できる", async ({ page }) => {
    // セットアップ: マニュアル → セクション → 項目
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#manual-form-name").fill("項目編集テスト");
    await createModal.getByText("保存").click();
    await page.getByText("項目編集テスト").click();

    await page.getByRole("button", { name: "セクションを追加" }).click();
    const sectionModal = page.locator(".fixed.inset-0");
    await sectionModal.locator("#section-form-title").fill("テストセクション");
    await sectionModal.getByText("保存").click();

    await page.locator('button[title="項目を追加"]').click();
    const addModal = page.locator(".fixed.inset-0");
    await addModal.locator("#item-form-title").fill("編集前項目");
    await addModal.locator("#item-form-content").fill("変更前の内容");
    await addModal.getByText("保存").click();
    await expect(page.getByText("編集前項目")).toBeVisible();

    // 項目編集（項目タイトルを含むラッパーdiv内の編集ボタン）
    const itemRow = page.locator("div.flex.items-start").filter({
      has: page.locator("h3", { hasText: "編集前項目" }),
    });
    await itemRow.locator('button[title="編集"]').click();
    const editModal = page.locator(".fixed.inset-0");
    await expect(editModal.locator("#item-form-title")).toBeVisible();
    const titleInput = editModal.locator("#item-form-title");
    await titleInput.clear();
    await titleInput.fill("編集後項目");
    await editModal.getByText("保存").click();

    await expect(page.getByText("編集後項目")).toBeVisible();
    await expect(page.getByText("編集前項目")).not.toBeVisible();
  });

  test("項目を削除できる", async ({ page }) => {
    // セットアップ
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#manual-form-name").fill("項目削除テスト");
    await createModal.getByText("保存").click();
    await page.getByText("項目削除テスト").click();

    await page.getByRole("button", { name: "セクションを追加" }).click();
    const sectionModal = page.locator(".fixed.inset-0");
    await sectionModal.locator("#section-form-title").fill("テストセクション");
    await sectionModal.getByText("保存").click();

    await page.locator('button[title="項目を追加"]').click();
    const addModal = page.locator(".fixed.inset-0");
    await addModal.locator("#item-form-title").fill("削除対象項目");
    await addModal.locator("#item-form-content").fill("テスト内容");
    await addModal.getByText("保存").click();
    await expect(page.getByText("削除対象項目")).toBeVisible();

    // 項目削除（項目タイトルを含むラッパーdiv内の削除ボタン）
    const itemRow = page.locator("div.flex.items-start").filter({
      has: page.locator("h3", { hasText: "削除対象項目" }),
    });
    await itemRow.locator('button[title="削除"]').click();
    const confirmDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "OK" }).click();

    // 項目が消えている
    await expect(page.getByText("削除対象項目")).not.toBeVisible({
      timeout: 5000,
    });
  });

  // ── インポート ──────────────────────────────────

  test("マニュアルをインポートできる", async ({ page }) => {
    await page.getByRole("button", { name: "インポート" }).click();

    const modal = page.locator(".fixed.inset-0");
    await expect(modal).toBeVisible();

    const importJson = JSON.stringify([
      {
        name: "インポートテストマニュアル",
        description: "インポートによる作成",
        sections: [
          {
            title: "守備原則",
            category: "defense",
            formations: ["4-4-2"],
            items: [
              {
                title: "プレス戦術",
                content: "前線からのハイプレスを基本とする",
              },
            ],
          },
        ],
      },
    ]);
    await modal.locator("#manual-import-json").fill(importJson);
    await modal.locator("button").filter({ hasText: "インポート実行" }).click();

    // 確認ダイアログ
    const confirmDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "OK" }).click();

    await expect(page.getByText("インポートテストマニュアル")).toBeVisible();
  });

  test("不正なJSONでインポートエラーが表示される", async ({ page }) => {
    await page.getByRole("button", { name: "インポート" }).click();

    const modal = page.locator(".fixed.inset-0");
    await modal.locator("#manual-import-json").fill("{ invalid json }");
    await modal.locator("button").filter({ hasText: "インポート実行" }).click();

    await expect(page.getByText("インポートに失敗しました")).toBeVisible({
      timeout: 5000,
    });
  });

  // ── ナビゲーション ──────────────────────────────

  test("マニュアル一覧に戻れる", async ({ page }) => {
    // マニュアル作成 → 詳細画面
    await page.getByRole("button", { name: "新しいマニュアルを作成" }).click();
    const modal = page.locator(".fixed.inset-0");
    await modal.locator("#manual-form-name").fill("戻るテスト");
    await modal.getByText("保存").click();
    await page.getByText("戻るテスト").click();

    // パンくずの「チームマニュアル」をクリック
    await page.locator("nav button").first().click();

    // 一覧に戻る（作成ボタンが見える）
    await expect(
      page.getByRole("button", { name: "新しいマニュアルを作成" }),
    ).toBeVisible();
  });
});
