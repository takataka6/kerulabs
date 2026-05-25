import { test, expect } from "@playwright/test";

test.describe("用語集ページ", () => {
  test.beforeEach(async ({ page }) => {
    // IndexedDB の glossaries ストアをクリアして初期状態にする
    await page.goto("/");
    await page.evaluate(async () => {
      const dbRequest = indexedDB.open("tactics_simulator_db");
      await new Promise<void>((resolve, reject) => {
        dbRequest.onsuccess = () => {
          const db = dbRequest.result;
          if (db.objectStoreNames.contains("glossaries")) {
            const tx = db.transaction("glossaries", "readwrite");
            tx.objectStore("glossaries").clear();
            tx.oncomplete = () => {
              db.close();
              resolve();
            };
            tx.onerror = () => {
              db.close();
              reject(tx.error);
            };
          } else {
            db.close();
            resolve();
          }
        };
        dbRequest.onerror = () => reject(dbRequest.error);
      });
    });
    await page.goto("/glossary");
    await page.waitForSelector("text=チーム用語辞典", { timeout: 15000 });
  });

  test("用語集ページが表示される", async ({ page }) => {
    await expect(page.locator("h1")).toBeVisible();
  });

  test("空の状態でメッセージが表示される", async ({ page }) => {
    // 用語集が0個の場合、空メッセージが表示される
    const emptyMessage = page.getByText("まだ辞典がありません");
    await expect(emptyMessage).toBeVisible();
  });

  test("新しい用語集を作成できる", async ({ page }) => {
    // 作成ボタンをクリック
    await page.getByRole("button", { name: "新しい辞典を作成" }).click();

    // モーダルが表示される
    const modal = page.locator(".fixed.inset-0");
    await expect(modal).toBeVisible();

    // 名前を入力
    const nameInput = modal.locator("#glossary-form-name");
    await nameInput.fill("テスト用語集");

    // 説明を入力
    const descInput = modal.locator("#glossary-form-desc");
    await descInput.fill("テスト用の用語集です");

    // 保存ボタンをクリック
    await modal.getByText("保存").click();

    // 用語集カードが表示される
    await expect(page.getByText("テスト用語集")).toBeVisible();
  });

  test("用語集を作成して用語を追加できる", async ({ page }) => {
    // 用語集を作成
    await page.getByRole("button", { name: "新しい辞典を作成" }).click();
    const modal = page.locator(".fixed.inset-0");
    await modal.locator("#glossary-form-name").fill("サッカー用語");
    await modal.getByText("保存").click();

    // 用語集カードをクリックして詳細画面へ
    await page.getByText("サッカー用語").click();

    // 用語追加ボタンをクリック
    await page.getByRole("button", { name: "用語を追加" }).click();

    // 用語フォームに入力
    const termModal = page.locator(".fixed.inset-0");
    // 用語名を入力
    await termModal.locator("#term-form-term").fill("オフサイド");

    // 説明を入力
    await termModal
      .locator("#term-form-desc")
      .fill("攻撃側の選手がボールより前方にいる反則");

    // 保存
    await termModal.getByText("保存").click();

    // テーブルに用語が表示される
    await expect(page.getByText("オフサイド")).toBeVisible();
  });

  test("ホームに戻れる", async ({ page }) => {
    // ← ホーム ボタンをクリック
    await page.locator("button").filter({ hasText: "←" }).click();
    await page.waitForSelector("text=KeruLabs", { timeout: 15000 });
  });

  // ── 編集テスト ──────────────────────────────────

  test("用語集を編集できる", async ({ page }) => {
    // 用語集を作成
    await page.getByRole("button", { name: "新しい辞典を作成" }).click();
    const modal = page.locator(".fixed.inset-0");
    await modal.locator("#glossary-form-name").fill("編集前の名前");
    await modal.locator("#glossary-form-desc").fill("編集前の説明");
    await modal.getByText("保存").click();

    // 作成後は詳細画面に自動遷移するので一覧に戻る
    await page
      .locator("button")
      .filter({ hasText: "← 辞典一覧に戻る" })
      .click();
    await expect(page.getByText("編集前の名前")).toBeVisible();

    // 編集ボタンをクリック（opacity-0 で非表示だが force でクリック可能）
    await page
      .locator('.group button[title="編集"]')
      .first()
      .click({ force: true });

    // 編集モーダルで名前を変更
    const editModal = page.locator(".fixed.inset-0");
    await expect(editModal).toBeVisible();
    const nameInput = editModal.locator("#glossary-form-name");
    await nameInput.clear();
    await nameInput.fill("編集後の名前");
    await editModal.getByText("保存").click();

    // 変更が反映される
    await expect(page.getByText("編集後の名前")).toBeVisible();
  });

  test("用語集を削除できる", async ({ page }) => {
    // 用語集を作成
    await page.getByRole("button", { name: "新しい辞典を作成" }).click();
    const modal = page.locator(".fixed.inset-0");
    await modal.locator("#glossary-form-name").fill("削除テスト");
    await modal.getByText("保存").click();

    // 作成後は詳細画面に自動遷移するので一覧に戻る
    await page
      .locator("button")
      .filter({ hasText: "← 辞典一覧に戻る" })
      .click();
    await expect(page.getByText("削除テスト")).toBeVisible();

    // 削除ボタンをクリック（opacity-0 で非表示だが force でクリック可能）
    await page
      .locator('.group button[title="削除"]')
      .first()
      .click({ force: true });

    // 確認ダイアログの OK ボタンをクリック
    const confirmDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "OK" }).click();

    // 用語集が消えて空メッセージが表示される
    await expect(
      page.locator("h2").filter({ hasText: "削除テスト" }),
    ).not.toBeVisible();
  });

  // ── インポートテスト ──────────────────────────────

  test("用語集をインポートできる", async ({ page }) => {
    // インポートボタンをクリック
    await page.getByRole("button", { name: "インポート" }).click();

    // インポートモーダルが表示される
    const modal = page.locator(".fixed.inset-0");
    await expect(modal).toBeVisible();

    // JSON を入力
    const importJson = JSON.stringify([
      {
        name: "インポートテスト辞典",
        description: "インポートによる作成",
        terms: [
          {
            term: "テスト用語",
            reading: "てすとようご",
            description: "テスト説明",
            keywords: ["テスト"],
          },
        ],
      },
    ]);
    await modal.locator("#glossary-import-json").fill(importJson);

    // インポート実行
    await modal.locator("button").filter({ hasText: "インポート実行" }).click();

    // インポートされた辞典が表示される
    await expect(page.getByText("インポートテスト辞典")).toBeVisible();
  });

  test("不正なJSONでインポートエラーが表示される", async ({ page }) => {
    await page.getByRole("button", { name: "インポート" }).click();
    const modal = page.locator(".fixed.inset-0");

    // 不正な JSON を入力
    await modal.locator("#glossary-import-json").fill("{ invalid json }");
    await modal.locator("button").filter({ hasText: "インポート実行" }).click();

    // エラートーストが表示される
    await expect(page.getByText("インポートに失敗しました")).toBeVisible({
      timeout: 5000,
    });
  });

  // ── 用語編集・削除テスト ──────────────────────────

  test("用語を編集できる", async ({ page }) => {
    // 用語集を作成して用語を追加
    await page.getByRole("button", { name: "新しい辞典を作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#glossary-form-name").fill("用語編集テスト");
    await createModal.getByText("保存").click();
    await page.getByText("用語編集テスト").click();

    // 用語を追加
    await page.getByRole("button", { name: "用語を追加" }).click();
    const addModal = page.locator(".fixed.inset-0");
    await addModal.locator("#term-form-term").fill("変更前用語");
    await addModal.locator("#term-form-desc").fill("テスト");
    await addModal.getByText("保存").click();
    await expect(page.getByText("変更前用語")).toBeVisible();

    // 用語行の編集ボタンをクリック
    await page.locator('button[title="編集"]').click();

    // 編集モーダルで用語名を変更
    const editModal = page.locator(".fixed.inset-0");
    const termInput = editModal.locator("#term-form-term");
    await termInput.clear();
    await termInput.fill("変更後用語");
    await editModal.getByText("保存").click();

    // 変更が反映される
    await expect(page.getByText("変更後用語")).toBeVisible();
    await expect(page.getByText("変更前用語")).not.toBeVisible();
  });

  test("用語を削除できる", async ({ page }) => {
    // 用語集を作成して用語を追加
    await page.getByRole("button", { name: "新しい辞典を作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#glossary-form-name").fill("用語削除テスト");
    await createModal.getByText("保存").click();
    await page.getByText("用語削除テスト").click();

    await page.getByRole("button", { name: "用語を追加" }).click();
    const addModal = page.locator(".fixed.inset-0");
    await addModal.locator("#term-form-term").fill("削除対象用語");
    await addModal.locator("#term-form-desc").fill("削除テスト");
    await addModal.getByText("保存").click();
    await expect(page.getByText("削除対象用語")).toBeVisible();

    // 用語行の削除ボタンをクリック
    await page.locator('button[title="削除"]').click();

    // 確認ダイアログの OK ボタンをクリック
    const confirmDialog = page.locator('[aria-label="確認ダイアログ"]');
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "OK" }).click();

    // 用語が消えて空メッセージが表示される
    await expect(page.getByText("まだ用語が登録されていません")).toBeVisible();
  });

  // ── 検索テスト ──────────────────────────────────

  test("用語を検索できる", async ({ page }) => {
    // 用語集を作成して2つの用語を追加
    await page.getByRole("button", { name: "新しい辞典を作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#glossary-form-name").fill("検索テスト辞典");
    await createModal.getByText("保存").click();
    await page.getByText("検索テスト辞典").click();

    // 用語1を追加
    await page.getByRole("button", { name: "用語を追加" }).click();
    let addModal = page.locator(".fixed.inset-0");
    await addModal.locator("#term-form-term").fill("オフサイド");
    await addModal.locator("#term-form-desc").fill("反則の一つ");
    await addModal.getByText("保存").click();

    // 用語2を追加
    await page.getByRole("button", { name: "用語を追加" }).click();
    addModal = page.locator(".fixed.inset-0");
    await addModal.locator("#term-form-term").fill("フリーキック");
    await addModal.locator("#term-form-desc").fill("ファウル後の再開");
    await addModal.getByText("保存").click();

    // 検索欄に入力
    await page.locator('input[placeholder="用語を検索..."]').fill("オフサイド");

    // マッチする用語のみ表示される
    await expect(page.getByText("オフサイド")).toBeVisible();
    // フリーキックが非表示になる（フィルター結果）
    await expect(
      page.locator("table").getByText("フリーキック"),
    ).not.toBeVisible();
  });

  test("検索結果なしのメッセージが表示される", async ({ page }) => {
    // 用語集を作成して用語を追加
    await page.getByRole("button", { name: "新しい辞典を作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#glossary-form-name").fill("検索なしテスト");
    await createModal.getByText("保存").click();
    await page.getByText("検索なしテスト").click();

    // 用語を追加
    await page.getByRole("button", { name: "用語を追加" }).click();
    const addModal = page.locator(".fixed.inset-0");
    await addModal.locator("#term-form-term").fill("テスト用語");
    await addModal.locator("#term-form-desc").fill("説明");
    await addModal.getByText("保存").click();

    // 存在しない用語を検索
    await page
      .locator('input[placeholder="用語を検索..."]')
      .fill("存在しないキーワード");

    // 検索結果なしメッセージ
    await expect(page.getByText("検索結果が見つかりません")).toBeVisible();
  });

  test("辞典一覧に戻れる", async ({ page }) => {
    // 用語集を作成
    await page.getByRole("button", { name: "新しい辞典を作成" }).click();
    const createModal = page.locator(".fixed.inset-0");
    await createModal.locator("#glossary-form-name").fill("戻るテスト辞典");
    await createModal.getByText("保存").click();

    // 詳細画面へ
    await page.getByText("戻るテスト辞典").click();

    // 「← 辞典一覧に戻る」ボタンをクリック
    await page
      .locator("button")
      .filter({ hasText: "← 辞典一覧に戻る" })
      .click();

    // 辞典一覧に戻る（作成ボタンが見える）
    await expect(
      page.getByRole("button", { name: "新しい辞典を作成" }),
    ).toBeVisible();
  });
});
