import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { Hash, PlusCircleIcon, Tag } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import PageHeader from "@/components/Headers/PageHeader";
import Modal from "@/components/modals/DialogModal";
import { useModal } from "@/helpers/modals";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useState } from "react";

export const Route = createFileRoute("/admin/products/categories/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ref, showModal, closeModal } = useModal();
  const [selectedCategory, setSelectedCategory] = useState<any>(null);

  const categories = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: faker.commerce.department(),
    productCount: faker.number.int({ min: 0, max: 100 }),
  }));

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    showModal();
  };

  const columns = [
    { key: "id", label: "ID" },
    { key: "name", label: "Category Name" },
    { key: "productCount", label: "Product Count" },
  ];

  const actions = [
    {
      key: "edit",
      label: "Edit",
      action: (item: any) => handleEdit(item),
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
      <SimpleContainer title="Categories">
        {props.search}
        <ContainerRow searchProps={props} showSearch={true} />
        <CustomTable data={categories} columns={columns} actions={actions} />
      </SimpleContainer>

      <Modal
        ref={ref}
        title="Edit Category"
        actions={
          <div className="flex gap-2">
            <button className="btn btn-ghost" onClick={closeModal}>
              Cancel
            </button>
            <button className="btn btn-primary" onClick={closeModal}>
              Save Changes
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <SimpleInput
            label="Category Name"
            defaultValue={selectedCategory?.name}
            icon={<Tag size={18} className="text-gray-400" />}
          />
          <SimpleInput
            label="Product Count"
            type="number"
            defaultValue={selectedCategory?.productCount}
            icon={<Hash size={18} className="text-gray-400" />}
          />
        </div>
      </Modal>
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
