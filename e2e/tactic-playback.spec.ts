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

type SeedTacticInput = Parameters<typeof seedTactic>[1];

async function setupTacticsPage(page: Page, tactics: SeedTacticInput[]) {
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

function checksumBuffer(buffer: Buffer): number {
  let checksum = 0;
  for (let i = 0; i < buffer.length; i += 137) {
    checksum = (checksum + (buffer[i] ?? 0) * (i + 1)) % 1000000007;
  }
  return checksum;
}

async function getCanvasScreenshotChecksum(page: Page) {
  const canvasRegion = page.getByRole("img", { name: CANVAS_LABEL });
  await expect(canvasRegion).toBeVisible({ timeout: 15000 });
  const screenshot = await canvasRegion.screenshot();
  return {
    checksum: checksumBuffer(screenshot),
    size: screenshot.length,
  };
}

test.describe("戦術再生 E2E", () => {
  test.setTimeout(60000);

  test("UIから通常戦術を再生すると3Dキャンバスが更新される", async ({
    page,
  }) => {
    await setupTacticsPage(page, [
      {
        id: "e2e-playback-run",
        name: { ja: "E2E再生確認", en: "E2E Playback Run" },
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
              delay: 200,
              arrowColor: "#22c55e",
            },
          ],
        },
        ballPasses: {
          "4-3-3": [
            {
              startRole: "CF",
              endRole: "WAR",
              delay: 250,
              color: "#facc15",
              trajectoryType: "high",
            },
          ],
        },
        ballPosition: { x: 0, z: 2.5 },
      },
    ]);

    const before = await getCanvasScreenshotChecksum(page);
    expect(before.size).toBeGreaterThan(1000);

    await page.getByRole("button", { name: /E2E再生確認/ }).click();
    await expect(page.getByRole("img", { name: CANVAS_LABEL })).toContainText(
      "E2E再生確認",
      { timeout: 5000 },
    );

    await page.waitForTimeout(900);
    const after = await getCanvasScreenshotChecksum(page);
    expect(after.checksum).not.toBe(before.checksum);
  });
});
