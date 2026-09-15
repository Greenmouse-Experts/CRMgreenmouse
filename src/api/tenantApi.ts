import { useQuery } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export interface TenantProfile {
  sub: string;
  email: string;
  companyName: string;
  userType: "tenant" | string;
  isOnboarded: boolean;
}

export interface TenantOnboardingData {
  id?: string;
  _id?: string;
  companyName: string;
  isOnboarded: boolean;
  industry?: string;
  teamSize?: string;
  logo?: string | null;
  theme?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyCountry?: string;
  companyWebsite?: string;
  businessType?: string;
  isCacRegistered?: boolean;
  hearAboutUs?: string;
}

export interface LoginActivity {
  id?: string;
  _id?: string;
  ipAddress?: string;
  userAgent?: string;
  device?: string;
  browser?: string;
  os?: string;
  location?: string;
  createdAt?: string;
  timestamp?: string;
  status?: string;
}

export interface LoginActivityResponse {
  data?: LoginActivity[];
  total?: number;
  page?: number;
  limit?: number;
}

export const useTenantMe = () => {
  return useQuery<TenantProfile>({
    queryKey: ["tenant", "me"],
    queryFn: async () => {
      const { data } = await apiClient.get<TenantProfile>("/tenant/auth/me");
      return data;
    },
  });
};

export const useTenantOnboarding = () => {
  return useQuery<TenantOnboardingData>({
    queryKey: ["tenant", "onboarding"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tenant/onboarding");
      return data?.data ?? data;
    },
  });
};

export const useTenantLoginActivity = (params?: {
  page?: number;
  limit?: number;
}) => {
  return useQuery<LoginActivity[]>({
    queryKey: ["tenant", "login-activity", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/tenant/login-activity", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      return [];
    },
  });
};

export const useTenantLatestLoginActivity = () => {
  return useQuery<LoginActivity | null>({
    queryKey: ["tenant", "login-activity", "latest"],
    queryFn: async () => {
      const { data } = await apiClient.get<any>(
        "/tenant/login-activity/latest",
      );
      return data?.data ?? data ?? null;
    },
  });
};
