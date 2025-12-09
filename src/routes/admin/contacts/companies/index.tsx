import ActionButton from "@/components/buttons/ActionButton";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import { createFileRoute } from "@tanstack/react-router";
import CompanySummary from "./-components/CompanySummary";
import { useModal } from "@/helpers/modals";
import Modal from "@/components/modals/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { faker } from "@faker-js/faker";
import { useState } from "react";
import SelectImage from "@/components/images/SelectImage";
import { useSelectImage } from "@/helpers/images";

export const Route = createFileRoute("/admin/contacts/companies/")({
  component: RouteComponent,
});

interface AddCompanyProps {
  email: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
}

interface Company {
  id: string;
  name: string;
  email: string;
  location: string;
  contactPerson: string;
  phone: string;
  logo: string;
}

const createRandomCompany = (): Company => {
  return {
    id: faker.string.uuid(),
    name: faker.company.name(),
    email: faker.internet.email(),
    location: faker.location.city() + ", " + faker.location.country(),
    contactPerson: faker.person.fullName(),
    phone: faker.phone.number(),
    logo: faker.image.url(),
  };
};

function RouteComponent() {
  const modal = useModal();
  const form = useForm<AddCompanyProps>();
  const { register, handleSubmit, reset } = form;
  const [companies, setCompanies] = useState<Company[]>(
    faker.helpers.multiple(createRandomCompany, {
      count: 10,
    }),
  );

  const handleAddCompany = (data: AddCompanyProps) => {
    const newCompany: Company = {
      id: faker.string.uuid(),
      logo: faker.image.url(),
      ...data,
    };
    setCompanies((prev) => [...prev, newCompany]);
    toast.success("Company added successfully!");
    modal.closeModal();
    reset(); // Reset form fields after successful submission
  };

  const companyColumns = [
    {
      key: "logo",
      label: "Logo",
      render: (value: string) => (
        <img
          src={value}
          alt="Company Logo"
          className="w-8 h-8 rounded-full object-cover"
        />
      ),
    },
    { key: "name", label: "Company Name" },
    { key: "email", label: "Email" },
    { key: "location", label: "Location" },
    { key: "contactPerson", label: "Contact Person" },
    { key: "phone", label: "Phone" },
  ];

  const props = useSelectImage();
  return (
    <>
      <Modal title="Add Company" ref={modal.ref}>
        <FormProvider {...form}>
          <form
            action=""
            className="space-y-4"
            onSubmit={handleSubmit(handleAddCompany)}
          >
            <SelectImage title="Company logo" {...props} />
            <SimpleInput
              title="Company Name"
              label="Company Name"
              {...register("name", {
                required: "Company Name is Required",
              })}
              placeholder="Enter company name"
            />
            <SimpleInput
              title="Email"
              label="Email"
              {...register("email", {
                required: "Email is Required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              placeholder="Enter company email"
            />
            <SimpleInput
              title="Location"
              label="Location"
              {...register("location", {
                required: "Location is Required",
              })}
              placeholder="Enter company location"
            />
            <SimpleInput
              title="Contact Person"
              label="Contact Person"
              {...register("contactPerson", {
                required: "Contact Person is Required",
              })}
              placeholder="Enter contact person's name"
            />
            <SimpleInput
              title="Phone"
              label="Phone"
              {...register("phone", {
                required: "Phone number is Required",
              })}
              placeholder="Enter phone number"
            />
            <div className="flex justify-end mt-4">
              <ActionButton type="submit">Add Company</ActionButton>
            </div>
          </form>
        </FormProvider>
      </Modal>

      <CompanySummary />
      <SimpleContainer
        title="Companies"
        actions={
          <>
            <ActionButton onClick={() => modal.showModal()}>
              Add Company
            </ActionButton>
          </>
        }
      >
        <CustomTable
          ring={false}
          actions={[
            {
              label: "View",
              key: "view",
              action: (item, nav) => {
                nav({
                  //@ts-ignore
                  to: "details/acme",
                });
              },
            },
          ]}
          data={companies}
          columns={companyColumns}
        />
      </SimpleContainer>
    </>
  );
}
