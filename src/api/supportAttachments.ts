import { uploadImage, uploadedFileUrl } from "./imageApi";

export async function uploadTicketAttachments(
  files: File[],
): Promise<string[]> {
  const uploaded = await Promise.all(files.map((file) => uploadImage(file)));
  return uploaded.map((response) => {
    const url = uploadedFileUrl(response);
    if (!url) throw new Error("An attachment upload returned no URL.");
    return url;
  });
}
