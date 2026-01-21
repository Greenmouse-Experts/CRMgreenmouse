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
import PageHeader from "@/components/Headers/PageHeader";
import LocalSelect from "@/components/inputs/LocalSelect";

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
      <PageHeader
        title="Income & Expenses"
        description="View and manage all income and expenses"
      />

      <Modal ref={incomeModal.ref} title="Add Income">
        <div className="space-y-4">
          <SimpleInput label="Amount" type="number" />
          <LocalSelect label="Type">
            <option>Salary</option>
            <option>Freelance</option>
            <option>Investment</option>
            <option>Bonus</option>
            <option>Rental Income</option>
          </LocalSelect>
          <SimpleInput label="Source" type="text" />
          <SimpleTextArea label="Description" />
          <LocalSelect label="Status">
            <option>Pending</option>
            <option>Received</option>
            <option>Overdue</option>
          </LocalSelect>
          <button className="btn btn-primary btn-block">Save Income</button>
        </div>
      </Modal>

      <Modal ref={expenseModal.ref} title="Add Expense">
        <div className="space-y-4">
          <SimpleInput label="Amount" type="number" />
          <LocalSelect label="Category">
            <option>Travel</option>
            <option>Office Supplies</option>
            <option>Software</option>
            <option>Meals</option>
            <option>Utilities</option>
            <option>Marketing</option>
          </LocalSelect>
          <SimpleInput label="Paid To" type="text" />
          <SimpleTextArea label="Description" />
          <LocalSelect label="Status">
            <option>Pending</option>
            <option>Approved</option>
            <option>Rejected</option>
          </LocalSelect>
          <button className="btn btn-error btn-block">Save Expense</button>
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
