// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import RestrictPage, {
  getDefaultDashboardRoute,
  isAccountAllowed,
  resolveAccountPortalType,
} from "./RestrictPage";
import { useAuth, type AuthUser } from "@/store/authStore";

const mockNavigate = vi.fn();

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock("@/store/authStore", () => ({
  useAuth: vi.fn(),
}));

const makeAuth = (userType: string, roleName?: string): AuthUser => ({
  accessToken: "token",
  refreshToken: "refresh",
  user: {
    id: "user-1",
    email: "user@example.com",
    userType,
    role: roleName ? { id: "role-1", name: roleName } : undefined,
  },
});

describe("RestrictPage access rules", () => {
  afterEach(() => {
    cleanup();
  });

  beforeEach(() => {
    mockNavigate.mockReset();
    vi.mocked(useAuth).mockReset();
  });

  it("resolves HR, staff, tenant, and admin portal types like auth/staff login", () => {
    expect(resolveAccountPortalType(makeAuth("staff", "HR"))).toBe("hr");
    expect(resolveAccountPortalType(makeAuth("hr"))).toBe("hr");
    expect(resolveAccountPortalType(makeAuth("staff", "staff"))).toBe("staff");
    expect(resolveAccountPortalType(makeAuth("staff", "Developer"))).toBe(
      "staff",
    );
    expect(resolveAccountPortalType(makeAuth("tenant"))).toBe("tenant");
    expect(resolveAccountPortalType(makeAuth("admin"))).toBe("admin");
    expect(resolveAccountPortalType(null)).toBeNull();
  });

  it("allows tenant and hr on HR routes, and blocks non-HR staff and admin", () => {
    expect(isAccountAllowed(makeAuth("tenant"), ["tenant", "hr"])).toBe(true);
    expect(isAccountAllowed(makeAuth("staff", "hr"), ["tenant", "hr"])).toBe(
      true,
    );
    expect(isAccountAllowed(makeAuth("hr"), ["tenant", "hr"])).toBe(true);

    expect(isAccountAllowed(makeAuth("staff", "staff"), ["tenant", "hr"])).toBe(
      false,
    );
    expect(isAccountAllowed(makeAuth("staff", "Sales"), ["tenant", "hr"])).toBe(
      false,
    );
    expect(isAccountAllowed(makeAuth("admin"), ["tenant", "hr"])).toBe(false);
  });

  it("allows only regular staff on /staff routes", () => {
    expect(isAccountAllowed(makeAuth("staff", "staff"), "staff")).toBe(true);
    expect(isAccountAllowed(makeAuth("staff", "QA"), "staff")).toBe(true);
    expect(isAccountAllowed(makeAuth("staff"), "staff")).toBe(true);

    expect(isAccountAllowed(makeAuth("tenant"), "staff")).toBe(false);
    expect(isAccountAllowed(makeAuth("staff", "HR"), "staff")).toBe(false);
    expect(isAccountAllowed(makeAuth("hr"), "staff")).toBe(false);
    expect(isAccountAllowed(makeAuth("admin"), "staff")).toBe(false);
  });

  it("renders children when account matches allowedTypes", () => {
    vi.mocked(useAuth).mockReturnValue([makeAuth("staff", "HR"), vi.fn()]);

    render(
      <RestrictPage allowedTypes={["tenant", "hr"]}>
        <div>HR Content</div>
      </RestrictPage>,
    );

    expect(screen.getByText("HR Content")).toBeTruthy();
    expect(screen.queryByText("Access Restricted")).toBeNull();
  });

  it("renders access restricted UI and navigates back to matching dashboard", () => {
    vi.mocked(useAuth).mockReturnValue([makeAuth("tenant"), vi.fn()]);

    render(
      <RestrictPage allowedTypes="staff">
        <div>Staff Only Content</div>
      </RestrictPage>,
    );

    expect(screen.queryByText("Staff Only Content")).toBeNull();
    expect(screen.getByText("Access Restricted")).toBeTruthy();

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/tenant" });
  });

  it("navigates restricted staff back to /staff and supports explicit fallbackTo", () => {
    const staffAuth = makeAuth("staff", "Employee");
    expect(getDefaultDashboardRoute(staffAuth)).toBe("/staff");

    vi.mocked(useAuth).mockReturnValue([staffAuth, vi.fn()]);
    const { rerender } = render(
      <RestrictPage allowedTypes={["tenant", "hr"]}>
        <div>HR Content</div>
      </RestrictPage>,
    );

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/staff" });

    mockNavigate.mockReset();
    rerender(
      <RestrictPage allowedTypes={["tenant", "hr"]} fallbackTo="/auth/staff">
        <div>HR Content</div>
      </RestrictPage>,
    );

    fireEvent.click(screen.getByRole("button", { name: /go back/i }));
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/auth/staff" });
  });
});
