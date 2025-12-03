import ActionButton from "@/components/buttons/ActionButton";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import { createFileRoute } from "@tanstack/react-router";
import CompanySummary from "./-components/CompanySummary";

export const Route = createFileRoute("/admin/contacts/companies/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <CompanySummary />
      <SimpleContainer
        title="Companies"
        actions={
          <>
            <ActionButton>Add Company</ActionButton>
          </>
        }
      >
        <CustomTable />
      </SimpleContainer>
    </>
  );
}
