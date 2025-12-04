import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
export const Route = createFileRoute("/admin/users/roles/")({
  component: RouteComponent,
});

function RouteComponent() {
  const roles = Array.from({ length: 5 }, (_, i) => ({
    id: i + 1,
    name: faker.person.jobTitle(),
    description: faker.lorem.sentence(),
    usersCount: faker.number.int({ min: 0, max: 100 }),
  }));

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Role Name" },
    { key: "description", label: "Description" },
    { key: "usersCount", label: "Number of Users" },
  ];

  const actions = [
    {
      key: "edit",
      label: "Edit",
      action: (item: any) => console.log("Edit", item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item: any) => console.log("Delete", item),
    },
  ];

  const props = useSearch();
  return (
    <div>
      <SimpleContainer
        title="Roles"
        actions={
          <>
            <button className="btn btn-sm btn-primary">
              <PlusCircleIcon /> Create Role
            </button>
          </>
        }
      >
        {props.search}
        <ContainerRow
          searchProps={props}
          showSearch={true}
          actions={
            <>
              <ExportOptions
                position="left"
                options={[
                  {
                    name: "export as pdf",
                    action: () => console.log("yes"),
                  },
                ]}
              />
            </>
          }
        />
        <CustomTable data={roles} columns={columns} actions={actions} />
      </SimpleContainer>
    </div>
  );
}

interface ExportProps {
  options?: [
    {
      name: string;
      action: () => any;
    },
  ];
  position?: "left" | "right";
}
const ExportOptions = (props: ExportProps) => {
  return (
    <div
      className={`dropdown ${props?.position == "left" ? "dropdown-start" : "dropdown-end"}`}
    >
      <button className="btn btn-sm ">Export</button>
      <ul className="dropdown-content menu bg-base-100 w-[152px] rounded-box shadow-xs">
        {props.options?.map((option) => (
          <li key={option.name}>
            <a>
              <button onClick={option.action}>{option.name}</button>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};
