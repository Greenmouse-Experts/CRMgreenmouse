import ActionButton from "@/components/buttons/ActionButton";
import Modal from "@/components/modals/DialogModal";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import { useModal } from "@/store/modals";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import { nanoid } from "nanoid";

// Define the type for the form values, where features is a comma-separated string
interface SubscriptionFormValues {
  id?: string; // Optional for new plans
  name: string;
  price: string;
  duration: string;
  features: string; // Comma-separated string for input
  description: string | null;
  status: string;
}

// Define the type for the subscription items stored in state/table data
interface SubscriptionItem {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[]; // Array of strings for data storage
  description: string | null;
  status: string;
}

export const Route = createFileRoute("/admin/subscription/")({
  component: RouteComponent,
});

const columns = [
  {
    key: "name",
    label: "Plan Name",
  },
  {
    key: "price",
    label: "Price",
  },
  {
    key: "duration",
    label: "Duration",
  },
  {
    key: "features",
    label: "Features",
    render: (value: string[]) => (
      <div className="flex flex-wrap gap-1">
        {value.map((feature, index) => (
          <span key={index} className="">
            {feature},
          </span>
        ))}
      </div>
    ),
  },
  {
    key: "description", // Added description column
    label: "Description",
    render: (value: string | null | undefined) => value || "N/A", // Render "N/A" for null/undefined
  },
  {
    key: "status",
    label: "Status",
    render: (value: string) => (
      <span
        className={`badge ${value === "Active" ? "badge-success" : "badge-warning"} text-white`}
      >
        {value}
      </span>
    ),
  },
];

const initialData: SubscriptionItem[] = [
  {
    id: "1",
    name: "Basic Plan",
    price: "$10/month",
    duration: "Monthly",
    features: ["Feature A", "Feature B"],
    description: "A basic plan for new users.", // Added description
    status: "Active",
  },
  {
    id: "2",
    name: "Pro Plan",
    price: "$99/year",
    duration: "Annually",
    features: ["Feature A", "Feature B", "Feature C", "Feature D"],
    description: "Advanced features for power users.", // Added description
    status: "Active",
  },
  {
    id: "3",
    name: "Enterprise Plan",
    price: "Custom",
    duration: "Annually",
    features: ["All Pro Features", "Dedicated Support"],
    description: "Tailored solutions for large organizations.", // Added description
    status: "Active",
  },
  {
    id: "4",
    name: "Free Trial",
    price: "$0",
    duration: "7 Days",
    features: ["Limited Features"],
    description: "Try out features for a limited time.", // Added description
    status: "Inactive",
  },
];

// Reusable Subscription Form Component
interface SubscriptionFormProps {
  initialValues?: SubscriptionFormValues;
  onSubmit: (values: SubscriptionFormValues) => void;
  onCancel: () => void;
}

const SubscriptionForm = ({
  initialValues,
  onSubmit,
  onCancel,
}: SubscriptionFormProps) => {
  const methods = useForm<SubscriptionFormValues>({
    defaultValues: initialValues || {
      name: "",
      price: "",
      duration: "",
      features: "",
      description: null,
      status: "Active",
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden input for ID when editing, ensuring it's registered with react-hook-form */}
        {initialValues?.id && (
          <input type="hidden" {...methods.register("id")} />
        )}

        <SimpleInput label="Plan Name" name="name" />
        <SimpleInput label="Price" name="price" />
        <SimpleInput label="Duration" name="duration" />
        <SimpleInput
          label="Features (comma-separated)"
          name="features"
          placeholder="e.g., Feature A, Feature B"
        />
        <SimpleTextArea
          label="Description"
          name="description"
          placeholder="A brief description of the plan."
        />
        <SimpleInput label="Status" name="status" />

        <div className="modal-action flex justify-end gap-2 mt-6">
          <button type="button" className="btn btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </div>
      </form>
    </FormProvider>
  );
};

function RouteComponent() {
  const modal = useModal();
  const [subscriptions, setSubscriptions] =
    useState<SubscriptionItem[]>(initialData);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState<React.ReactNode | null>(
    null,
  );
  const [currentPlanId, setCurrentPlanId] = useState<string | null>("2"); // Example: Set a default current plan

  const onSubmit = (values: SubscriptionFormValues) => {
    const updatedFeatures = values.features
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f !== "");

    const baseSubscription: Omit<SubscriptionItem, "id"> = {
      name: values.name,
      price: values.price,
      duration: values.duration,
      features: updatedFeatures,
      description: values.description,
      status: values.status,
    };

    if (values.id) {
      const subscriptionToSave: SubscriptionItem = {
        ...baseSubscription,
        id: values.id,
      };
      setSubscriptions((prev) =>
        prev.map((item) =>
          item.id === subscriptionToSave.id ? subscriptionToSave : item,
        ),
      );
    } else {
      const subscriptionToSave: SubscriptionItem = {
        ...baseSubscription,
        id: nanoid(),
      };
      setSubscriptions((prev) => [...prev, subscriptionToSave]);
    }
    modal.closeModal();
  };

  const handleEditView = (item: SubscriptionItem) => {
    setModalTitle("Edit Subscription Plan");

    setModalContent(
      <SubscriptionForm
        initialValues={{
          id: item.id,
          name: item.name,
          price: item.price,
          duration: item.duration,
          features: item.features.join(", "),
          description: item.description || null,
          status: item.status,
        }}
        onSubmit={onSubmit}
        onCancel={modal.closeModal}
      />,
    );
    modal.showModal();
  };

  const handleAddSubscription = () => {
    setModalTitle("Add New Subscription Plan");
    setModalContent(
      <SubscriptionForm onSubmit={onSubmit} onCancel={modal.closeModal} />,
    );
    modal.showModal();
  };

  const handleDelete = (item: SubscriptionItem) => {
    setModalTitle("Confirm Deletion");
    setModalContent(
      <div>
        <p className="mb-4">
          Are you sure you want to delete the subscription plan "
          <span className="font-semibold">{item.name}</span>"?
        </p>
        <p>This action cannot be undone.</p>
        <div className="modal-action flex justify-end gap-2 mt-4">
          <button className="btn btn-ghost" onClick={modal.closeModal}>
            Cancel
          </button>
          <button
            className="btn btn-error"
            onClick={() => {
              setSubscriptions((prev) => prev.filter((d) => d.id !== item.id));
              modal.closeModal();
            }}
          >
            Delete
          </button>
        </div>
      </div>,
    );
    modal.showModal();
  };

  const actions = [
    {
      key: "editView",
      label: "Edit/View",
      action: (item: SubscriptionItem) => handleEditView(item),
    },
    {
      key: "delete",
      label: "Delete",
      action: (item: SubscriptionItem) => handleDelete(item),
    },
  ];

  const currentPlan = subscriptions.find((plan) => plan.id === currentPlanId);

  return (
    <div className="space-y-4">
      <Modal ref={modal.ref} title={modalTitle}>
        {modalContent}
      </Modal>

      {currentPlan && (
        <div className="card bg-base-100 shadow-md ring ring-current/20 ">
          <div className="card-body">
            <h2 className="text-2xl font-bold text-primary ">
              {currentPlan.name}
            </h2>
            <p className="text-sm text-gray-500 ">Your Current Plan</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-base text-gray-700">
              <span className="font-semibold">Price: {currentPlan.price}</span>
              <span className="hidden sm:inline">•</span>
              <span className="font-semibold">
                Duration: {currentPlan.duration}
              </span>
            </div>
            {currentPlan.description && (
              <p className="text-sm text-gray-600 ">
                {currentPlan.description}
              </p>
            )}
            <div className="card-actions justify-end ">
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleEditView(currentPlan)}
              >
                Manage Plan
              </button>
            </div>
          </div>
        </div>
      )}

      <SimpleContainer
        title="Subscriptions"
        actions={
          <>
            <ActionButton onClick={handleAddSubscription}>
              Add Subscription
            </ActionButton>
          </>
        }
      >
        <CustomTable
          ring={false}
          columns={columns}
          data={subscriptions}
          actions={actions}
        />
      </SimpleContainer>
    </div>
  );
}
