import { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import ExpensesStat from "./-components/ExpensesStats";
import { useTabs, type Tab } from "@/stores/client";
import CustomTabs from "@/components/CustomTabs";
import IncomeTable from "./-components/IncomeTable";
import ExpenseTable from "./-components/ExpenseTable";
import ActionButton from "@/components/buttons/ActionButton";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import PageHeader from "@/components/Headers/PageHeader";
import LocalSelect from "@/components/inputs/LocalSelect";
import { useCreateIncome, useCreateExpense } from "@/api/financeApi";
import { toast } from "sonner";
import { PlusCircle } from "lucide-react";

export const Route = createFileRoute("/tenant/accounts/income-expenses/")({
  component: RouteComponent,
});

function RouteComponent() {
  const tabs: Tab[] = [{ name: "Income" }, { name: "Expenses" }];
  const tab = useTabs(tabs, { name: "Income" });

  const createIncome = useCreateIncome();
  const createExpense = useCreateExpense();

  const incomeModalRef = useRef<ModalHandle>(null);
  const expenseModalRef = useRef<ModalHandle>(null);

  const [incomeForm, setIncomeForm] = useState({
    amount: "",
    type: "Sales",
    source: "",
    description: "",
    status: "Received",
    date: new Date().toISOString().split("T")[0],
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    category: "Software",
    paidTo: "",
    description: "",
    status: "Approved",
    date: new Date().toISOString().split("T")[0],
  });

  const handleOpenIncome = () => {
    setIncomeForm({
      amount: "",
      type: "Sales",
      source: "",
      description: "",
      status: "Received",
      date: new Date().toISOString().split("T")[0],
    });
    incomeModalRef.current?.open();
  };

  const handleOpenExpense = () => {
    setExpenseForm({
      amount: "",
      category: "Software",
      paidTo: "",
      description: "",
      status: "Approved",
      date: new Date().toISOString().split("T")[0],
    });
    expenseModalRef.current?.open();
  };

  const handleSubmitIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!incomeForm.amount || !incomeForm.source) {
      toast.error("Please provide both amount and source.");
      return;
    }
    try {
      await createIncome.mutateAsync({
        amount: parseFloat(incomeForm.amount) || 0,
        type: incomeForm.type,
        source: incomeForm.source,
        description: incomeForm.description,
        status: incomeForm.status,
        date: incomeForm.date,
      });
      toast.success("Income record created successfully.");
      incomeModalRef.current?.close();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create income record.",
      );
    }
  };

  const handleSubmitExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.paidTo) {
      toast.error("Please provide both amount and recipient.");
      return;
    }
    try {
      await createExpense.mutateAsync({
        amount: parseFloat(expenseForm.amount) || 0,
        category: expenseForm.category,
        paidTo: expenseForm.paidTo,
        description: expenseForm.description,
        status: expenseForm.status,
        date: expenseForm.date,
      });
      toast.success("Expense record created successfully.");
      expenseModalRef.current?.close();
    } catch (err: any) {
      toast.error(
        err.response?.data?.message || "Failed to create expense record.",
      );
    }
  };

  return (
    <section className="space-y-4">
      <PageHeader
        title="Income & Expenses"
        description="View cash flow, track incoming revenue, and log operational expenses"
      />

      <ExpensesStat />

      <div className="bg-base-100 shadow rounded-box flex items-center justify-between p-2">
        <CustomTabs tabs={tabs} tabProps={tab} />
        <div>
          {tab.tab.name === "Income" ? (
            <ActionButton
              className="btn btn-success btn-sm text-success-content"
              onClick={handleOpenIncome}
            >
              <PlusCircle className="size-4 mr-1" /> Add Income
            </ActionButton>
          ) : (
            <ActionButton
              className="btn btn-error btn-sm text-error-content"
              onClick={handleOpenExpense}
            >
              <PlusCircle className="size-4 mr-1" /> Add Expense
            </ActionButton>
          )}
        </div>
      </div>

      <div className="bg-base-100 shadow rounded-box p-4">
        {tab.tab.name === "Income" ? <IncomeTable /> : <ExpenseTable />}
      </div>

      {/* Add Income Modal */}
      <Modal ref={incomeModalRef} title="Log New Income">
        <form onSubmit={handleSubmitIncome} className="space-y-4 pt-2">
          <SimpleInput
            label="Amount ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={incomeForm.amount}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, amount: e.target.value })
            }
            required
          />
          <LocalSelect
            label="Category / Income Type"
            value={incomeForm.type}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, type: e.target.value })
            }
          >
            <option value="Sales">Sales</option>
            <option value="Consulting">Consulting</option>
            <option value="Freelance">Freelance</option>
            <option value="Investment">Investment</option>
            <option value="Bonus">Bonus</option>
            <option value="Rental Income">Rental Income</option>
            <option value="Other">Other</option>
          </LocalSelect>
          <SimpleInput
            label="Payer / Source"
            type="text"
            placeholder="e.g. Acme Corp, Client X"
            value={incomeForm.source}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, source: e.target.value })
            }
            required
          />
          <SimpleInput
            label="Date"
            type="date"
            value={incomeForm.date}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, date: e.target.value })
            }
          />
          <LocalSelect
            label="Payment Status"
            value={incomeForm.status}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, status: e.target.value })
            }
          >
            <option value="Received">Received</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </LocalSelect>
          <SimpleTextArea
            label="Description / Memo"
            placeholder="Notes or invoice reference..."
            value={incomeForm.description}
            onChange={(e) =>
              setIncomeForm({ ...incomeForm, description: e.target.value })
            }
          />
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
              disabled={createIncome.isPending}
              className="btn btn-primary"
            >
              {createIncome.isPending ? "Saving..." : "Save Income"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Expense Modal */}
      <Modal ref={expenseModalRef} title="Record New Expense">
        <form onSubmit={handleSubmitExpense} className="space-y-4 pt-2">
          <SimpleInput
            label="Amount ($)"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={expenseForm.amount}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, amount: e.target.value })
            }
            required
          />
          <LocalSelect
            label="Expense Category"
            value={expenseForm.category}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, category: e.target.value })
            }
          >
            <option value="Software">Software & Subscriptions</option>
            <option value="Travel">Travel & Lodging</option>
            <option value="Office Supplies">Office Supplies</option>
            <option value="Meals">Meals & Entertainment</option>
            <option value="Utilities">Utilities & Hosting</option>
            <option value="Marketing">Marketing & Advertising</option>
            <option value="Contractors">Contractors & Payroll</option>
            <option value="Other">Other</option>
          </LocalSelect>
          <SimpleInput
            label="Vendor / Payee"
            type="text"
            placeholder="e.g. AWS, Office Depot, Contractor"
            value={expenseForm.paidTo}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, paidTo: e.target.value })
            }
            required
          />
          <SimpleInput
            label="Date"
            type="date"
            value={expenseForm.date}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, date: e.target.value })
            }
          />
          <LocalSelect
            label="Approval Status"
            value={expenseForm.status}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, status: e.target.value })
            }
          >
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </LocalSelect>
          <SimpleTextArea
            label="Description / Memo"
            placeholder="Details or receipt reference..."
            value={expenseForm.description}
            onChange={(e) =>
              setExpenseForm({ ...expenseForm, description: e.target.value })
            }
          />
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
              disabled={createExpense.isPending}
              className="btn btn-error text-error-content"
            >
              {createExpense.isPending ? "Saving..." : "Save Expense"}
            </button>
          </div>
        </form>
      </Modal>
    </section>
  );
}
