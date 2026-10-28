// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { sanitizeRichText } from "./RichTextEditor";

describe("sanitizeRichText", () => {
  it("keeps note formatting without executable markup", () => {
    const result = sanitizeRichText(
      '<p onclick="alert(1)"><strong>Pack carefully</strong></p><script>alert(1)</script><ul><li>Fragile</li></ul>',
    );

    expect(result).toBe("<p><strong>Pack carefully</strong></p><ul><li>Fragile</li></ul>");
  });

  it("preserves legacy plain-text notes", () => {
    expect(sanitizeRichText("First line\nSecond line")).toBe(
      "First line<br>Second line",
    );
  });

  it("rejects formatting without visible text", () => {
    expect(sanitizeRichText("<p><br></p>")).toBe("");
  });
});
