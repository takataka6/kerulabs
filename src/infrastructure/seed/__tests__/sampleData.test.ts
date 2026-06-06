import { describe, expect, it } from "vitest";
import { SAMPLE_TEAM_A, SAMPLE_TEAM_B } from "../sampleData";
import { getFormationNameById } from "@shared/constants/formations";

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
});
