import type { ApiResponse } from "@/api/apiClient";
import apiClient from "@/api/apiClient";
import { useAuth } from "@/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AxiosError, AxiosResponse } from "axios";
import { toast } from "sonner";

export const extract_message = (data: AxiosError<ApiResponse>) => {
  const api_error = data.response?.data?.message;
  if (!api_error) {
    return data.message;
  }
  return api_error;
};

export const useLogout = () => {
  const [user, setUser] = useAuth();
  const nav = useNavigate();
  const { mutateAsync } = useMutation({
    mutationFn: async () => {
      let resp = await apiClient.put("/auth/users/logout");
      return resp.data;
    },
    onSuccess: () => {
      setUser(null);
      nav({
        to: "/auth/login",
      });
    },
  });
  const logout = () => {
    toast.promise(mutateAsync, {
      loading: "Logging out...",
      success: extract_message,
      error: extract_message,
    });
  };
  return { logout };
};
