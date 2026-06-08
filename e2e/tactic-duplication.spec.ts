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
    await page
      .getByText("複製元3ステップ")
      .waitFor({ state: "visible", timeout: 30000 });

    // Open the unified creation entry and switch to "create from existing" mode.
    await page.getByRole("button", { name: "戦術作成" }).click();
    await expect(page.getByText("作成方法を選択")).toBeVisible();
    await page.getByRole("button", { name: "既存から作成" }).click();
    await expect(
      page.getByText("コピー元にする戦術を選択してください。"),
    ).toBeVisible();

    // Select the source tactic from the list, then continue through the existing step-range dialog.
    await page.getByRole("button", { name: /複製元3ステップ/ }).click();
    await expect(page.getByText("戦術をコピー")).toBeVisible();

    await page.getByRole("button", { name: "1~2" }).click();
    await page
      .getByRole("button", { name: "コピーして作成", exact: true })
      .click();

    // Starts at metadata step so user can decide/rename the new tactic
    // (prefilled with copy suffix from the source).
    await expect(page.getByText("作成")).toBeVisible();
    // Name is prefilled in <input value="... (コピー)"> ; use attribute selector since getBy*Value may not be available
    // and getByText doesn't reliably match input values.
    await expect(page.locator('input[value*="複製元3ステップ"]')).toBeVisible();

    // Proceed past metadata (next is enabled thanks to prefilled name).
    // Use force: true because a guide/hint span in the main canvas area may intercept pointer events in this flow.
    await page.getByRole("button", { name: "次へ" }).click({ force: true });

    // We successfully advanced from metadata to the editing step.
    // A step indicator like "ステップ 3 · ..." appears in the editing UI.
    await expect(page.getByText(/ステップ \d+/)).toBeVisible({
      timeout: 10000,
    });
  });
});
