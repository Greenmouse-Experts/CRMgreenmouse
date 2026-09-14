import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== DASHBOARD TYPES & HOOKS ====================

export interface DashboardStats {
  totalStaffs: number;
  totalInvoices: number;
  pendingOrders: number;
  totalCustomers: number;
  totalProducts: number;
}

export interface DashboardBalance {
  totalBalance: number;
  incomeToday: number;
  expenseToday: number;
  incomeThisMonth: number;
  expenseThisMonth: number;
}

export interface DashboardIncomeExpense {
  year: number;
  months: string[];
  income: number[];
  expense: number[];
}

export interface DashboardProfit {
  year: number;
  months: string[];
  profit: number[];
}

export interface DashboardUserAnalytics {
  users: number;
  products: number;
  expenses: number;
  revenue: number;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ["dashboard", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardStats>("/dashboard/stats");
      return data;
    },
  });
};

export const useDashboardBalance = () => {
  return useQuery<DashboardBalance>({
    queryKey: ["dashboard", "balance"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardBalance>("/dashboard/balance");
      return data;
    },
  });
};

export const useDashboardIncomeExpense = (year: number = new Date().getFullYear()) => {
  return useQuery<DashboardIncomeExpense>({
    queryKey: ["dashboard", "income-expense", year],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardIncomeExpense>(
        `/dashboard/income-expense?year=${year}`
      );
      return data;
    },
  });
};

export const useDashboardProfit = (year: number = new Date().getFullYear()) => {
  return useQuery<DashboardProfit>({
    queryKey: ["dashboard", "profit", year],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardProfit>(
        `/dashboard/profit?year=${year}`
      );
      return data;
    },
  });
};

export const useDashboardUserAnalytics = () => {
  return useQuery<DashboardUserAnalytics>({
    queryKey: ["dashboard", "user-analytics"],
    queryFn: async () => {
      const { data } = await apiClient.get<DashboardUserAnalytics>(
        "/dashboard/user-analytics"
      );
      return data;
    },
  });
};

// ==================== TENANTS TYPES & HOOKS ====================

export interface Tenant {
  id: string;
  email: string;
  companyName: string;
  phoneNumber?: string;
  isEmailVerified: boolean;
  isOnboarded: boolean;
  status: "active" | "suspended" | string;
  subscriptionStatus: "trial" | "active" | "expired" | string;
  subscriptionPlanId?: string;
  billingCycle?: string;
  trialEndsAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TenantStats {
  total: number;
  active: number;
  suspended: number;
  trial: number;
  verified: number;
}

export interface TenantFilterParams {
  search?: string;
  subscriptionStatus?: string;
  status?: string;
}

export const useAdminTenants = (params?: TenantFilterParams) => {
  return useQuery<Tenant[]>({
    queryKey: ["admin", "tenants", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.set("search", params.search);
      if (params?.subscriptionStatus && params.subscriptionStatus !== "all") {
        queryParams.set("subscriptionStatus", params.subscriptionStatus);
      }
      if (params?.status && params.status !== "all") {
        queryParams.set("status", params.status);
      }
      const queryString = queryParams.toString();
      const url = queryString ? `/admin/tenants?${queryString}` : "/admin/tenants";
      const { data } = await apiClient.get<Tenant[]>(url);
      return data;
    },
  });
};

export const useAdminTenantStats = () => {
  return useQuery<TenantStats>({
    queryKey: ["admin", "tenants", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get<TenantStats>("/admin/tenants/stats");
      return data;
    },
  });
};

export const useAdminTenant = (id?: string) => {
  return useQuery<Tenant>({
    queryKey: ["admin", "tenants", id],
    queryFn: async () => {
      if (!id) throw new Error("Tenant ID required");
      const { data } = await apiClient.get<Tenant>(`/admin/tenants/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useToggleTenantStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/admin/tenants/${id}/status`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
    },
  });
};

export const useAssignTenantSubscription = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      subscriptionPlanId,
      billingCycle,
    }: {
      id: string;
      subscriptionPlanId: string;
      billingCycle: "monthly" | "yearly";
    }) => {
      const { data } = await apiClient.patch(`/admin/tenants/${id}/subscription`, {
        subscriptionPlanId,
        billingCycle,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
    },
  });
};

// ==================== SUBSCRIPTIONS TYPES & HOOKS ====================

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  trialDays: number;
  maxStaff: number;
  maxContacts: number;
  maxProducts: number;
  maxServices: number;
  maxInvoicesPerMonth: number;
  maxOrdersPerMonth: number;
  maxCategories: number;
  features: string[];
  paystackPlanCodeMonthly?: string | null;
  paystackPlanCodeYearly?: string | null;
  isCustomPrice: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionPlansResponse {
  data: SubscriptionPlan[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const useAdminSubscriptions = (params?: {
  page?: number;
  limit?: number;
  isActive?: boolean;
}) => {
  return useQuery<SubscriptionPlansResponse>({
    queryKey: ["admin", "subscriptions", params],
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.set("page", String(params.page));
      if (params?.limit) queryParams.set("limit", String(params.limit));
      if (params?.isActive !== undefined) queryParams.set("isActive", String(params.isActive));
      const queryString = queryParams.toString();
      const url = queryString ? `/admin/subscriptions?${queryString}` : "/admin/subscriptions";
      const { data } = await apiClient.get<SubscriptionPlansResponse>(url);
      return data;
    },
  });
};

export const useCreateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (plan: Partial<SubscriptionPlan>) => {
      const { data } = await apiClient.post<SubscriptionPlan>("/admin/subscriptions", plan);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
};

export const useUpdateSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...plan }: Partial<SubscriptionPlan> & { id: string }) => {
      const { data } = await apiClient.patch<SubscriptionPlan>(
        `/admin/subscriptions/${id}`,
        plan
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
};

export const useDeleteSubscriptionPlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/admin/subscriptions/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "subscriptions"] });
    },
  });
};

// ==================== ADMIN PROFILE & SECURITY HOOKS ====================

export interface AdminProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePic?: string;
  bio?: string;
  country?: string;
  cityState?: string;
  postalCode?: string;
  taxId?: string;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useAdminProfile = () => {
  return useQuery<AdminProfile>({
    queryKey: ["admin", "profile"],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminProfile>("/admin/profile");
      return data;
    },
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: Partial<AdminProfile>) => {
      const { data } = await apiClient.patch<AdminProfile>("/admin/profile", profile);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "profile"] });
    },
  });
};

export const useChangeAdminPassword = () => {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
      confirmNewPassword: string;
    }) => {
      const { data } = await apiClient.patch("/admin/change-password", payload);
      return data;
    },
  });
};

export interface AdminPermission {
  key: string;
  description: string;
}

export const useAdminPermissions = () => {
  return useQuery<AdminPermission[]>({
    queryKey: ["admin", "permissions"],
    queryFn: async () => {
      const { data } = await apiClient.get<AdminPermission[]>("/admin/permissions");
      return data;
    },
  });
};

// ==================== STAFFS & ROLES HOOKS ====================

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  roleId?: string;
  role?: { id: string; name: string };
  status: "active" | "inactive" | string;
  profilePic?: string;
  createdAt?: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  createdAt?: string;
}

export const useStaffs = () => {
  return useQuery<StaffMember[]>({
    queryKey: ["staffs"],
    queryFn: async () => {
      const { data } = await apiClient.get<StaffMember[]>("/staffs");
      return data;
    },
  });
};

export const useRoles = () => {
  return useQuery<Role[]>({
    queryKey: ["roles"],
    queryFn: async () => {
      const { data } = await apiClient.get<Role[]>("/roles");
      return data;
    },
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (role: { name: string; description?: string; permissions: string[] }) => {
      const { data } = await apiClient.post<Role>("/roles", role);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...role }: { id: string; name?: string; description?: string; permissions?: string[] }) => {
      const { data } = await apiClient.patch<Role>(`/roles/${id}`, role);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/roles/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (staff: {
      email: string;
      firstName: string;
      lastName: string;
      phoneNumber?: string;
      roleId?: string;
      profilePic?: string;
    }) => {
      const { data } = await apiClient.post<StaffMember>("/staffs", staff);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...staff }: Partial<StaffMember> & { id: string }) => {
      const { data } = await apiClient.patch<StaffMember>(`/staffs/${id}`, staff);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/staffs/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staffs"] });
    },
  });
};
