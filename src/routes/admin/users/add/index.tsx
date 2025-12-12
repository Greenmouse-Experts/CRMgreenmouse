import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import { useSelectImage } from "@/helpers/images";
import SelectImage from "@/components/images/SelectImage";
import SimpleTitle from "@/components/SimpleTitle";
import LocalSelect from "@/components/inputs/LocalSelect";

export const Route = createFileRoute("/admin/users/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const methods = useForm();
  const onSubmit = (data: any) => console.log(data);
  const props = useSelectImage();
  return (
    <div className="p-4">
      <SimpleTitle title={"Add New Staff"} />
      <section className="p-4 bg-base-100 shadow rounded-box py-8">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <SelectImage {...props} title="Profile Pic" />
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
            <LocalSelect label="Staff Role">
              <option value="">Select a role</option>
              <option value="Admin">Admin</option>
              <option value="Editor">Staff</option>
              <option value="Viewer">Sub-Admin</option>
            </LocalSelect>
            <SimpleInput
              label="Phone Number"
              type="tel"
              placeholder="Enter phone number"
              {...methods.register("phone", {
                required: "Phone number is required",
              })}
            />

            <ActionButton type="submit" title="Add Staff" />
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
