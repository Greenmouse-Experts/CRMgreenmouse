import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

// ==================== QUOTES ====================

export interface Quote {
  id: string;
  quoteNumber?: string;
  date?: string;
  clientName?: string;
  amount: number;
  description?: string;
  expiresAt?: string;
  notes?: string;
  status:
    | "draft"
    | "sent"
    | "accepted"
    | "rejected"
    | "expired"
    | "converted_to_invoice"
    | string;
  contactId?: string;
  companyRecordId?: string;
  companyId?: string;
  contact?: {
    id?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  company?: {
    id?: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuotePayload {
  date: string;
  amount: number;
  description?: string;
  status?: "draft" | "sent" | "accepted" | "rejected" | "expired" | string;
  contactId?: string;
  companyRecordId?: string;
  expiresAt?: string;
  notes?: string;
  clientName?: string;
}

export interface QuoteQueryParams {
  search?: string;
  status?: string;
}

export interface ConvertQuotePayload {
  target: "invoice" | "order" | string;
  contactId?: string;
  currency?: string;
  discount?: number;
  tax?: number;
  issuedDate?: string;
  dueDate?: string;
  notes?: string;
  assignedTo?: string;
  items?: any[];
}

export const useQuotes = (params?: QuoteQueryParams) => {
  return useQuery<Quote[]>({
    queryKey: ["quotes", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Quote[]>("/quotes", {
        params,
      });
      return (data as any)?.data ?? data;
    },
  });
};

export const useQuote = (id?: string) => {
  return useQuery<Quote>({
    queryKey: ["quotes", id],
    queryFn: async () => {
      if (!id) throw new Error("Quote ID required");
      const { data } = await apiClient.get<Quote>(`/quotes/${id}`);
      return (data as any)?.data ?? data;
    },
    enabled: !!id,
  });
};

export const useQuoteStats = () => {
  return useQuery<{
    total?: number;
    pending?: number;
    accepted?: number;
    rejected?: number;
    totalAmount?: number;
  }>({
    queryKey: ["quotes", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/quotes/stats");
      return data;
    },
  });
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (quote: Partial<Quote> | CreateQuotePayload) => {
      const { data } = await apiClient.post<Quote>("/quotes", quote);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useUpdateQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...quote
    }: (Partial<Quote> | Partial<CreateQuotePayload>) & { id: string }) => {
      const { data } = await apiClient.patch<Quote>(`/quotes/${id}`, quote);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/quotes/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useUpdateQuoteStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch<Quote>(`/quotes/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
    },
  });
};

export const useConvertQuote = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      ...payload
    }: ConvertQuotePayload & { id: string }) => {
      const { data } = await apiClient.post(`/quotes/${id}/convert`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quotes"] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// ==================== ORDERS ====================

export interface OrderItem {
  productId: string;
  product?: {
    id: string;
    name: string;
  };
  qty: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  orderNumber?: string;
  items: OrderItem[];
  quoteId?: string;
  contactId?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  discount?: number;
  tax?: number;
  currency?: string;
  total?: number;
  status: "pending" | "processing" | "completed" | "cancelled" | string;
  paymentStatus: "paid" | "unpaid" | "partial" | string;
  assignedTo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

type OrderWriteFields = Pick<
  Order,
  | "items"
  | "quoteId"
  | "discount"
  | "tax"
  | "currency"
  | "status"
  | "paymentStatus"
  | "assignedTo"
  | "notes"
> & { contactId?: string | null };

export type CreateOrderInput = Pick<OrderWriteFields, "items"> &
  Partial<Omit<OrderWriteFields, "items">>;

export type UpdateOrderInput = Partial<OrderWriteFields> & { id: string };

export interface OrderQueryParams {
  search?: string;
  status?: string;
}

export const useOrders = (params?: OrderQueryParams) => {
  return useQuery<Order[]>({
    queryKey: ["orders", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Order[]>("/orders", {
        params,
      });
      return (data as any)?.data ?? data;
    },
  });
};

export const useOrder = (id?: string) => {
  return useQuery<Order>({
    queryKey: ["orders", id],
    queryFn: async () => {
      if (!id) throw new Error("Order ID required");
      const { data } = await apiClient.get<Order>(`/orders/${id}`);
      return (data as any)?.data ?? data;
    },
    enabled: !!id,
  });
};

export const useOrderStats = () => {
  return useQuery<{
    total?: number;
    pending?: number;
    processing?: number;
    completed?: number;
    cancelled?: number;
    totalRevenue?: number;
  }>({
    queryKey: ["orders", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/orders/stats");
      return data;
    },
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: CreateOrderInput) => {
      const { data } = await apiClient.post<Order>("/orders", order);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...order }: UpdateOrderInput) => {
      const { data } = await apiClient.patch<Order>(`/orders/${id}`, order);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/orders/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/orders/${id}/status`, {
        status,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

// ==================== LEADS ====================

export interface Lead {
  id: string;
  title: string;
  contactId?: string;
  source?: string;
  status: "new" | "contacted" | "qualified" | "lost" | string;
  value?: number;
  score?: number;
  assignedTo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}

export interface LeadQueryParams {
  search?: string;
  status?: string;
  source?: string;
  assignedTo?: string;
}

export const useLeads = (params?: LeadQueryParams) => {
  return useQuery<Lead[]>({
    queryKey: ["leads", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Lead[]>("/leads", {
        params,
      });
      return (data as any)?.data ?? data;
    },
  });
};

export const useLead = (id?: string) => {
  return useQuery<Lead>({
    queryKey: ["leads", id],
    queryFn: async () => {
      if (!id) throw new Error("Lead ID required");
      const { data } = await apiClient.get<Lead>(`/leads/${id}`);
      return (data as any)?.data ?? data;
    },
    enabled: !!id,
  });
};

export const useLeadStats = () => {
  return useQuery<{
    total?: number;
    new?: number;
    contacted?: number;
    qualified?: number;
    lost?: number;
    totalValue?: number;
  }>({
    queryKey: ["leads", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/leads/stats");
      return data;
    },
  });
};

export const useCreateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lead: Partial<Lead>) => {
      const { data } = await apiClient.post<Lead>("/leads", lead);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useUpdateLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...lead }: Partial<Lead> & { id: string }) => {
      const { data } = await apiClient.patch<Lead>(`/leads/${id}`, lead);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useDeleteLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/leads/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    },
  });
};

export const useConvertLead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      dealTitle,
      dealValue,
      pipelineStageId,
    }: {
      id: string;
      dealTitle?: string;
      dealValue?: number;
      pipelineStageId?: string;
    }) => {
      const { data } = await apiClient.post(`/leads/${id}/convert`, {
        dealTitle,
        dealValue,
        pipelineStageId,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
};

// ==================== DEALS ====================

export interface Deal {
  id: string;
  title: string;
  contactId?: string;
  companyId?: string;
  pipelineStageId?: string;
  value: number;
  currency?: string;
  probability?: number;
  expectedCloseDate?: string;
  status: "open" | "won" | "lost" | string;
  assignedTo?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  company?: {
    id: string;
    name: string;
  };
}

export interface DealQueryParams {
  search?: string;
  status?: string;
  pipelineStageId?: string;
  assignedTo?: string;
}

export const useDeals = (params?: DealQueryParams) => {
  return useQuery<Deal[]>({
    queryKey: ["deals", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Deal[]>("/deals", {
        params,
      });
      return (data as any)?.data ?? data;
    },
  });
};

export const useDeal = (id?: string) => {
  return useQuery<Deal>({
    queryKey: ["deals", id],
    queryFn: async () => {
      if (!id) throw new Error("Deal ID required");
      const { data } = await apiClient.get<Deal>(`/deals/${id}`);
      return (data as any)?.data ?? data;
    },
    enabled: !!id,
  });
};

export const useDealStats = () => {
  return useQuery<{
    total?: number;
    won?: number;
    lost?: number;
    open?: number;
    totalValue?: number;
    wonValue?: number;
  }>({
    queryKey: ["deals", "stats"],
    queryFn: async () => {
      const { data } = await apiClient.get("/deals/stats");
      return data;
    },
  });
};

export const useCreateDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (deal: Partial<Deal>) => {
      const { data } = await apiClient.post<Deal>("/deals", deal);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
};

export const useUpdateDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...deal }: Partial<Deal> & { id: string }) => {
      const { data } = await apiClient.patch<Deal>(`/deals/${id}`, deal);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
};

export const useDeleteDeal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/deals/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deals"] });
    },
  });
};
