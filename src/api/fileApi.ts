import { uploadImage, uploadedFileUrl } from "./imageApi";

export const uploadFile = async (file: File): Promise<string> => {
  const response = await uploadImage(file);
  return uploadedFileUrl(response) || "";
};
