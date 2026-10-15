import { describe, expect, it } from "vitest";
import { uploadedFileUrl } from "./imageApi";

describe("uploadedFileUrl", () => {
  it("reads the current top-level multimedia response", () => {
    expect(
      uploadedFileUrl({
        message: "File uploaded successfully",
        url: "https://example.com/attachment.jpg",
        publicId: "CRM/attachment",
        resourceType: "image",
      }),
    ).toBe("https://example.com/attachment.jpg");
  });

  it("accepts older nested responses and rejects a missing URL", () => {
    expect(uploadedFileUrl({ data: { url: "https://example.com/old.jpg" } })).toBe(
      "https://example.com/old.jpg",
    );
    expect(uploadedFileUrl({ message: "File uploaded" })).toBeUndefined();
  });
});
