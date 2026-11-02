import { beforeEach, describe, expect, it } from "vitest";
import { TEAM_SIZES, useOnboardingStore } from "./onboarding-store";

describe("onboarding team size", () => {
  beforeEach(() => useOnboardingStore.getState().reset());

  it("starts without a selected team size", () => {
    expect(useOnboardingStore.getState().formData.teamSize).toBe("");
  });

  it("keeps only values accepted by the backend", () => {
    for (const teamSize of TEAM_SIZES) {
      useOnboardingStore.getState().updateFormData({ teamSize });
      expect(useOnboardingStore.getState().formData.teamSize).toBe(teamSize);
    }

    useOnboardingStore.getState().updateFormData({ teamSize: "1-20" });
    expect(useOnboardingStore.getState().formData.teamSize).toBe("");
  });
});
