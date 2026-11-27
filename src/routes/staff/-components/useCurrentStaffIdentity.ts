import { useMemo } from "react";
import { useAuth } from "@/store/authStore";
import { useEmployees, useMyEmployeeProfile } from "@/api/employeesApi";
import { useOrganization } from "@/api/organizationApi";
import { resolveStaffIdentity, type StaffIdentity } from "./staffScoping";

export function useCurrentStaffIdentity(): {
  identity: StaffIdentity;
  isLoading: boolean;
} {
  const [auth] = useAuth();
  const myProfileQuery = useMyEmployeeProfile(Boolean(auth?.accessToken));
  const employeesQuery = useEmployees();
  const organizationQuery = useOrganization();

  const identity = useMemo(
    () =>
      resolveStaffIdentity({
        authUser: auth?.user,
        myProfile: myProfileQuery.data,
        employees: employeesQuery.data ?? [],
        departments: organizationQuery.data?.departments ?? [],
      }),
    [
      auth?.user,
      myProfileQuery.data,
      employeesQuery.data,
      organizationQuery.data?.departments,
    ],
  );

  const isLoading =
    myProfileQuery.isLoading ||
    employeesQuery.isLoading ||
    organizationQuery.isLoading;

  return { identity, isLoading };
}
