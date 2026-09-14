import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== COMPANIES ====================

export interface Company {
  id: string;
  name: string;
  industry?: string;
  federalIdNumber?: string;
  groupName?: string;
  workPhone?: string;
  email?: string;
  website?: string;
  dateJoined?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useCompanies = () => {
  return useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: async () => {
      const { data } = await apiClient.get<Company[]>("/companies");
      return data;
    },
  });
};

export const useCompany = (id?: string) => {
  return useQuery<Company>({
    queryKey: ["companies", id],
    queryFn: async () => {
      if (!id) throw new Error("Company ID required");
      const { data } = await apiClient.get<Company>(`/companies/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (company: Partial<Company>) => {
      const { data } = await apiClient.post<Company>("/companies", company);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...company }: Partial<Company> & { id: string }) => {
      const { data } = await apiClient.patch<Company>(`/companies/${id}`, company);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

export const useDeleteCompany = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/companies/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });
};

// ==================== CUSTOMERS ====================

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  workPhone?: string;
  cellPhone?: string;
  companyId?: string;
  company?: Company;
  source?: string;
  assignedStaffId?: string;
  addressLine1?: string;
  city?: string;
  state?: string;
  country?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const useCustomers = () => {
  return useQuery<Customer[]>({
    queryKey: ["customers"],
    queryFn: async () => {
      const { data } = await apiClient.get<Customer[]>("/customers");
      return data;
    },
  });
};

export const useCustomer = (id?: string) => {
  return useQuery<Customer>({
    queryKey: ["customers", id],
    queryFn: async () => {
      if (!id) throw new Error("Customer ID required");
      const { data } = await apiClient.get<Customer>(`/customers/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (customer: Partial<Customer>) => {
      const { data } = await apiClient.post<Customer>("/customers", customer);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...customer }: Partial<Customer> & { id: string }) => {
      const { data } = await apiClient.patch<Customer>(`/customers/${id}`, customer);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/customers/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};

// ==================== CATEGORIES ====================

export interface Category {
  id: string;
  name: string;
  description?: string;
  type?: "product" | "service" | string;
  createdAt?: string;
}

export const useCategories = () => {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get<Category[]>("/categories");
      return data;
    },
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (category: Partial<Category>) => {
      const { data } = await apiClient.post<Category>("/categories", category);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...category }: Partial<Category> & { id: string }) => {
      const { data } = await apiClient.patch<Category>(`/categories/${id}`, category);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/categories/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
