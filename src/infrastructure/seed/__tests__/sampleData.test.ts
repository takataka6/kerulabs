import { describe, expect, it } from "vitest";
import { SAMPLE_TEAM_B } from "../sampleData";

describe("sampleData", () => {
  it("SAMPLE_TEAM_B uses 4-4-2 Flat instead of the legacy 4-4-2 name", () => {
    expect(SAMPLE_TEAM_B.availableFormations).toContain("4-4-2 Flat");
    expect(SAMPLE_TEAM_B.availableFormations).not.toContain("4-4-2");
    expect(SAMPLE_TEAM_B.defaultFormation).toBe("4-4-2 Flat");
  });
});
