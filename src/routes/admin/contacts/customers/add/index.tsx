import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import SelectImage from "@/components/images/SelectImage";
import { useSelectImage } from "@/helpers/images";
import FormWrapper from "@/components/forms/FormWrapper";
import LocalSelect from "@/components/inputs/LocalSelect";

export const Route = createFileRoute("/admin/contacts/customers/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const methods = useForm();
  const onSubmit = (data: any) => console.log(data);
  const props = useSelectImage();

  return (
    <div className="">
      <SimpleTitle title={"Add Customer"}></SimpleTitle>
      <section className="p-4 bg-base-100 shadow rounded-box py-8 space-y-4">
        <SelectImage {...props} title="Profile Pic" />

        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="space-y-4 grid md:grid-cols-2 gap-4"
          >
            <FormWrapper title="User Details">
              <SimpleInput
                label="Full Name"
                placeholder="Enter full name"
                {...methods.register("fullName", {
                  required: "Full Name is required",
                })}
              />
              <SimpleInput
                label="Email"
                type="email"
                placeholder="Enter email address"
                {...methods.register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Invalid email address",
                  },
                })}
              />
              <SimpleInput
                label="Phone Number"
                type="tel"
                placeholder="Enter phone number"
                {...methods.register("phone", {
                  required: "Phone number is required",
                })}
              />
              <SimpleInput
                label="Username"
                placeholder="Enter username"
                defaultValue="demo@example.com"
                {...methods.register("username", {
                  required: "Username is required",
                })}
              />
              <SimpleInput
                label="Password"
                type="password"
                placeholder="Enter password"
                {...methods.register("password", {
                  required: "Password is required",
                })}
              />
            </FormWrapper>

            <FormWrapper title="Address Information">
              <SimpleInput
                label="Address"
                placeholder="Enter address"
                {...methods.register("address")}
              />
              <SimpleInput
                label="City"
                placeholder="Enter city"
                {...methods.register("city")}
              />
              <SimpleInput
                label="State/Region"
                placeholder="Enter state or region"
                {...methods.register("stateRegion")}
              />
              <SimpleInput
                label="ZIP/Postal Code"
                placeholder="Enter ZIP or postal code"
                {...methods.register("zipPostalCode")}
              />
              <SimpleInput
                label="Country"
                placeholder="Enter country"
                defaultValue="United States"
                {...methods.register("country")}
              />
            </FormWrapper>

            {/*<FormWrapper title="Account Details"></FormWrapper>*/}

            <FormWrapper
              title="Additional Information"
              className="md:col-span-2"
            >
              <LocalSelect label="Company">
                <option value={"ACME"}>ACME</option>
                <option value={"Flutter"}>Flutter</option>
                <option value={"Comany"}>Comany</option>
              </LocalSelect>
              <SimpleInput
                label="Prepared by"
                placeholder="Enter preparer's name"
                {...methods.register("preparedBy")}
              />
              <SimpleInput
                label="Tag"
                placeholder="Add a tag"
                {...methods.register("tag")}
              />
            </FormWrapper>

            <ActionButton
              type="submit"
              title="Add Customer"
              className="btn btn-primary md:col-span-2"
            />
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
