import { createFileRoute } from "@tanstack/react-router";
import ContainerRow from "@/components/ContainerRow";
import SimpleContainer from "@/components/SimpleContainer";
import { useSearch } from "@/stores/data";
import { PlusCircleIcon, Package, DollarSign, Tag } from "lucide-react";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import { Link } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import Modal from "@/components/modals/DialogModal";
import { useModal } from "@/helpers/modals";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useState } from "react";

export const Route = createFileRoute("/admin/products/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ref, showModal, closeModal } = useModal();
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const products = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    category: faker.commerce.department(),
    inStock: faker.datatype.boolean(),
  }));

  const handleEdit = (product: any) => {
    setSelectedProduct(product);
    showModal();
  };

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
        title="Products"
        description="Manage products and product info"
      >
        <Link to="/admin/products/add" className="btn btn-primary ">
          <PlusCircleIcon /> Add Product
        </Link>
      </PageHeader>
      <SimpleContainer title="Products">
        {props.search}
        <ContainerRow searchProps={props} showSearch={true} />
        <CustomTable data={products} columns={columns} actions={actions} />
      </SimpleContainer>

      <Modal
        ref={ref}
        title="Edit Product"
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
            label="Product Name"
            defaultValue={selectedProduct?.name}
            icon={<Package size={18} className="text-gray-400" />}
          />
          <SimpleInput
            label="Price"
            type="number"
            defaultValue={selectedProduct?.price}
            icon={<DollarSign size={18} className="text-gray-400" />}
          />
          <SimpleInput
            label="Category"
            defaultValue={selectedProduct?.category}
            icon={<Tag size={18} className="text-gray-400" />}
          />
        </div>
      </Modal>
    </>
  );
}
