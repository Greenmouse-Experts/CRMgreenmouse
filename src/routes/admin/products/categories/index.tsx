import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import PageHeader from "@/components/Headers/PageHeader";
export const Route = createFileRoute("/admin/products/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  const categories = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: faker.commerce.department(),
    productCount: faker.number.int({ min: 0, max: 100 }),
  }));

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Category Name" },
    { key: "productCount", label: "Product Count" },
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
        title="Product Categories"
        description="Manage products and product info"
      >
        {/*//@ts-ignore*/}
        <button onClick={() => {}} className="btn btn-primary ">
          <PlusCircleIcon /> Create Category
        </button>
      </PageHeader>
      <SimpleContainer
        title="Categories"
        // actions={
        //   <>
        //     <button className="btn btn-sm btn-primary">
        //       <PlusCircleIcon /> Create Category
        //     </button>
        //   </>
        // }
      >
        {props.search}
        <ContainerRow searchProps={props} showSearch={true} />
        <CustomTable data={categories} columns={columns} actions={actions} />
      </SimpleContainer>
    </>
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
