import { useEffect, useRef } from "react";
import { Download } from "lucide-react";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import { getPayslipStatusBadge } from "./StatusBadges";
import { formatCurrency } from "./selfServiceData";
import type { Payslip } from "./types";

interface PayslipModalProps {
  payslip: Payslip | null;
  onClose: () => void;
  onDownload: (payslip: Payslip) => void;
}

interface PayslipRowProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

function PayslipRow({ label, value, valueClassName = "" }: PayslipRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-base-content/80">{label}</span>
      <span className={`font-semibold text-base-content ${valueClassName}`}>
        {value}
      </span>
    </div>
  );
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

  return (
    <Modal
      ref={modalRef}
      title={`Payslip · ${payslip.id}`}
      maxWidth="max-w-lg"
      onClose={onClose}
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-base-200 bg-base-200/80 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-mono text-sm font-semibold text-base-content">
              {payslip.id}
            </div>
            {getPayslipStatusBadge(payslip.status)}
          </div>
          <div className="mt-1  text-base-content/80">{payslip.bank}</div>
        </div>

        <div className="space-y-1.5">
          <PayslipRow label="Month" value={payslip.month} />
          <PayslipRow label="Gross" value={formatCurrency(payslip.gross)} />
          <PayslipRow
            label="Deductions"
            value={formatCurrency(payslip.deductions)}
            valueClassName="text-rose-600"
          />
          <div className="flex items-center justify-between border-t border-base-200 py-1.5">
            <span className="font-semibold text-base-content">Net Pay</span>
            <span className="font-bold text-primary">
              {formatCurrency(payslip.netPay)}
            </span>
          </div>
        </div>
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
    </Modal>
  );
}
