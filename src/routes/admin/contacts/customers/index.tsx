import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon } from "lucide-react";
import { faker } from "@faker-js/faker";
import CustomTable from "@/components/tables/CustomTable";
import CustomerSummary from "./-components/CustomerSum";
export const Route = createFileRoute("/admin/contacts/customers/")({
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
    <>
      <CustomerSummary />

      <SimpleContainer
        title="Customers"
        actions={
          <>
            <button className="btn btn-sm btn-primary">
              <PlusCircleIcon /> Add Staffs
            </button>
          </>
        }
      >
        {/*{props.search}*/}
        {/*<ContainerRow searchProps={props} />*/}
        <div className="bg-base-100">
          <CustomTable data={staffs} columns={columns} actions={actions} />
        </div>
      </SimpleContainer>
    </>
  );
}
