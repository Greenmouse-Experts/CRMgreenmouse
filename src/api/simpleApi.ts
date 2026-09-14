import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { get_user_value, set_user_value } from "@/store/authStore";

export interface ApiResponse<T = any> {
  message: string;
  data: T;
  // status: string;
  statusCode: number;
  path: string;
  pagination: Pagination;
}
export interface Pagination {
  hasMore: boolean;
  limit: number;
  nextCursor: string | null;
  total: number;
}
export interface ApiResponseV2<T = any> {
  message?: string;
  data: { data: T; pagination: Pagination } & { [key: string]: any };
  // status: string;
  status: number;
  path: string;
}
export const new_url =
  import.meta.env.VITE_API_URL ?? "https://crmgrenmouse-backend-api.onrender.com/";

const apiClient = axios.create({
  baseURL: new_url,
  withCredentials: true,
});

apiClient.interceptors.request.use((config) => {
  const user = get_user_value();
  if (user?.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      try {
        const user = get_user_value();
        if (user?.refreshToken) {
          const { data } = await axios.post(`${new_url}auth/refresh`, {
            refreshToken: user.refreshToken,
          });
          const newAccessToken = data.accessToken || data.data?.accessToken;
          const newRefreshToken = data.refreshToken || data.data?.refreshToken;
          if (newAccessToken) {
            set_user_value({
              ...user,
              accessToken: newAccessToken,
              refreshToken: newRefreshToken || user.refreshToken,
            });
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(original);
          }
        }
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);
      }
    }
    return Promise.reject(error);
  },
);

export const test_route = (route: string) =>
  useQuery({
    queryKey: ["test_route", route],
    queryFn: async () => {
      let resp = await apiClient.get(route);
      return resp;
    },
  });
export default apiClient;
