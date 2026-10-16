// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { restoreProfileFavicon, setProfileFavicon } from "./favicon";

const icon = () => document.querySelector<HTMLLinkElement>('link[rel="icon"]');

describe("profile favicon", () => {
  beforeEach(() => {
    const values = new Map<string, string>();
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key),
      },
    });
    document.head.innerHTML = '<link rel="icon" href="/favicon.ico">';
  });

  it("uses the profile image and restores it for a signed-in user", () => {
    window.localStorage.setItem("user", JSON.stringify({ accessToken: "token" }));
    setProfileFavicon("https://example.com/logo.png");
    expect(icon()?.href).toBe("https://example.com/logo.png");

    icon()!.href = "/favicon.ico";
    restoreProfileFavicon();
    expect(icon()?.href).toBe("https://example.com/logo.png");
  });

  it("resets to the default icon when the image is cleared", () => {
    setProfileFavicon("https://example.com/photo.png");
    setProfileFavicon(null);
    expect(icon()?.getAttribute("href")).toBe("/favicon.ico");
    expect(window.localStorage.getItem("profileFavicon")).toBeNull();
  });
});
