import type { ApiResponse } from "@/client/api";
import type { AxiosError } from "axios";

export const extract_message = (error: unknown): string => {
  if (!error) return "An unexpected error occurred";
  if (typeof error === "string") return error;

  const err = error as AxiosError<ApiResponse | { message?: string }> & {
    message?: string;
    payload?: { message?: string };
  };

  const responseData = err.response?.data as
    | { message?: string | string[] }
    | string
    | undefined;
  const msg =
    typeof responseData === "object" && responseData !== null
      ? responseData.message
      : undefined;
  if (Array.isArray(msg) && msg.length > 0) {
    return msg.filter(Boolean).join(", ");
  }
  if (typeof msg === "string" && msg.trim()) {
    return msg;
  }
  if (typeof responseData === "string" && responseData.trim()) {
    return responseData;
  }
  if (typeof err.payload?.message === "string" && err.payload.message.trim()) {
    return err.payload.message;
  }
  if (typeof err.message === "string" && err.message.trim()) {
    return err.message;
  }
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }
  return "An unexpected error occurred";
};
