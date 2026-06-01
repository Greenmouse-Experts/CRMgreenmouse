import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingFormData {
  email: string;
  industry: string;
  teamSize: string;
  logo: string;
  theme: string;
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
  email: "",
  industry: "",
  teamSize: "",
  logo: "",
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
          formData: { ...state.formData, ...data },
        })),
      reset: () =>
        set({
          step: 1,
          formData: { ...defaultFormData },
        }),
    }),
    { name: "onboarding-storage" },
  ),
);
