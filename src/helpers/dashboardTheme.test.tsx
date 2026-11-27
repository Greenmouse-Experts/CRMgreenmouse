// @vitest-environment jsdom
import { fireEvent, render, screen } from "@testing-library/react";
import Cookies from "js-cookie";
import { beforeEach, describe, expect, it } from "vitest";
import DashboardThemePicker from "@/components/settings/DashboardThemePicker";
import {
  DASHBOARD_THEME_COOKIES,
  DEFAULT_DASHBOARD_THEME,
  getDashboardThemeCookie,
  setDashboardThemeCookie,
  useDashboardTheme,
  type DashboardScope,
} from "./dashboardTheme";

function ScopeHarness({ scope }: { scope: DashboardScope }) {
  const [theme] = useDashboardTheme(scope);
  return <div data-testid={`layout-${scope}`} data-theme={theme} />;
}

describe("dashboardTheme", () => {
  beforeEach(() => {
    for (const cookieName of Object.values(DASHBOARD_THEME_COOKIES)) {
      Cookies.remove(cookieName, { path: "/" });
    }
    document.documentElement.setAttribute("data-theme", "light");
  });

  it("defaults to light when no cookie is set", () => {
    expect(getDashboardThemeCookie("staff")).toBe(DEFAULT_DASHBOARD_THEME);
    expect(getDashboardThemeCookie("tenant")).toBe(DEFAULT_DASHBOARD_THEME);
    expect(getDashboardThemeCookie("hr")).toBe(DEFAULT_DASHBOARD_THEME);
  });

  it("stores independent cookies per dashboard without mutating documentElement", () => {
    setDashboardThemeCookie("staff", "dark");
    setDashboardThemeCookie("tenant", "garden");
    setDashboardThemeCookie("hr", "halloween");

    expect(Cookies.get(DASHBOARD_THEME_COOKIES.staff)).toBe("dark");
    expect(Cookies.get(DASHBOARD_THEME_COOKIES.tenant)).toBe("garden");
    expect(Cookies.get(DASHBOARD_THEME_COOKIES.hr)).toBe("halloween");
    expect(getDashboardThemeCookie("staff")).toBe("dark");
    expect(getDashboardThemeCookie("tenant")).toBe("garden");
    expect(getDashboardThemeCookie("hr")).toBe("halloween");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("updates only the matching dashboard route data-theme when a theme is clicked", () => {
    render(
      <>
        <ScopeHarness scope="staff" />
        <ScopeHarness scope="tenant" />
        <ScopeHarness scope="hr" />
        <DashboardThemePicker scope="hr" />
      </>,
    );

    expect(screen.getByTestId("layout-staff").getAttribute("data-theme")).toBe(
      "light",
    );
    expect(screen.getByTestId("layout-tenant").getAttribute("data-theme")).toBe(
      "light",
    );
    expect(screen.getByTestId("layout-hr").getAttribute("data-theme")).toBe(
      "light",
    );

    fireEvent.click(screen.getByText("pastel"));

    expect(Cookies.get(DASHBOARD_THEME_COOKIES.hr)).toBe("pastel");
    expect(screen.getByTestId("layout-hr").getAttribute("data-theme")).toBe(
      "pastel",
    );
    expect(screen.getByTestId("layout-staff").getAttribute("data-theme")).toBe(
      "light",
    );
    expect(screen.getByTestId("layout-tenant").getAttribute("data-theme")).toBe(
      "light",
    );
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
