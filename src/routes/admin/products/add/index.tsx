import SimpleTitle from "@/components/SimpleTitle";
import { useSelectImage } from "@/helpers/images";
import { createFileRoute } from "@tanstack/react-router";
import SelectImage from "@/components/images/SelectImage";
import SimpleInput from "@/components/inputs/SimpleInput";
import { useForm, FormProvider } from "react-hook-form"; // Added FormProvider
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import LocalSelect from "@/components/inputs/LocalSelect";

interface ProductFormFields {
  name: string;
  price: number;
  description: string;
  quantity: number;
  category: string;
}

export const Route = createFileRoute("/admin/products/add/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { image, setImage, image_link } = useSelectImage();
  const methods = useForm<ProductFormFields>(); // Renamed to methods
  const { handleSubmit } = methods; // Destructure handleSubmit from methods

  const onSubmit = (data: ProductFormFields) => {
    console.log("Form Data:", data);
    console.log("Selected Image:", image);
    // Here you would typically send data and image to your backend
  };

  return (
    <div>
      <SimpleTitle title={"Add Product"} />
      <FormProvider {...methods}>
        {" "}
        {/* Wrap form with FormProvider */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className=" flex flex-col gap-6 p-4 bg-base-100 shadow rounded-box"
        >
          <SelectImage
            image={image}
            setImage={setImage}
            image_link={image_link}
            title="Product Image"
          />

          <div className="flex flex-col gap-4">
            <SimpleInput
              label="Product Name"
              placeholder="Enter product name"
              {...methods.register("name", {
                required: "Product name is required",
              })} // Use methods.register
            />
            <LocalSelect
              label="Category"
              {...methods.register("category", {
                required: "Category is required",
              })}
            >
              <option value="">Select a category</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="home">Home & Garden</option>
            </LocalSelect>
            <SimpleInput
              label="Quantity"
              type="number"
              placeholder="Enter product quantity"
              {...methods.register("quantity", {
                // Use methods.register
                required: "Quantity is required",
                valueAsNumber: true,
                min: { value: 1, message: "Quantity must be greater than 0" },
              })}
            />
            <SimpleInput
              label="Price"
              type="number"
              placeholder="Enter product price"
              {...methods.register("price", {
                // Use methods.register
                required: "Price is required",
                valueAsNumber: true,
                min: { value: 0.01, message: "Price must be greater than 0" },
              })}
            />
            <SimpleTextArea
              label="Description"
              placeholder="Enter product description"
              {...methods.register("description")} // Use methods.register
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary self-start" // Changed to DaisyUI button class
          >
            Add Product
          </button>
        </form>
      </FormProvider>
    </div>
  );
}
