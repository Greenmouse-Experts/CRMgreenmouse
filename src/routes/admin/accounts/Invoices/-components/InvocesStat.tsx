import React from "react";
import { FileText, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import type { Invoice } from "@/api/financeApi";

interface InvoicesStatProps {
  invoices?: Invoice[];
  statsData?: {
    total?: number;
    paid?: number;
    pending?: number;
    overdue?: number;
    revenue?: number;
  };
}

export default function InvoicesStat({ invoices = [], statsData }: InvoicesStatProps) {
  const totalInvoices = statsData?.total ?? invoices.length;
  const paidInvoices =
    statsData?.paid ??
    invoices.filter((inv) => inv.status?.toLowerCase() === "paid").length;
  const pendingInvoices =
    statsData?.pending ??
    invoices.filter((inv) =>
      ["pending", "sent", "draft"].includes(inv.status?.toLowerCase() || "")
    ).length;
  const overdueInvoices =
    statsData?.overdue ??
    invoices.filter((inv) => inv.status?.toLowerCase() === "overdue").length;

  const totalCollected =
    statsData?.revenue ??
    invoices
      .filter((inv) => inv.status?.toLowerCase() === "paid")
      .reduce((sum, inv) => {
        const itemSum = inv.items?.reduce(
          (s, it) => s + (Number(it.unitPrice) || 0) * (Number(it.qty) || 1),
          0
        ) || 0;
        return sum + (inv.total ?? itemSum);
      }, 0);

  const stats = [
    {
      title: "Total Invoices",
      value: totalInvoices,
      desc: "All issued & drafts",
      icon: <FileText className="size-6 text-primary" />,
      colorClass: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "Paid Invoices",
      value: paidInvoices,
      desc: `Collected: ₦${totalCollected.toLocaleString()}`,
      icon: <CheckCircle2 className="size-6 text-success" />,
      colorClass: "bg-success/10 text-success border-success/20",
    },
    {
      title: "Pending / Sent",
      value: pendingInvoices,
      desc: "Awaiting client settlement",
      icon: <Clock className="size-6 text-warning" />,
      colorClass: "bg-warning/10 text-warning border-warning/20",
    },
    {
      title: "Overdue",
      value: overdueInvoices,
      desc: "Requires payment reminder",
      icon: <AlertCircle className="size-6 text-error" />,
      colorClass: "bg-error/10 text-error border-error/20",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className="card bg-base-100/70 backdrop-blur-md border border-base-200 shadow-sm p-4 hover:shadow-md transition-all duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
                {stat.title}
              </p>
              <h3 className="text-2xl font-bold text-base-content mt-1">
                {stat.value}
              </h3>
              <p className="text-xs text-base-content/50 mt-0.5">{stat.desc}</p>
            </div>
            <div className={`p-3 rounded-xl border ${stat.colorClass}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
