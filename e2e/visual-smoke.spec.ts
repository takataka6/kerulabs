import { expect, test } from "@playwright/test";
import {
  clearPreferences,
  clearTeams,
  seedTeam,
  waitForDBInit,
} from "./helpers";

test.describe("実ブラウザ表示スモーク", () => {
  test("主要画面をデスクトップとモバイル幅で描画できる", async ({ page }) => {
    for (const viewport of [
      { name: "desktop", width: 1280, height: 720 },
      { name: "mobile", width: 390, height: 844 },
    ]) {
      await page.setViewportSize(viewport);
      await waitForDBInit(page);

      await expect(page.locator("h1")).toContainText("KeruLabs");
      const homeShot = await page.screenshot({
        path: `test-results/visual-smoke/home-${viewport.name}.png`,
        fullPage: true,
      });
      expect(homeShot.length).toBeGreaterThan(10_000);

      await clearTeams(page);
      await clearPreferences(page);
      await seedTeam(page);
      await page.goto("/tactics-simulator");
      await page
        .locator("button")
        .filter({ hasText: "テストチームA" })
        .first()
        .dispatchEvent("click");
      await expect(
        page.locator("h1").filter({ hasText: "テストチームA" }),
      ).toBeVisible({ timeout: 15_000 });

      const canvas = page.locator("canvas").first();
      await expect(canvas).toBeVisible({ timeout: 15_000 });
      await page.waitForFunction(
        () => {
          const canvas = document.querySelector("canvas");
          if (!canvas) return false;
          const rect = canvas.getBoundingClientRect();
          return rect.width > 100 && rect.height > 100;
        },
        undefined,
        { timeout: 15_000 },
      );

      const tacticsShot = await page.screenshot({
        path: `test-results/visual-smoke/tactics-${viewport.name}.png`,
        fullPage: true,
      });
      expect(tacticsShot.length).toBeGreaterThan(10_000);
    }
  });
});
