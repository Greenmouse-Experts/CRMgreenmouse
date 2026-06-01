import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface OnboardingFormData {
  _id: string;
  email: string;
  industry: string;
  teamSize: string;
  companyName: string;
  companyCity: string;
  companyCountry: string;
  companyWebsite: string;
  companyState: string;
  companyAddress: string;
  businessType: string;
  isCacRegistered: boolean;
  hearAboutUs: string;
  fullName: string;
  phoneNumber: string;
  username: string;
  logo: string | null;
  theme: string;
  isOnboarded: boolean;
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
  _id: "",
  email: "",
  industry: "",
  teamSize: "",
  companyName: "",
  companyCity: "",
  companyCountry: "Nigeria",
  companyWebsite: "",
  companyState: "",
  companyAddress: "",
  businessType: "",
  isCacRegistered: false,
  hearAboutUs: "",
  fullName: "",
  phoneNumber: "",
  username: "",
  logo: null,
  theme: "light",
  isOnboarded: false,
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
