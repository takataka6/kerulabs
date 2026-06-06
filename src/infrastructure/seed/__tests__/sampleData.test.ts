import { describe, expect, it } from "vitest";
import {
  SAMPLE_TEAM_A,
  SAMPLE_TEAM_A_TACTICS,
  SAMPLE_TEAM_B,
  SAMPLE_TEAM_B_TACTICS,
} from "../sampleData";
import { DEFAULT_TACTICS } from "../defaultTactics";
import {
  getFormationNameById,
  normalizeFormationKey,
} from "@shared/constants/formations";

describe("sampleData", () => {
  it("sample teams only expose two common formations each", () => {
    expect(SAMPLE_TEAM_A.availableFormations).toEqual(["5-4-1", "3-4-3"]);
    expect(SAMPLE_TEAM_B.availableFormations).toEqual([
      "4-4-2-flat",
      "4-2-3-1",
    ]);
  });

  it("SAMPLE_TEAM_B uses the normalized 4-4-2-flat id", () => {
    expect(SAMPLE_TEAM_B.availableFormations).toContain("4-4-2-flat");
    expect(SAMPLE_TEAM_B.availableFormations).not.toContain("4-4-2");
    expect(getFormationNameById("4-4-2-flat")).toBe("4-4-2 Flat");
    expect(SAMPLE_TEAM_B.defaultFormation).toBe("4-4-2-flat");
  });

  it("sample team formations each have matching default tactics", () => {
    const defaultTacticIds = new Set(
      DEFAULT_TACTICS.map((tactic) => tactic.id.value),
    );

    const assertFormationHasTactics = (
      formations: readonly string[],
      availableTactics: Record<string, string[]>,
    ) => {
      for (const formation of formations) {
        const tacticIds = availableTactics[normalizeFormationKey(formation)];
        expect(tacticIds?.length).toBeGreaterThan(0);

        for (const tacticId of tacticIds) {
          expect(defaultTacticIds.has(tacticId)).toBe(true);
          const tactic = DEFAULT_TACTICS.find(
            (item) => item.id.value === tacticId,
          );
          expect(tactic?.supportsFormation(formation)).toBe(true);
        }
      }
    };

    assertFormationHasTactics(
      SAMPLE_TEAM_A.availableFormations,
      SAMPLE_TEAM_A_TACTICS,
    );
    assertFormationHasTactics(
      SAMPLE_TEAM_B.availableFormations,
      SAMPLE_TEAM_B_TACTICS,
    );
  });
});
