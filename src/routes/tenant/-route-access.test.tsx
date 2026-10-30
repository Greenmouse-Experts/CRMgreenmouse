// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { get_user_value, type AuthUser } from "@/store/authStore";
import { Route } from "./route";

vi.mock("@/store/authStore", () => ({
  get_user_value: vi.fn(),
  get_profile_value: vi.fn(),
  set_user_value: vi.fn(),
  set_profile_value: vi.fn(),
  clear_user: vi.fn(),
  useAuth: vi.fn(),
  useProfile: vi.fn(),
}));

const session = (userType: string): AuthUser => ({
  accessToken: "test-access-token",
  refreshToken: "test-refresh-token",
  user: { id: "user-1", email: "user@example.com", userType },
});

const loadTenantRoute = () => (Route.options.loader as () => unknown)();

describe("tenant route access", () => {
  beforeEach(() => vi.mocked(get_user_value).mockReset());

  it.each(["tenant", "staff"])("allows %s accounts", (userType) => {
    vi.mocked(get_user_value).mockReturnValue(session(userType));
    expect(loadTenantRoute()).toBeUndefined();
  });

  it.each(["admin", "unknown"])("redirects %s accounts", (userType) => {
    vi.mocked(get_user_value).mockReturnValue(session(userType));
    expect(loadTenantRoute()).toMatchObject({ options: { to: "/auth/login" } });
  });

  it("redirects guests", () => {
    vi.mocked(get_user_value).mockReturnValue(null);
    expect(loadTenantRoute()).toMatchObject({ options: { to: "/auth/login" } });
  });
});
