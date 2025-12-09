import { createFileRoute } from "@tanstack/react-router";
import ExpensesStat from "./-components/ExpensesStats";
import { useTabs, type Tab } from "@/stores/client";
import CustomTabs from "@/components/CustomTabs";
import Incometable from "./-components/IncomeTable";
import ExpenseTable from "./-components/ExpenseTable";
import ActionButton from "@/components/buttons/ActionButton";
import { useModal } from "@/helpers/modals";
import Modal from "@/components/modals/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";

export const Route = createFileRoute("/admin/accounts/income-expenses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const tabs: Tab[] = [
    {
      name: "Income",
    },
    { name: "Expenses" },
  ];
  const tab = useTabs(tabs, { name: "Income" });
  const incomeModal = useModal();
  const expenseModal = useModal();

  return (
    <section className="space-y-4">
      <Modal ref={incomeModal.ref} title="Add Income">
        <div className="space-y-4">
          <SimpleInput label="Amount" type="number" />
          <SimpleInput label="Type" type="text" />
          <SimpleTextArea label="Description" />
          <div className="flex gap-2">
            <span className="font-semibold fieldset-label">Status</span>{" "}
            <input type="checkbox" className="toggle" />
          </div>
          <button className="btn btn-primary btn-block">Save</button>
        </div>
      </Modal>
      <Modal ref={expenseModal.ref} title="Add Expense">
        <div className="space-y-4">
          <SimpleInput label="Amount" type="number" />
          <SimpleInput label="Type" type="text" />
          <SimpleTextArea label="Description" />
          <div className="flex gap-2">
            <span className="font-semibold fieldset-label">Status</span>{" "}
            <input type="checkbox" className="toggle" />
          </div>
          <button className="btn btn-error btn-block">Save</button>
        </div>
      </Modal>
      <ExpensesStat />
      <div className="bg-base-100 shadow rounded-box flex items-center px-2">
        <CustomTabs tabs={tabs} tabProps={tab}></CustomTabs>
        <div className="ml-auto">
          {tab.tab.name == "Income" ? (
            <ActionButton
              className="btn btn-success btn-sm"
              onClick={incomeModal.showModal}
            >
              Add Income
            </ActionButton>
          ) : (
            <ActionButton
              className="btn btn-error btn-sm"
              onClick={expenseModal.showModal}
            >
              Add Expense
            </ActionButton>
          )}
        </div>
      </div>
      <div className="">
        {tab.tab.name == "Income" ? <Incometable /> : <ExpenseTable />}
      </div>
    </section>
  );
}
