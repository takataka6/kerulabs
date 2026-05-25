import { test, expect } from "@playwright/test";
import { waitForDBInit } from "./helpers";

test.describe("サンプルデータ挿入", () => {
  test.beforeEach(async ({ page }) => {
    await waitForDBInit(page);
  });

  test("サンプルデータ挿入ボタンでデータが追加される", async ({ page }) => {
    // コンソールエラーを収集
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") consoleErrors.push(msg.text());
    });
    page.on("pageerror", (err) => consoleErrors.push(err.message));

    // サンプルデータ挿入ボタンをクリック
    await page.getByText("サンプルデータ挿入").click();

    // 確認ダイアログのOKをクリック
    const confirmButton = page.getByRole("button", { name: "OK" });
    await expect(confirmButton).toBeVisible({ timeout: 5000 });
    await confirmButton.click();

    // 成功トーストが表示されるのを待つ
    await expect(page.getByText("サンプルデータを挿入しました")).toBeVisible({
      timeout: 15000,
    });

    // IndexedDB にチームが2件保存されたことを確認
    const teamCount = await page.evaluate(async () => {
      return new Promise<number>((resolve, reject) => {
        const req = indexedDB.open("tactics_simulator_db");
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("teams", "readonly");
          const countReq = tx.objectStore("teams").count();
          countReq.onsuccess = () => {
            db.close();
            resolve(countReq.result);
          };
          countReq.onerror = () => {
            db.close();
            reject(countReq.error);
          };
        };
        req.onerror = () => reject(req.error);
      });
    });
    expect(teamCount).toBeGreaterThanOrEqual(2);

    // 用語集が1件保存されたことを確認
    const glossaryCount = await page.evaluate(async () => {
      return new Promise<number>((resolve, reject) => {
        const req = indexedDB.open("tactics_simulator_db");
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("glossaries", "readonly");
          const countReq = tx.objectStore("glossaries").count();
          countReq.onsuccess = () => {
            db.close();
            resolve(countReq.result);
          };
          countReq.onerror = () => {
            db.close();
            reject(countReq.error);
          };
        };
        req.onerror = () => reject(req.error);
      });
    });
    expect(glossaryCount).toBeGreaterThanOrEqual(1);

    // マニュアルが1件保存されたことを確認
    const manualCount = await page.evaluate(async () => {
      return new Promise<number>((resolve, reject) => {
        const req = indexedDB.open("tactics_simulator_db");
        req.onsuccess = () => {
          const db = req.result;
          const tx = db.transaction("teamManuals", "readonly");
          const countReq = tx.objectStore("teamManuals").count();
          countReq.onsuccess = () => {
            db.close();
            resolve(countReq.result);
          };
          countReq.onerror = () => {
            db.close();
            reject(countReq.error);
          };
        };
        req.onerror = () => reject(req.error);
      });
    });
    expect(manualCount).toBeGreaterThanOrEqual(1);

    // コンソールエラーがないことを確認
    expect(consoleErrors).toEqual([]);
  });
});
