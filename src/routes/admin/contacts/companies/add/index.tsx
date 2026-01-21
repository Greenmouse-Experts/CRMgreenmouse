import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import ActionButton from "@/components/buttons/ActionButton";
import SimpleTitle from "@/components/SimpleTitle";
import { Building2, Mail, Phone, Globe, MapPin, Hash } from "lucide-react";

export const Route = createFileRoute("/admin/contacts/companies/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const methods = useForm();
  const onSubmit = (data: any) => console.log(data);

  return (
    <div className="p-4">
      <SimpleTitle title={"Add New Company"} />
      <section className="p-4 bg-base-100 shadow rounded-box py-8">
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SimpleInput
                  label="Company Name"
                  placeholder="e.g. Acme Corporation"
                  {...methods.register("companyName", { required: "Required" })}
                />
                <LocalSelect label="Industry" {...methods.register("industry")}>
                  <option value="">Select Industry</option>
                  <option value="fintech">FinTech</option>
                  <option value="technology">Technology</option>
                  <option value="manufacturing">Manufacturing</option>
                  <option value="logistics">Logistics</option>
                </LocalSelect>
                <SimpleInput
                  label="Federal ID Number"
                  placeholder="XX-XXXXXXX"
                  {...methods.register("federalId")}
                />
                <SimpleInput
                  label="Group Name"
                  placeholder="Marketing, Sales, etc."
                  {...methods.register("groupName")}
                />
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Mail size={20} className="text-primary" />
                Contact Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SimpleInput
                  label="Work Phone"
                  type="tel"
                  placeholder="555-000-0000"
                  {...methods.register("workPhone")}
                />
                <SimpleInput
                  label="Email Address"
                  type="email"
                  placeholder="contact@company.com"
                  {...methods.register("email")}
                />
                <SimpleInput
                  label="Website"
                  placeholder="https://www.company.com"
                  {...methods.register("website")}
                />
                <SimpleInput
                  label="Date Joined"
                  type="date"
                  {...methods.register("dateJoined")}
                />
              </div>
            </div>

            {/* Address Section */}
            <div className="space-y-4 border-t pt-6">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <MapPin size={20} className="text-primary" />
                Location
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <SimpleInput
                  label="Address Line 1"
                  placeholder="123 Main Street"
                  {...methods.register("address1")}
                />
                <SimpleInput
                  label="Address Line 2"
                  placeholder="Suite, Floor, etc."
                  {...methods.register("address2")}
                />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <SimpleInput
                    label="City"
                    placeholder="Anytown"
                    {...methods.register("city")}
                  />
                  <SimpleInput
                    label="State/Province"
                    placeholder="CA"
                    {...methods.register("state")}
                  />
                  <SimpleInput
                    label="Zip/Postal Code"
                    placeholder="90210"
                    {...methods.register("zip")}
                  />
                </div>
                <LocalSelect label="Country" {...methods.register("country")}>
                  <option value="US">United States of America</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                </LocalSelect>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <ActionButton type="submit" title="Create Company" />
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
