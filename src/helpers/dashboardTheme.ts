import { useCallback, useEffect, useState } from "react";
import Cookies from "js-cookie";

export type DashboardScope = "staff" | "tenant" | "hr";

export const DASHBOARD_THEMES = [
  "light",
  "dark",
  "halloween",
  "garden",
  "pastel",
] as const;

export const DEFAULT_DASHBOARD_THEME = "light";

export const DASHBOARD_THEME_COOKIES: Record<DashboardScope, string> = {
  staff: "kinovia_theme_staff",
  tenant: "kinovia_theme_tenant",
  hr: "kinovia_theme_hr",
};

const THEME_CHANGE_EVENT = "kinovia:dashboard-theme-change";

interface ThemeChangeDetail {
  scope: DashboardScope;
  theme: string;
}

export function getDashboardThemeCookie(scope: DashboardScope): string {
  const cookieName = DASHBOARD_THEME_COOKIES[scope];
  const saved = Cookies.get(cookieName)?.trim();
  return saved || DEFAULT_DASHBOARD_THEME;
}

export function setDashboardThemeCookie(
  scope: DashboardScope,
  theme: string,
): string {
  const normalized = theme.trim() || DEFAULT_DASHBOARD_THEME;
  const cookieName = DASHBOARD_THEME_COOKIES[scope];
  Cookies.set(cookieName, normalized, {
    expires: 365,
    path: "/",
    sameSite: "lax",
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent<ThemeChangeDetail>(THEME_CHANGE_EVENT, {
        detail: { scope, theme: normalized },
      }),
    );
  }

  return normalized;
}

export function useDashboardTheme(scope: DashboardScope) {
  const [theme, setThemeState] = useState<string>(() =>
    getDashboardThemeCookie(scope),
  );

  useEffect(() => {
    setThemeState(getDashboardThemeCookie(scope));

    const handleThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<ThemeChangeDetail>).detail;
      if (detail?.scope === scope && detail.theme) {
        setThemeState(detail.theme);
      }
    };

    window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    return () => {
      window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    };
  }, [scope]);

  const setTheme = useCallback(
    (nextTheme: string) => {
      const saved = setDashboardThemeCookie(scope, nextTheme);
      setThemeState(saved);
      return saved;
    },
    [scope],
  );

  return [theme, setTheme] as const;
}
