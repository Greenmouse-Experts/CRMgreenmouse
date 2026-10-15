import apiClient from "./simpleApi";
import { useMutation } from "@tanstack/react-query";

export interface UPLOAD_IMAGE_RESPONSE {
  message?: string;
  url?: string;
  publicId?: string;
  resourceType?: string;
  data?: { url?: string; publicId?: string };
  payload?: { url?: string; publicId?: string };
}

export const uploadedFileUrl = (response: UPLOAD_IMAGE_RESPONSE): string | undefined =>
  response.url || response.data?.url || response.payload?.url;

export const uploadImage = async (
  image: File | Blob,
): Promise<UPLOAD_IMAGE_RESPONSE> => {
  const formData = new FormData();
  formData.append("file", image);

  const resp = await apiClient.post<UPLOAD_IMAGE_RESPONSE>("multimedia/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return resp.data;
};

export const useUploadImage = () => {
  return useMutation({
    mutationFn: (image: File | Blob) => uploadImage(image),
  });
};
