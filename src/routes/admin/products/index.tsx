import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
export const Route = createFileRoute("/admin/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  const products = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    category: faker.commerce.department(),
    inStock: faker.datatype.boolean(),
  }));

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Product Name" },
    { key: "price", label: "Price" },
    { key: "category", label: "Category" },
    {
      key: "inStock",
      label: "In Stock",
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
    <div>
      <SimpleContainer
        title="Products"
        actions={
          <>
            <button className="btn btn-sm btn-primary">
              <PlusCircleIcon /> Create Product
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
        <CustomTable data={products} columns={columns} actions={actions} />
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
