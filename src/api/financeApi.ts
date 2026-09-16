import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== INCOME ====================\n
export interface IncomeRecord {
  id: string;
  amount: number;
  type: string; // e.g., "Salary", "Grant", "Sales", "Commission", etc.
  source: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IncomeQueryParams {
  search?: string;
  status?: string;
  type?: string;
}

export const useIncomeRecords = (params?: IncomeQueryParams) => {
  return useQuery<IncomeRecord[]>({
    queryKey: ["income", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/income", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.income)) return data.income;
      return [];
    },
  });
};

export const useCreateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: Partial<IncomeRecord>) => {
      const { data } = await apiClient.post<any>("/income", record);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
    },
  });
};

export const useUpdateIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...record
    }: Partial<IncomeRecord> & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/income/${id}`, record);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
    },
  });
};

export const useDeleteIncome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/income/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
    },
  });
};

export const useUpdateIncomeStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/income/${id}/status`, {
        status,
      });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
    },
  });
};

// ==================== EXPENSES ====================\n
export interface ExpenseRecord {
  id: string;
  amount: number;
  category: string; // e.g., "Software", "Travel", "Insurance", "Office Supplies"
  paidTo: string;
  description?: string;
  status: "Pending" | "Approved" | "Rejected" | string;
  date?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ExpenseQueryParams {
  search?: string;
  status?: string;
  category?: string;
}

export const useExpenseRecords = (params?: ExpenseQueryParams) => {
  return useQuery<ExpenseRecord[]>({
    queryKey: ["expenses", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/expenses", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.expenses)) return data.expenses;
      return [];
    },
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (record: Partial<ExpenseRecord>) => {
      const { data } = await apiClient.post<any>("/expenses", record);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...record
    }: Partial<ExpenseRecord> & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/expenses/${id}`, record);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/expenses/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

export const useUpdateExpenseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/expenses/${id}/status`, {
        status,
      });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
    },
  });
};

// ==================== INVOICES ====================\n
export interface InvoiceItem {
  description: string;
  qty: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber?: string;
  issuedDate?: string;
  dueDate?: string;
  paidAt?: string;
  items: InvoiceItem[];
  orderId?: string;
  contactId?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  billingAddress?: string;
  discount?: number;
  tax?: number;
  currency?: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled" | string;
  pdfUrl?: string;
  total?: number;
  amountDue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface InvoiceQueryParams {
  search?: string;
  contactId?: string;
  status?: string;
}

export const useInvoices = (params?: InvoiceQueryParams) => {
  return useQuery<Invoice[]>({
    queryKey: ["invoices", params],
    queryFn: async () => {
      const { data } = await apiClient.get<any>("/invoices", {
        params,
      });
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.invoices)) return data.invoices;
      return [];
    },
  });
};

export const useInvoice = (id?: string) => {
  return useQuery<Invoice>({
    queryKey: ["invoices", id],
    queryFn: async () => {
      if (!id) throw new Error("Invoice ID required");
      const { data } = await apiClient.get<any>(`/invoices/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
};

export interface InvoiceStatsData {
  total?: number;
  paid?: number;
  pending?: number;
  overdue?: number;
  draft?: number;
  sent?: number;
  revenue?: number;
  paidAmount?: number;
  pendingAmount?: number;
}

export const useInvoiceStats = () => {
  return useQuery<InvoiceStatsData>({
    queryKey: ["invoices", "stats"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<any>("/invoices/stats");
        return data?.data || data || {};
      } catch {
        return {};
      }
    },
  });
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (invoice: Partial<Invoice>) => {
      const { data } = await apiClient.post<any>("/invoices", invoice);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...invoice
    }: Partial<Invoice> & { id: string }) => {
      const { data } = await apiClient.patch<any>(`/invoices/${id}`, invoice);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/invoices/${id}`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useUpdateInvoiceStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/invoices/${id}/status`, {
        status,
      });
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useSendInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/invoices/${id}/send`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useMarkInvoicePaid = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/invoices/${id}/mark-paid`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

export const useCancelInvoice = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.patch(`/invoices/${id}/cancel`);
      return data?.data || data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
    },
  });
};

// ==================== TRANSACTIONS ====================\n
export interface Transaction {
  id: string;
  date: string;
  type:
    | "Income"
    | "Expense"
    | "Invoice Payment"
    | "Deposit"
    | "Withdrawal"
    | string;
  amount: number;
  description: string;
  status: "Completed" | "Pending" | "Failed" | string;
  reference?: string;
  category?: string;
}

export const useTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      try {
        const { data } = await apiClient.get<any>("/transactions");
        const res = Array.isArray(data)
          ? data
          : data?.data || data?.transactions;
        if (Array.isArray(res)) return res;
        throw new Error("Not an array");
      } catch (err: any) {
        // Fallback: If no standalone /transactions endpoint, synthesize from Income & Expenses
        if (err?.response?.status === 404 || !err?.response) {
          const [incomeRes, expenseRes] = await Promise.allSettled([
            apiClient.get<any>("/income"),
            apiClient.get<any>("/expenses"),
          ]);
          const list: Transaction[] = [];
          if (incomeRes.status === "fulfilled") {
            const incData = Array.isArray(incomeRes.value.data)
              ? incomeRes.value.data
              : incomeRes.value.data?.data || [];
            if (Array.isArray(incData)) {
              incData.forEach((inc: any) => {
                list.push({
                  id: inc.id,
                  date: inc.date || inc.createdAt || new Date().toISOString(),
                  type: "Income",
                  amount: Number(inc.amount),
                  description: inc.description || `Income from ${inc.source}`,
                  status:
                    inc.status === "Approved"
                      ? "Completed"
                      : inc.status === "Rejected"
                        ? "Failed"
                        : "Pending",
                  category: inc.type,
                });
              });
            }
          }
          if (expenseRes.status === "fulfilled") {
            const expData = Array.isArray(expenseRes.value.data)
              ? expenseRes.value.data
              : expenseRes.value.data?.data || [];
            if (Array.isArray(expData)) {
              expData.forEach((exp: any) => {
                list.push({
                  id: exp.id,
                  date: exp.date || exp.createdAt || new Date().toISOString(),
                  type: "Expense",
                  amount: -Math.abs(Number(exp.amount)),
                  description: exp.description || `Payment to ${exp.paidTo}`,
                  status:
                    exp.status === "Approved"
                      ? "Completed"
                      : exp.status === "Rejected"
                        ? "Failed"
                        : "Pending",
                  category: exp.category,
                });
              });
            }
          }
          return list.sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          );
        }
        throw err;
      }
    },
  });
};
