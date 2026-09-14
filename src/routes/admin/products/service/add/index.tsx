import SimpleTitle from "@/components/SimpleTitle";
import { useSelectImage } from "@/helpers/images";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import SelectImage from "@/components/images/SelectImage";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useForm, FormProvider } from "react-hook-form";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateService } from "@/api/catalogApi";
import { useCategories } from "@/api/crmApi";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface ServiceFormFields {
  name: string;
  price: number;
  description: string;
  categoryId: string;
}

export const Route = createFileRoute("/admin/products/service/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const createService = useCreateService();
  const { data: categories = [] } = useCategories();
  const { image, setImage, image_link } = useSelectImage();
  const methods = useForm<ServiceFormFields>();
  const { handleSubmit } = methods;

  const onSubmit = async (data: ServiceFormFields) => {
    try {
      await createService.mutateAsync({
        name: data.name,
        price: Number(data.price),
        description: data.description,
        categoryId: data.categoryId || undefined,
        image: image_link || undefined,
        isActive: true,
      });
      toast.success("Service created successfully");
      navigate({ to: "/admin/products/service" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create service");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Link to="/admin/products/service" className="btn btn-ghost btn-sm btn-circle">
          <ArrowLeft className="size-5" />
        </Link>
        <SimpleTitle title={"Add Service"} />
      </div>

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 p-6 bg-base-100/70 backdrop-blur-md border border-base-200 shadow-sm rounded-box max-w-3xl"
        >
          <SelectImage
            image={image}
            setImage={setImage}
            image_link={image_link}
            title="Service Image"
          />

          <div className="flex flex-col gap-4">
            <SimpleInput
              label="Service Name *"
              placeholder="Enter service offering name"
              {...methods.register("name", {
                required: "Service name is required",
              })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SimpleInput
                label="Price / Rate (₦) *"
                type="number"
                placeholder="0.00"
                {...methods.register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                  min: { value: 0.01, message: "Price must be greater than 0" },
                })}
              />

              <LocalSelect
                label="Category"
                {...methods.register("categoryId")}
              >
                <option value="">Select a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </LocalSelect>
            </div>

            <SimpleTextArea
              label="Description"
              placeholder="Enter service details and offerings..."
              {...methods.register("description")}
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={createService.isPending}
            >
              {createService.isPending ? "Adding..." : "Add Service"}
            </button>
            <Link to="/admin/products/service" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
