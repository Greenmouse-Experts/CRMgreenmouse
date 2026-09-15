import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ExpensesStat from "./-components/ExpensesStats";
import { useTabs, type Tab } from "@/stores/client";
import CustomTabs from "@/components/CustomTabs";
import IncomeTable from "./-components/IncomeTable";
import ExpenseTable from "./-components/ExpenseTable";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import PageHeader from "@/components/Headers/PageHeader";
import PageLoader from "@/components/layout/PageLoader";
import ContainerRow from "@/components/ContainerRow";
import { useSearch } from "@/stores/data";
import {
  useIncomeRecords,
  useExpenseRecords,
  useCreateIncome,
  useCreateExpense,
} from "@/api/financeApi";
import { PlusCircleIcon } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/accounts/income-expenses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const tabs: Tab[] = [
    { name: "Income" },
    { name: "Expenses" },
  ];
  const tab = useTabs(tabs, { name: "Income" });
  const searchProps = useSearch();

  const incomeQuery = useIncomeRecords();
  const expenseQuery = useExpenseRecords();
  const createIncome = useCreateIncome();
  const createExpense = useCreateExpense();

  const incomeModalRef = useRef<ModalHandle>(null);
  const expenseModalRef = useRef<ModalHandle>(null);

  const [incomeForm, setIncomeForm] = useState({
    amount: 0,
    type: "Salary",
    source: "",
    description: "",
    status: "Pending",
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: 0,
    category: "Software",
    paidTo: "",
    description: "",
    status: "Pending",
  });

  const handleOpenAddIncome = () => {
    setIncomeForm({
      amount: 0,
      type: "Salary",
      source: "",
      description: "",
      status: "Pending",
    });
    incomeModalRef.current?.open();
  };

  const handleOpenAddExpense = () => {
    setExpenseForm({
      amount: 0,
      category: "Software",
      paidTo: "",
      description: "",
      status: "Pending",
    });
    expenseModalRef.current?.open();
  };

  const handleSaveIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeForm.source.trim()) {
      toast.error("Source is required");
      return;
    }
    if (incomeForm.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    try {
      await createIncome.mutateAsync(incomeForm);
      toast.success("Income recorded successfully");
      incomeModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create income record");
    }
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.paidTo.trim()) {
      toast.error("Recipient (Paid To) is required");
      return;
    }
    if (expenseForm.amount <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    try {
      await createExpense.mutateAsync(expenseForm);
      toast.success("Expense recorded successfully");
      expenseModalRef.current?.close();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create expense record");
    }
  };

  const isIncome = tab.tab.name === "Income";

  return (
    <section className="space-y-6">
      <PageHeader
        title="Income & Expenses"
        description="Monitor company cash flows, revenue sources, and expenditure records"
      >
        <div className="flex items-center gap-2">
          {isIncome ? (
            <button
              onClick={handleOpenAddIncome}
              className="btn btn-success text-white btn-sm"
            >
              <PlusCircleIcon className="size-4" /> Add Income
            </button>
          ) : (
            <button
              onClick={handleOpenAddExpense}
              className="btn btn-error text-white btn-sm"
            >
              <PlusCircleIcon className="size-4" /> Add Expense
            </button>
          )}
        </div>
      </PageHeader>

      <PageLoader
        query={(isIncome ? incomeQuery : expenseQuery) as any}
        showSuccessState={true}
      >
        <ExpensesStat
          incomeList={incomeQuery.data || []}
          expenseList={expenseQuery.data || []}
        />

        <div className="bg-base-100/70 backdrop-blur-md shadow-sm border border-base-200 rounded-box p-4 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-base-200 pb-3">
            <CustomTabs tabs={tabs} tabProps={tab} />
            <ContainerRow searchProps={searchProps} showSearch={true} />
          </div>

          <div>
            {isIncome ? (
              <IncomeTable searchTerm={searchProps.search || ""} />
            ) : (
              <ExpenseTable searchTerm={searchProps.search || ""} />
            )}
          </div>
        </div>
      </PageLoader>

      {/* Add Income Modal */}
      <Modal ref={incomeModalRef} title="Record New Income">
        <form onSubmit={handleSaveIncome} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Amount (₦) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="input input-bordered w-full mt-1"
                value={incomeForm.amount || ""}
                onChange={(e) =>
                  setIncomeForm({ ...incomeForm, amount: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Type / Stream
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={incomeForm.type}
                onChange={(e) =>
                  setIncomeForm({ ...incomeForm, type: e.target.value })
                }
              >
                <option value="Salary">Salary</option>
                <option value="Sales">Sales</option>
                <option value="Grant">Grant</option>
                <option value="Commission">Commission</option>
                <option value="Investment">Investment</option>
                <option value="Bonus">Bonus</option>
                <option value="Rental Income">Rental Income</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Source (Company / Client / Provider) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Acme Corp Ltd"
              className="input input-bordered w-full mt-1"
              value={incomeForm.source}
              onChange={(e) =>
                setIncomeForm({ ...incomeForm, source: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Initial Status
            </label>
            <select
              className="select select-bordered w-full mt-1"
              value={incomeForm.status}
              onChange={(e) =>
                setIncomeForm({ ...incomeForm, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              placeholder="Details regarding this income..."
              value={incomeForm.description}
              onChange={(e) =>
                setIncomeForm({ ...incomeForm, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => incomeModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success text-white"
              disabled={createIncome.isPending}
            >
              {createIncome.isPending ? "Recording..." : "Record Income"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal ref={expenseModalRef} title="Record New Expense">
        <form onSubmit={handleSaveExpense} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Amount (₦) *
              </label>
              <input
                type="number"
                required
                min="0.01"
                step="0.01"
                placeholder="0.00"
                className="input input-bordered w-full mt-1"
                value={expenseForm.amount || ""}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-base-content/70">
                Category
              </label>
              <select
                className="select select-bordered w-full mt-1"
                value={expenseForm.category}
                onChange={(e) =>
                  setExpenseForm({ ...expenseForm, category: e.target.value })
                }
              >
                <option value="Software">Software & Subscriptions</option>
                <option value="Travel">Travel & Lodging</option>
                <option value="Office Supplies">Office Supplies</option>
                <option value="Meals">Meals & Entertainment</option>
                <option value="Utilities">Utilities & Rent</option>
                <option value="Marketing">Marketing & Advertising</option>
                <option value="Insurance">Insurance</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Paid To (Vendor / Employee / Contractor) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Cloud Services"
              className="input input-bordered w-full mt-1"
              value={expenseForm.paidTo}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, paidTo: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Initial Status
            </label>
            <select
              className="select select-bordered w-full mt-1"
              value={expenseForm.status}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, status: e.target.value })
              }
            >
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-base-content/70">
              Description
            </label>
            <textarea
              className="textarea textarea-bordered w-full mt-1"
              rows={3}
              placeholder="Details regarding this expense..."
              value={expenseForm.description}
              onChange={(e) =>
                setExpenseForm({ ...expenseForm, description: e.target.value })
              }
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => expenseModalRef.current?.close()}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-error text-white"
              disabled={createExpense.isPending}
            >
              {createExpense.isPending ? "Recording..." : "Record Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
