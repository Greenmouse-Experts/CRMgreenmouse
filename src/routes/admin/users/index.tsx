import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon } from "lucide-react";
import { faker } from "@faker-js/faker";
import CustomTable from "@/components/tables/CustomTable";
import UserSummary from "./-components/UsersSummary";
import ActionButton from "@/components/buttons/ActionButton";
import DropDownBtn from "@/components/buttons/DropdownBtn";
export const Route = createFileRoute("/admin/users/")({
  component: RouteComponent,
});

function RouteComponent() {
  const staffs = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    email: faker.internet.email(),
    role: faker.person.jobTitle(),
    phone: faker.phone.number(),
    avatar: faker.image.avatar(),
  }));
  const props = useSearch();

  const columns = [
    {
      key: "avatar",
      label: "Img",
      render: (value: string, item: any) => (
        <div className="avatar">
          <div className="mask mask-squircle w-12 h-12">
            <img src={value} alt={`Avatar of ${item.name}`} />
          </div>
        </div>
      ),
    },
    { key: "name", label: "Name" },
    { key: "role", label: "Role" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
  ];

  const actions = [
    {
      key: "view",
      label: "View",
      action: (item: any) => console.log("View staff:", item),
    },
    // Add more actions if needed
  ];
  return (
    <div className="space-y-4">
      <UserSummary />
      <SimpleContainer
        title="Staffs"
        actions={
          <>
            <button className="btn btn-primary btn-sm">
              <PlusCircleIcon /> Add Staffs
            </button>
          </>
        }
      >
        <ContainerRow showSearch>
          <button className="btn btn-accent  btn-outline">Filter</button>
          <button className="btn btn-accent  btn-outline">Filter</button>
          <DropDownBtn
            title="Export"
            items={[
              {
                name: "CSV",
                action: () => {},
              },
            ]}
          ></DropDownBtn>
          {/*<button className="btn btn-primary ml-auto">Add User</button>*/}
        </ContainerRow>
        {props.search}
        {/*<ContainerRow searchProps={props} />*/}
        <CustomTable data={staffs} columns={columns} actions={actions} />
      </SimpleContainer>
    </div>
  );
}
