import { useRef, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import type { Employee } from "./types";
import EmployeeAvatar from "./EmployeeAvatar";
import EmployeeStatusBadge from "./EmployeeStatusBadge";
import { formatSalary } from "./employeeData";
import {
  Mail,
  Phone,
  Building2,
  Calendar,
  Briefcase,
  MapPin,
  User,
  ShieldCheck,
  Banknote,
  CalendarCheck2,
  Pencil,
} from "lucide-react";

interface EmployeeDetailModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleLeave?: (employeeId: string) => void;
}

export default function EmployeeDetailModal({
  employee,
  isOpen,
  onClose,
  onToggleLeave,
}: EmployeeDetailModalProps) {
  const modalRef = useRef<ModalHandle>(null);

  useEffect(() => {
    if (isOpen && employee) {
      modalRef.current?.open();
    } else {
      modalRef.current?.close();
    }
  }, [isOpen, employee]);

  if (!employee) return null;

  return (
    <Modal ref={modalRef} title={`Employee Profile · ${employee.id}`}>
      <div className="space-y-6 pt-1">
        {/* Profile Header */}
        <div className="p-4 sm:p-5 rounded-2xl bg-base-200/80 border border-base-200 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <EmployeeAvatar name={employee.name} size="lg" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-lg font-bold text-base-content">
                {employee.name}
              </h3>
              <EmployeeStatusBadge
                status={employee.status}
                onLeave={employee.onLeave}
              />
            </div>
            <p className="text-sm font-medium text-base-content/70">
              {employee.title} ·{" "}
              <span className="text-primary font-semibold">
                {employee.dept}
              </span>
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3  text-base-content/80 pt-1">
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 text-base-content/40" />
                {employee.location}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Briefcase className="size-3.5 text-base-content/40" />
                {employee.type}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-base-content/40" />
                Grade {employee.grade || "G2"}
              </span>
            </div>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-base-100 border border-base-200 rounded-xl">
            <span className=" text-base-content/80 block flex items-center gap-1">
              <Banknote className="size-3 text-primary" /> Monthly Salary
            </span>
            <span className="text-sm font-semibold text-base-content block mt-1">
              {formatSalary(employee.salary)}
            </span>
          </div>

          <div className="p-3 bg-base-100 border border-base-200 rounded-xl">
            <span className=" text-base-content/80 block flex items-center gap-1">
              <Calendar className="size-3 text-info" /> Joining Date
            </span>
            <span className="text-sm font-semibold text-base-content block mt-1">
              {employee.start || "—"}
            </span>
          </div>

          <div className="p-3 bg-base-100 border border-base-200 rounded-xl col-span-2 sm:col-span-1">
            <span className=" text-base-content/80 block flex items-center gap-1">
              <CalendarCheck2 className="size-3 text-warning" /> Reports To
            </span>
            <span className="text-sm font-semibold text-base-content block mt-1 truncate">
              {employee.manager || "Executive Leadership"}
            </span>
          </div>
        </div>

        {/* Contact & Professional Info Grid */}
        <div className="space-y-3">
          <h4 className=" font-semibold uppercase tracking-wider text-base-content/80">
            Contact & Office Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 ">
            <div className="p-3 rounded-xl bg-base-200/40 border border-base-200 space-y-1">
              <span className="text-base-content/80 flex items-center gap-1.5">
                <Mail className="size-3.5 text-primary" /> Email Address
              </span>
              <p className="font-semibold text-base-content select-all">
                {employee.email}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-base-200/40 border border-base-200 space-y-1">
              <span className="text-base-content/80 flex items-center gap-1.5">
                <Phone className="size-3.5 text-success" /> Phone Number
              </span>
              <p className="font-semibold text-base-content">
                {employee.phone}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-base-200/40 border border-base-200 space-y-1">
              <span className="text-base-content/80 flex items-center gap-1.5">
                <Building2 className="size-3.5 text-info" /> Department
              </span>
              <p className="font-semibold text-base-content">{employee.dept}</p>
            </div>

            <div className="p-3 rounded-xl bg-base-200/40 border border-base-200 space-y-1">
              <span className="text-base-content/80 flex items-center gap-1.5">
                <User className="size-3.5 text-warning" /> Direct Supervisor
              </span>
              <p className="font-semibold text-base-content">
                {employee.manager || "Executive Leadership"}
              </p>
            </div>
          </div>
        </div>

        {/* Status / Compliance notes */}
        <div className="space-y-3">
          <h4 className=" font-semibold uppercase tracking-wider text-base-content/80">
            Employment Availability
          </h4>
          <div className="p-4 rounded-xl border border-base-200 bg-base-200/20 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className=" font-semibold text-base-content">
                Current Availability
              </p>
              <p className="text-[11px] text-base-content/80">
                Determines whether this employee is active on shifts or on
                scheduled leave.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`size-2 rounded-full ${
                  employee.onLeave
                    ? "bg-amber-500"
                    : "bg-emerald-500 animate-pulse"
                }`}
              />
              <span
                className={`font-semibold  ${
                  employee.onLeave ? "text-amber-600" : "text-emerald-600"
                }`}
              >
                {employee.onLeave ? "Currently On Leave" : "Active & Present"}
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-base-200 flex flex-wrap items-center justify-between gap-2">
          {onToggleLeave && (
            <button
              type="button"
              onClick={() => onToggleLeave(employee.id)}
              className="btn btn-sm btn-outline border-base-300 "
            >
              {employee.onLeave
                ? "Mark as Returned from Leave"
                : "Mark as On Leave"}
            </button>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <Link
              to="/hr/staffs/$id"
              params={{ id: employee.id }}
              className="btn btn-sm btn-primary  gap-1.5"
            >
              <Pencil className="size-3.5" /> Edit Profile
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-sm btn-ghost "
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
