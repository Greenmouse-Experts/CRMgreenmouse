import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./simpleApi";

export interface TicketMessage {
  id: string;
  senderId?: string;
  senderName?: string;
  senderType?: "staff" | "customer" | "admin";
  content: string;
  attachments?: string[];
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber?: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent" | string;
  status: "open" | "in_progress" | "resolved" | "closed" | string;
  contactId?: string;
  contact?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  assignedTo?: string;
  assignedStaff?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  attachments?: string[];
  messages?: TicketMessage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TicketQueryParams {
  search?: string;
  status?: string;
  priority?: string;
  assignedTo?: string;
}

export const useTickets = (params?: TicketQueryParams) => {
  return useQuery<Ticket[]>({
    queryKey: ["tickets", params],
    queryFn: async () => {
      const { data } = await apiClient.get<Ticket[]>("/tickets", {
        params,
      });
      return data;
    },
  });
};

export const useTicket = (id?: string) => {
  return useQuery<Ticket>({
    queryKey: ["tickets", id],
    queryFn: async () => {
      if (!id) throw new Error("Ticket ID required");
      const { data } = await apiClient.get<Ticket>(`/tickets/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ticket: Partial<Ticket>) => {
      const { data } = await apiClient.post<Ticket>("/tickets", ticket);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...ticket }: Partial<Ticket> & { id: string }) => {
      const { data } = await apiClient.patch<Ticket>(`/tickets/${id}`, ticket);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useDeleteTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await apiClient.delete(`/tickets/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { data } = await apiClient.patch(`/tickets/${id}/status`, { status });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useAssignTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, staffId }: { id: string; staffId: string }) => {
      const { data } = await apiClient.patch(`/tickets/${id}/assign`, { staffId });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};

export const useReplyTicketMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      content,
      attachments,
    }: {
      id: string;
      content: string;
      attachments?: string[];
    }) => {
      const { data } = await apiClient.post(`/tickets/${id}/messages`, {
        content,
        attachments,
      });
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["tickets", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });
};
