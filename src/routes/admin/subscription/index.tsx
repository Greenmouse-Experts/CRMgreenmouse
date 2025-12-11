import ActionButton from "@/components/buttons/ActionButton";
import Modal from "@/components/modals/DialogModal";
import SimpleContainer from "@/components/SimpleContainer";
import CustomTable from "@/components/tables/CustomTable";
import { useModal } from "@/store/modals";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import SimpleInput from "@/components/inputs/SimpleInput";
import { nanoid } from "nanoid";

// Define the type for the form values
interface SubscriptionFormValues {
  id?: string; // Optional for new plans
  name: string;
  planDuration: string;
  currency: string;
  planPrice: string;
  roles: string; // Comma-separated string for input
}

// Define the type for the subscription items stored in state/table data
interface SubscriptionItem {
  id: string;
  name: string;
  planDuration: string;
  currency: string;
  planPrice: string;
  roles: string[]; // Array of strings for data storage
}

export const Route = createFileRoute("/admin/subscription/")({
  component: RouteComponent,
});

const columns = [
  {
    key: "name",
    label: "Name",
  },
  {
    key: "planDuration",
    label: "Plan Duration",
  },
  {
    key: "currency",
    label: "Currency",
  },
  {
    key: "planPrice",
    label: "Plan Price",
  },
  {
    key: "roles",
    label: "Roles",
    render: (value: string[]) => (
      <div className="flex flex-wrap gap-1">
        {value.map((role, index) => (
          <span key={index} className="badge shadow badge-sm badge-accent">
            {role}
          </span>
        ))}
      </div>
    ),
  },
];

const initialData: SubscriptionItem[] = [
  {
    id: "1",
    name: "Basic Plan",
    planDuration: "Monthly",
    currency: "USD",
    planPrice: "10",
    roles: ["User"],
  },
  {
    id: "2",
    name: "Pro Plan",
    planDuration: "Annually",
    currency: "USD",
    planPrice: "99",
    roles: ["User", "Editor"],
  },
  {
    id: "3",
    name: "Enterprise Plan",
    planDuration: "Annually",
    currency: "USD",
    planPrice: "Custom",
    roles: ["User", "Editor", "Admin"],
  },
  {
    id: "4",
    name: "Free Trial",
    planDuration: "7 Days",
    currency: "USD",
    planPrice: "0",
    roles: ["Guest"],
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
      planDuration: "",
      currency: "USD",
      planPrice: "",
      roles: "",
    },
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-4">
        {/* Hidden input for ID when editing, ensuring it's registered with react-hook-form */}
        {initialValues?.id && (
          <input type="hidden" {...methods.register("id")} />
        )}

        <SimpleInput label="Name" name="name" />
        <SimpleInput label="Plan Duration" name="planDuration" />
        <SimpleInput label="Currency" name="currency" />
        <SimpleInput label="Plan Price" name="planPrice" />
        <SimpleInput
          label="Roles (comma-separated)"
          name="roles"
          placeholder="e.g., User, Editor"
        />

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
  const [currentPlanId] = useState<string | null>("2"); // Example: Set a default current plan

  const onSubmit = (values: SubscriptionFormValues) => {
    const updatedRoles = values.roles
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r !== "");

    const baseSubscription: Omit<SubscriptionItem, "id"> = {
      name: values.name,
      planDuration: values.planDuration,
      currency: values.currency,
      planPrice: values.planPrice,
      roles: updatedRoles,
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
          planDuration: item.planDuration,
          currency: item.currency,
          planPrice: item.planPrice,
          roles: item.roles.join(", "),
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
              <span className="font-semibold">
                Price: {currentPlan.currency}
                {currentPlan.planPrice}
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="font-semibold">
                Duration: {currentPlan.planDuration}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-2 items-center">
              <span className="font-semibold">Roles:</span>
              {currentPlan.roles.map((role, index) => (
                <span key={index} className="badge badge-accent">
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <SimpleContainer
        title="Subscriptions"
        actions={
          <>
            <ActionButton
              className="btn btn-primary btn-sm"
              onClick={handleAddSubscription}
            >
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
