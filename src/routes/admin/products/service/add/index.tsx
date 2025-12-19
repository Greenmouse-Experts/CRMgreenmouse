import SimpleTitle from "@/components/SimpleTitle";
import { useSelectImage } from "@/helpers/images";
import { createFileRoute } from "@tanstack/react-router";
import SelectImage from "@/components/images/SelectImage";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useForm, FormProvider } from "react-hook-form";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";

interface ServiceFormFields {
  name: string;
  price: number;
  description: string;
  category: string;
}

export const Route = createFileRoute("/admin/products/service/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { image, setImage, image_link } = useSelectImage();
  const methods = useForm<ServiceFormFields>();
  const { handleSubmit } = methods;

  const onSubmit = (data: ServiceFormFields) => {
    console.log("Form Data:", data);
    console.log("Selected Image:", image);
    // Here you would typically send data and image to your backend
  };

  return (
    <div>
      <SimpleTitle title={"Add Service"} />
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" flex flex-col gap-6 p-4 bg-base-100 shadow rounded-box"
        >
          <SelectImage
            image={image}
            setImage={setImage}
            image_link={image_link}
            title="Service Image"
          />

          <div className="flex flex-col gap-4">
            <SimpleInput
              label="Service Name"
              placeholder="Enter service name"
              {...methods.register("name", {
                required: "Service name is required",
              })}
            />
            <SimpleInput
              label="Price"
              type="number"
              placeholder="Enter service price"
              {...methods.register("price", {
                required: "Price is required",
                valueAsNumber: true,
                min: { value: 0.01, message: "Price must be greater than 0" },
              })}
            />
            <LocalSelect
              label="Category"
              {...methods.register("category", {
                required: "Category is required",
              })}
            >
              <option value="">Select a category</option>
              <option value="consulting">Consulting</option>
              <option value="design">Design</option>
              <option value="development">Development</option>
              <option value="support">Support</option>
            </LocalSelect>
            <SimpleTextArea
              label="Description"
              placeholder="Enter service description"
              {...methods.register("description")}
            />
          </div>
          <button type="submit" className="btn btn-primary self-start">
            Add Service
          </button>
        </form>
      </FormProvider>
    </div>
  );
}
