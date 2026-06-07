import { test, expect, type Page } from "@playwright/test";
import {
  waitForDBInit,
  seedTeam,
  seedTactic,
  clearTeams,
  clearTactics,
  clearPreferences,
} from "./helpers";

const CANVAS_LABEL = "戦術フィールド 3Dビュー";

async function waitForTacticsMainScreen(page: Page) {
  await expect(
    page.locator("h1").filter({ hasText: "テストチームA" }),
  ).toBeVisible({ timeout: 15000 });
  await expect(page.locator("aside")).toBeVisible({ timeout: 15000 });
  await expect(page.locator("#main-content")).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole("img", { name: CANVAS_LABEL })).toBeVisible({
    timeout: 15000,
  });
}

async function setupTacticsPage(
  page: Page,
  tactics: Parameters<typeof seedTactic>[1][],
) {
  await waitForDBInit(page);
  await clearTeams(page);
  await clearTactics(page);
  await clearPreferences(page);
  await seedTeam(page);
  for (const tactic of tactics) {
    await seedTactic(page, tactic);
  }
  await page.goto("/tactics-simulator");
  await page.waitForSelector("text=チームを選択してください", {
    timeout: 15000,
  });
  await page.getByText("テストチームA").click();
  await waitForTacticsMainScreen(page);
}

test.describe("戦術複製 E2E", () => {
  test.setTimeout(90000); // Increased for CI (seeding + navigation + async list render + modal flow)

  test("既存戦術の途中ステップまで複製して作成モードに入れる", async ({
    page,
  }) => {
    await setupTacticsPage(page, [
      {
        id: "e2e-duplicate-source",
        name: { ja: "複製元3ステップ", en: "Duplicate Source" },
        movements: {
          "4-3-3": [
            {
              role: "CF",
              targetX: 0,
              targetZ: 4.4,
              delay: 0,
              arrowColor: "#ef4444",
            },
            {
              role: "WAL",
              targetX: 1.4,
              targetZ: 3.4,
              delay: 800,
              arrowColor: "#22c55e",
            },
            {
              role: "WAR",
              targetX: -1.6,
              targetZ: 3.1,
              delay: 1700,
              arrowColor: "#3b82f6",
            },
          ],
        },
        stepBoundaries: [0, 800, 1700],
      },
    ]);

    // Wait for the seeded tactic name to appear in the list (after team selection + DB seed).
    // Scope to a container that contains the tactic name text, then find the duplicate button by its stable testid.
    // This is robust against nested spans in the row rendering.
    await page
      .getByText("複製元3ステップ")
      .waitFor({ state: "visible", timeout: 30000 });

    await page
      .locator('div, li, [role="listitem"]')
      .filter({ hasText: "複製元3ステップ" })
      .getByTestId("tactic-duplicate-button")
      .click();
    await expect(page.getByText("戦術をコピー")).toBeVisible();

    await page.getByRole("button", { name: "ステップ 2" }).click();
    await page.getByRole("button", { name: "コピーして作成" }).click();

    // Starts at metadata step so user can decide/rename the new tactic
    // (prefilled with copy suffix from the source).
    await expect(page.getByText("作成")).toBeVisible();
    await expect(page.getByText(/複製元3ステップ.*コピー/)).toBeVisible();

    // Proceed past metadata (next is enabled thanks to prefilled name)
    await page.getByRole("button", { name: "次へ" }).click();

    // Copied prefix steps are now in the editing UI (plus one new empty step for continuation)
    await expect(
      page.getByRole("button", { name: "ステップ 1 (1件)" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ステップ 2 (1件)" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "ステップ 3" })).toHaveCount(
      0,
    );
  });
});
