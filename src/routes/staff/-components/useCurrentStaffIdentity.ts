import { useMemo } from "react";
import { useAuth } from "@/store/authStore";
import { useMyEmployeeProfile } from "@/api/employeesApi";
import { usePortalOrganization } from "@/api/organizationApi";
import { resolveStaffIdentity, type StaffIdentity } from "./staffScoping";

export function useCurrentStaffIdentity(): {
  identity: StaffIdentity;
  isLoading: boolean;
} {
  const [auth] = useAuth();
  const enabled = Boolean(auth?.accessToken);
  const myProfileQuery = useMyEmployeeProfile(enabled);
  const organizationQuery = usePortalOrganization(enabled);

  const identity = useMemo(
    () =>
      resolveStaffIdentity({
        authUser: auth?.user,
        myProfile: myProfileQuery.data,
        departments: organizationQuery.data?.departments ?? [],
      }),
    [auth?.user, myProfileQuery.data, organizationQuery.data?.departments],
  );

  const isLoading = myProfileQuery.isLoading || organizationQuery.isLoading;

  return { identity, isLoading };
}
