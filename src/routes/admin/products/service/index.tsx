import { createFileRoute } from "@tanstack/react-router";
import PageHeader from "@/components/Headers/PageHeader";
import SimpleContainer from "@/components/SimpleContainer";
import { PlusCircleIcon, Package, DollarSign, Tag } from "lucide-react";
import { Link } from "@tanstack/react-router";
import CustomTable from "@/components/tables/CustomTable";
import { faker } from "@faker-js/faker";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import Modal from "@/components/modals/DialogModal";
import { useModal } from "@/helpers/modals";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useState } from "react";

export const Route = createFileRoute("/admin/products/service/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { ref, showModal, closeModal } = useModal();
  const [selectedService, setSelectedService] = useState<any>(null);

  const services = Array.from({ length: 10 }, (_, i) => ({
    id: i + 1,
    name: faker.commerce.productName(),
    price: faker.commerce.price(),
    category: faker.commerce.department(),
    active: faker.datatype.boolean(),
  }));

  const handleEdit = (service: any) => {
    setSelectedService(service);
    showModal();
  };

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

      <Modal
        ref={ref}
        title="Edit Service"
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
            label="Service Name"
            defaultValue={selectedService?.name}
            icon={<Package size={18} className="text-gray-400" />}
          />
          <SimpleInput
            label="Price"
            type="number"
            defaultValue={selectedService?.price}
            icon={<DollarSign size={18} className="text-gray-400" />}
          />
          <SimpleInput
            label="Category"
            defaultValue={selectedService?.category}
            icon={<Tag size={18} className="text-gray-400" />}
          />
        </div>
      </Modal>
    </>
  );
}
