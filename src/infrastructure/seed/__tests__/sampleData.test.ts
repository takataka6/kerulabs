import { describe, expect, it } from "vitest";
import { SAMPLE_TEAM_A, SAMPLE_TEAM_B } from "../sampleData";
import { DEFAULT_TACTICS } from "../defaultTactics";
import { getFormationNameById } from "@shared/constants/formations";

describe("sampleData", () => {
  it("sample teams expose the expected built-in formations", () => {
    expect(SAMPLE_TEAM_A.availableFormations).toEqual(["4-3-3", "4-2-3-1"]);
    expect(SAMPLE_TEAM_B.availableFormations).toEqual([
      "4-4-2-flat",
      "4-2-3-1",
    ]);
  });

  it("SAMPLE_TEAM_A defaults to 4-3-3", () => {
    expect(SAMPLE_TEAM_A.defaultFormation).toBe("4-3-3");
  });

  it("SAMPLE_TEAM_B uses the normalized 4-4-2-flat id", () => {
    expect(SAMPLE_TEAM_B.availableFormations).toContain("4-4-2-flat");
    expect(SAMPLE_TEAM_B.availableFormations).not.toContain("4-4-2");
    expect(getFormationNameById("4-4-2-flat")).toBe("4-4-2 Flat");
    expect(SAMPLE_TEAM_B.defaultFormation).toBe("4-4-2-flat");
  });

  it("default tactics include step-executable samples", () => {
    const stepTacticIds = DEFAULT_TACTICS.filter(
      (tactic) => tactic.supportsStepExecution,
    ).map((tactic) => tactic.id.value);

    expect(stepTacticIds).toEqual(
      expect.arrayContaining(["LEFT_SB_OVERLAP", "RIGHT_SB_OVERLAP"]),
    );
  });
});
