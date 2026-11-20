import { useEffect, useRef } from "react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { formatCurrency } from "./payrollData";
import type { Payslip } from "./types";
import { Download } from "lucide-react";

interface PayslipModalProps {
  payslip: Payslip | null;
  onClose: () => void;
  onDownload: (payslip: Payslip) => void;
}

export default function PayslipModal({
  payslip,
  onClose,
  onDownload,
}: PayslipModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  useEffect(() => {
    if (payslip) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [payslip]);

  if (!payslip) {
    return <Modal ref={modalRef} title="Payslip" onClose={onClose} />;
  }

  const deductions = payslip.tax + payslip.pension + payslip.loan;

  return (
    <Modal
      ref={modalRef}
      title={`Payslip · ${payslip.id}`}
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-base-200 bg-base-200/80 p-4">
          <div className="text-sm font-bold text-base-content">
            {payslip.employee}
          </div>
          <div className=" text-base-content/80">
            {payslip.role} · {payslip.department}
          </div>
          <div className="mt-1 text-[11px] text-base-content/80">
            {payslip.bank} {payslip.accountMasked} · Nov 2026
          </div>
        </div>

        <div className="space-y-1.5 ">
          <div className="flex items-center justify-between py-1">
            <span className="text-base-content/80">Base salary</span>
            <span className="font-semibold text-base-content">
              {formatCurrency(payslip.baseSalary)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-base-content/80">Allowances</span>
            <span className="font-semibold text-base-content">
              {formatCurrency(payslip.allowances)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-base-content/80">Overtime</span>
            <span className="font-semibold text-base-content">
              {formatCurrency(payslip.overtime)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span className="text-base-content/80">Bonus</span>
            <span className="font-semibold text-base-content">
              {formatCurrency(payslip.bonus)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-base-200 py-1.5">
            <span className="font-semibold text-base-content">Gross</span>
            <span className="font-bold text-base-content">
              {formatCurrency(payslip.gross)}
            </span>
          </div>

          <div className="flex items-center justify-between py-1 text-rose-600">
            <span>PAYE tax</span>
            <span className="font-semibold">
              −{formatCurrency(payslip.tax)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 text-rose-600">
            <span>Pension (8%)</span>
            <span className="font-semibold">
              −{formatCurrency(payslip.pension)}
            </span>
          </div>
          <div className="flex items-center justify-between py-1 text-rose-600">
            <span>Loan recovery</span>
            <span className="font-semibold">
              −{formatCurrency(payslip.loan)}
            </span>
          </div>
          <div className="flex items-center justify-between border-t border-base-200 py-1.5">
            <span className="font-semibold text-base-content">
              Total deductions
            </span>
            <span className="font-bold text-rose-600">
              −{formatCurrency(deductions)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl bg-primary/5 border border-primary/20 p-4">
          <span className=" font-semibold uppercase tracking-wider text-base-content/80">
            Net pay
          </span>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(payslip.netPay)}
          </span>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-base-200">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-ghost rounded-xl"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => onDownload(payslip)}
            className="btn btn-sm bg-primary text-white hover:bg-primary/90 rounded-xl px-5 gap-1.5"
          >
            <Download className="size-3.5" />
            <span>Download PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
}
