import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import { PlusCircleIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";

export const Route = createFileRoute("/admin/products/service/")({
  component: RouteComponent,
});

function RouteComponent() {
  const services = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    category: faker.commerce.department(),
    active: faker.datatype.boolean(),
  }));

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Service Name" },
    { key: "price", label: "Price" },
    { key: "category", label: "Category" },
    {
      key: "active",
      label: "Active",
      render: (value: boolean) => (value ? "Yes" : "No"),
    },
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
    <>
      <PageHeader
        title="Services"
        description="Manage services and service info"
      >
        <Link to="/admin/products/service/add" className="btn btn-primary ">
          <PlusCircleIcon /> Add Service
        </Link>
      </PageHeader>
      <SimpleContainer title="Services">
        {props.search}
        <ContainerRow searchProps={props} showSearch={true}></ContainerRow>
        <CustomTable data={services} columns={columns} actions={actions} />
      </SimpleContainer>
    </>
  );
}
