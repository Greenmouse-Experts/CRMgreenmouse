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

export const Route = createFileRoute("/admin/contacts/companies/")({
  component: RouteComponent,
});

interface AddCompanyProps {
  email: string;
  name: string;
  location: string;
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
    logo: faker.image.urlLoremFlickr({ category: "logo" }),
  };
};

const dummyCompanies: Company[] = faker.helpers.multiple(createRandomCompany, {
  count: 10,
});

function RouteComponent() {
  const modal = useModal();
  const form = useForm<AddCompanyProps>();
  const { register } = form;

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

  return (
    <>
      <Modal title="Add Company" ref={modal.ref}>
        <FormProvider {...form}>
          <form
            action=""
            className="space-y-4"
            onSubmit={form.handleSubmit((data) => {
              console.log(data);
              toast.info(JSON.stringify(data));
              modal.closeModal();
            })}
          >
            <SimpleInput
              title="Name"
              label="Name"
              {...register("name", {
                required: "Name is Required",
              })}
              placeholder="Name"
            />
            <SimpleInput
              title="Email"
              label="Email"
              {...register("email")}
              placeholder="Email"
            />
            <SimpleInput
              title="Location"
              label="Location"
              {...register("location")}
              placeholder="Location"
            />
            <div className="bg-red-200 w-fit ml-auto mt-4">
              <button className="btn btn-primary">Add</button>
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
        <CustomTable data={dummyCompanies} columns={companyColumns} />
      </SimpleContainer>
    </>
  );
}
