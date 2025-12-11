import PageHeader from "@/components/Headers/PageHeader";
import { createFileRoute } from "@tanstack/react-router";
import ActionButton from "@/components/buttons/ActionButton";
import { PlusCircleIcon } from "lucide-react";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";

export const Route = createFileRoute("/admin/users/permissions/")({
  component: RouteComponent,
});

function RouteComponent() {
  const generatePermissions = (count: number) => {
    const permissions = [];
    for (let i = 0; i < count; i++) {
      permissions.push({
        id: faker.string.uuid(),
        name: faker.lorem.words(2),
        description: faker.lorem.sentence(),
        createdAt: faker.date.past().toLocaleDateString(),
      });
    }
    return permissions;
  };
  const props = useSearch();
  const permissionsData = generatePermissions(10);

  const columns = [
    { key: "name", label: "Permission Name" },
    { key: "description", label: "Description" },
    { key: "createdAt", label: "Created At" },
  ];

  const actions = [
    {
      key: "edit",
      label: "Edit",
      action: (item: any) => console.log("Edit:", item),
    },
    {
      key: "view",
      label: "View",
      action: (item: any) => console.log("View:", item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item: any) => console.log("Delete:", item),
    },
  ];

  return (
    <>
      <PageHeader
        title="Permissions"
        description="Manage user roles and permissions."
      >
        <ActionButton title="Add Permission">
          <PlusCircleIcon className="w-5 h-5" />
          Add Permission
        </ActionButton>
      </PageHeader>

      <SimpleContainer title="Permissions">
        <ContainerRow searchProps={props} showSearch></ContainerRow>
        <CustomTable
          data={permissionsData}
          columns={columns}
          actions={actions}
        />
      </SimpleContainer>
    </>
  );
}
