import type { ApiResponse } from "@/client/api";
import type { AxiosError } from "axios";

export const extract_message = (error: unknown): string => {
  if (!error) return "An unexpected error occurred";
  if (typeof error === "string") return error;

  const err = error as AxiosError<ApiResponse | { message?: string }> & {
    message?: string;
    payload?: { message?: string };
  };

  if (err.response?.data?.message) {
    return err.response.data.message;
  }
  if (typeof err.response?.data === "string") {
    return err.response.data;
  }
  if (typeof err.payload?.message === "string") {
    return err.payload.message;
  }
  if (typeof err.message === "string") {
    return err.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unexpected error occurred";
};
