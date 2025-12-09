import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import SelectImage from "@/components/images/SelectImage";
import { useSelectImage } from "@/helpers/images";

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
      {/*<h2 className="text-2xl font-bold mb-4">Add Customer</h2>*/}
      <section className="p-4 bg-base-100 shadow rounded-box py-8 ">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
            <SelectImage {...props} title="Profile Pic"></SelectImage>

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
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text text-base">Profile Picture</span>
              </label>
              <input
                type="file"
                accept="image/*"
                className="file-input file-input-bordered w-full"
                {...methods.register("profilePicture")}
              />
            </div>

            <ActionButton type="submit" title="Add Customer" />
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
