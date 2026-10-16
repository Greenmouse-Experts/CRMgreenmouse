const DEFAULT_FAVICON = "/favicon.ico";
const STORAGE_KEY = "profileFavicon";

function updateIcon(url: string) {
  if (typeof document === "undefined") return;
  let icon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!icon) {
    icon = document.createElement("link");
    icon.rel = "icon";
    document.head.appendChild(icon);
  }
  icon.href = url;
}

export function setProfileFavicon(url?: string | null) {
  if (typeof window === "undefined") return;
  const value = url?.trim();
  const iconUrl = value && /^(https?:\/\/|\/)/i.test(value) ? value : null;
  updateIcon(iconUrl ?? DEFAULT_FAVICON);
  if (iconUrl) {
    window.localStorage.setItem(STORAGE_KEY, iconUrl);
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

export function restoreProfileFavicon() {
  if (typeof window === "undefined") return;
  const user = window.localStorage.getItem("user");
  const icon = window.localStorage.getItem(STORAGE_KEY);
  if (user && icon) updateIcon(icon);
}
