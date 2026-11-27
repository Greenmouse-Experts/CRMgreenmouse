import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import DisciplinaryStats from "@/routes/hr/disciplinary/-components/DisciplinaryStats";
import StaffDisciplinaryCasesTable from "./-components/StaffDisciplinaryCasesTable";
import StaffCaseDetailModal from "./-components/StaffCaseDetailModal";
import { useCurrentStaffIdentity } from "../-components/useCurrentStaffIdentity";
import { filterPersonalDisciplinaryCases } from "../-components/staffScoping";
import type { DisciplinaryCase } from "@/routes/hr/disciplinary/-components/types";
import { useDisciplinaryCases } from "@/api/disciplinaryApi";
import { extract_message } from "@/helpers/errors";
import { AlertCircle, ShieldAlert } from "lucide-react";

export const Route = createFileRoute("/staff/disciplinary/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { identity, isLoading: identityLoading } = useCurrentStaffIdentity();
  const casesQuery = useDisciplinaryCases();

  const [selectedCase, setSelectedCase] = useState<DisciplinaryCase | null>(
    null,
  );

  const myCases = useMemo(
    () => filterPersonalDisciplinaryCases(casesQuery.data ?? [], identity),
    [casesQuery.data, identity],
  );

  const isLoading = identityLoading || casesQuery.isLoading;
  const errorStatus = (casesQuery.error as any)?.response?.status;

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="My Disciplinary Cases"
        description="View formal disciplinary cases opened for your profile and monitor live status updates from HR."
      />

      <div className="flex items-center gap-3 rounded-xl bg-amber-500/10 border border-amber-500/20 p-4 sm:text-sm font-medium text-amber-900 dark:text-amber-200 shadow-2xs">
        <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          Confidential record — Only cases linked to your employee profile are
          shown here. Status and stage updates appear automatically as HR
          reviews them.
        </span>
      </div>

      {isLoading ? (
        <div className="card bg-base-100 border border-base-200 p-12 text-center max-w-lg mx-auto">
          <span className="loading loading-spinner loading-lg mx-auto mb-4" />
          <p className="text-base-content/80">
            Loading your disciplinary records...
          </p>
        </div>
      ) : casesQuery.isError ? (
        <div className="card bg-base-100 border border-base-200 p-8 text-center max-w-xl mx-auto space-y-3">
          <AlertCircle className="size-8 mx-auto text-warning" />
          <p className="font-semibold text-base-content">
            {errorStatus === 403
              ? "Disciplinary self-service endpoint is not enabled for your role"
              : "Unable to load disciplinary cases"}
          </p>
          <p className="text-sm text-base-content/75">
            {errorStatus === 403
              ? "Your account does not have permission to read the HR disciplinary cases directory. Please contact HR if you need details on an open case."
              : extract_message(casesQuery.error as any)}
          </p>
        </div>
      ) : (
        <>
          <DisciplinaryStats cases={myCases} />

          <StaffDisciplinaryCasesTable
            cases={myCases}
            onSelectCase={(caseItem) => setSelectedCase(caseItem)}
          />
        </>
      )}

      <StaffCaseDetailModal
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        caseItem={selectedCase}
      />
    </div>
  );
}
