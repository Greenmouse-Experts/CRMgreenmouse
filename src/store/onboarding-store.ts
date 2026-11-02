import { create } from "zustand";
import { persist } from "zustand/middleware";

export const TEAM_SIZES = ["1-10", "11-50", "51-200", "201-500", "500+"];

const normalizeTeamSize = (teamSize?: string) =>
  teamSize && TEAM_SIZES.includes(teamSize) ? teamSize : "";

export interface OnboardingFormData {
  industry: string;
  teamSize: string;
  logo: string | null;
  theme: "light" | "dark";
  companyAddress: string;
  companyCity: string;
  companyCountry: string;
  companyWebsite: string;
  companyState: string;
  businessType: string;
  isCacRegistered: boolean;
  hearAboutUs: string;
}

interface OnboardingState {
  step: number;
  formData: OnboardingFormData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<OnboardingFormData>) => void;
  reset: () => void;
}

const defaultFormData: OnboardingFormData = {
  industry: "",
  teamSize: "",
  logo: null,
  theme: "light",
  companyAddress: "",
  companyCity: "",
  companyCountry: "Nigeria",
  companyWebsite: "",
  companyState: "",
  businessType: "",
  isCacRegistered: false,
  hearAboutUs: "",
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      step: 1,
      formData: { ...defaultFormData },
      setStep: (step) => set({ step }),
      nextStep: () => set((state) => ({ step: state.step + 1 })),
      prevStep: () => set((state) => ({ step: Math.max(1, state.step - 1) })),
      updateFormData: (data) =>
        set((state) => ({
          formData: {
            ...state.formData,
            ...data,
            theme:
              data.theme === "dark"
                ? "dark"
                : data.theme === "light"
                  ? "light"
                  : state.formData.theme,
            teamSize: normalizeTeamSize(
              data.teamSize ?? state.formData.teamSize,
            ),
          },
        })),
      reset: () =>
        set({
          step: 1,
          formData: { ...defaultFormData },
        }),
    }),
    {
      name: "onboarding-storage",
      merge: (persistedState: any, currentState) => ({
        ...currentState,
        ...persistedState,
        formData: {
          ...currentState.formData,
          ...(persistedState?.formData ?? {}),
          theme: persistedState?.formData?.theme === "dark" ? "dark" : "light",
          teamSize: normalizeTeamSize(persistedState?.formData?.teamSize),
        },
      }),
    },
  ),
);
