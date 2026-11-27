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
import { ShieldAlert } from "lucide-react";

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
