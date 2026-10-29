import { describe, expect, it } from "vitest";
import type { AuthUser, ProfileData } from "@/store/authStore";
import { refreshEndpointForSession } from "./simpleApi";

const session = (userType: string): AuthUser => ({
  accessToken: "access",
  refreshToken: "refresh",
  user: { id: "user-1", email: "user@example.com", userType },
});

describe("refreshEndpointForSession", () => {
  it("uses the tenant refresh endpoint for a tenant session", () => {
    expect(refreshEndpointForSession(session("tenant"), null)).toBe("tenant/auth/refresh");
    expect(refreshEndpointForSession(session("TENANT"), null)).toBe("tenant/auth/refresh");
  });

  it("uses the default refresh endpoint for admin and other non-tenant sessions", () => {
    expect(refreshEndpointForSession(session("admin"), null)).toBe("auth/refresh");
    expect(refreshEndpointForSession(session("staff"), null)).toBe("auth/refresh");
    expect(refreshEndpointForSession(session(""), null)).toBe("auth/refresh");
  });

  it("uses the stored profile role when the session has no role", () => {
    const profile: ProfileData = { sub: "user-1", email: "user@example.com", userType: "tenant" };
    expect(refreshEndpointForSession(session(""), profile)).toBe("tenant/auth/refresh");
    expect(refreshEndpointForSession(session(""), { ...profile, sub: "another-user" })).toBe("auth/refresh");
  });
});
