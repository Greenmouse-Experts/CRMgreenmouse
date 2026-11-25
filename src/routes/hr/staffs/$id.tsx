import { useEffect, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  User,
  Phone,
  CreditCard,
  Building2,
  AlertCircle,
  Loader2,
  Pencil,
  MapPin,
  Briefcase,
  ShieldCheck,
  Clock,
  Eye,
  UserX,
  Lock,
  FileText,
  Pause,
  Play,
} from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import SimpleSelect from "@/components/inputs/SimpleSelect";
import DocUploader from "@/components/documents/DocUploader";
import { useDocumentUploads } from "@/hooks/useDocumentUploads";
import EmployeeAvatar from "./-components/EmployeeAvatar";
import EmployeeStatusBadge from "./-components/EmployeeStatusBadge";
import { formatSalary } from "./-components/employeeData";
import {
  useActivateEmployee,
  useCreateEmployee,
  useEmployee,
  useEmployees,
  useEmployeeOrganization,
  useFinalizeEmployee,
  useReactivateEmployee,
  useRemoveEmployee,
  useSuspendEmployee,
  useUpdateEmployee,
  type CreateEmployeeInput,
  type EmployeeRecord,
} from "@/api/employeesApi";
import { extract_message } from "@/helpers/auth";

export interface StaffDetailSearchParams {
  mode?: "edit" | "view";
}

export const Route = createFileRoute("/hr/staffs/$id")({
  validateSearch: (
    search: Record<string, unknown>,
  ): StaffDetailSearchParams => ({
    mode:
      search?.mode === "edit"
        ? "edit"
        : search?.mode === "view"
          ? "view"
          : undefined,
  }),
  component: StaffDetailPage,
});

export interface EmployeeFormData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  residentialAddress?: string;

  // Employment
  employeeNumber?: string;
  department?: string;
  departmentId?: string;
  jobTitle?: string;
  positionId?: string;
  employeeType?: string;
  workLocation?: string;
  grade?: string;
  managerId?: string;
  startDate?: string;
  workSchedule?: string;

  // Contract & Probation
  isOnProbation?: boolean;
  probationEndDate?: string;
  contractType?: string;
  contractEndDate?: string;
  needsSystemAccount?: boolean;

  // Emergency contact
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;

  // Compensation
  basicSalary?: string | number;
  payFrequency?: string;
  bankName?: string;
  bankAccountNumber?: string;
}

const FORM_STEPS = [
  "Personal",
  "Emergency contact",
  "Employment",
  "Compensation",
  "Documents",
  "Review",
];

const DOCUMENT_ITEMS = [
  {
    key: "cv",
    title: "CV / Resume",
    description:
      "PDF or Word document highlighting career history and education.",
  },
  {
    key: "contract",
    title: "Signed Employment Contract",
    description:
      "Executed offer letter and signed terms of employment agreement.",
  },
  {
    key: "id_document",
    title: "Identity Document (NIN / Passport)",
    description:
      "Government-issued identity card, international passport or license.",
  },
  {
    key: "certificates",
    title: "Academic & Professional Certificates",
    description:
      "Degree certificate, diplomas, or professional accreditation credentials.",
  },
  {
    key: "policies",
    title: "Signed Policies & NDA",
    description:
      "Acknowledged employee handbook, IT policy, and non-disclosure agreement.",
  },
];

const DEFAULT_GRADES = ["G1", "G2", "G3", "G4", "G5", "G6", "G7"];
const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Intern",
  "Casual",
];
const WORK_LOCATIONS = [
  "Remote",
  "On-site (Lagos)",
  "On-site (Abuja)",
  "Hybrid",
];
const CONTRACT_TYPES = [
  "Permanent",
  "Fixed-term",
  "Probationary",
  "Contract",
  "Seasonal",
];
const PAY_FREQUENCIES = ["Monthly", "Bi-weekly", "Weekly", "Annually"];
const RELATIONSHIPS = [
  "Spouse",
  "Parent",
  "Sibling",
  "Child",
  "Relative",
  "Friend",
  "Other",
];

function StaffDetailPage() {
  const { id } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  const isNew = id === "new";

  const [activeTab, setActiveTab] = useState<"view" | "edit">(
    isNew || search.mode === "edit" ? "edit" : "view",
  );
  const [currentStep, setCurrentStep] = useState(0);
  const docUploads = useDocumentUploads();
  const seededDocsFor = useRef<string | null>(null);
  const [onLeaveLocal, setOnLeaveLocal] = useState<boolean | null>(null);

  const employeeQuery = useEmployee(isNew ? undefined : id);
  const organizationQuery = useEmployeeOrganization();
  const allEmployeesQuery = useEmployees();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const removeEmployee = useRemoveEmployee();
  const activateEmployee = useActivateEmployee();
  const suspendEmployee = useSuspendEmployee();
  const reactivateEmployee = useReactivateEmployee();
  const finalizeEmployee = useFinalizeEmployee();

  const methods = useForm<EmployeeFormData>({
    mode: "onSubmit",
    defaultValues: {
      firstName: "",
      middleName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      gender: "",
      nationality: "",
      residentialAddress: "",
      employeeNumber: "",
      department: "",
      departmentId: "",
      jobTitle: "",
      positionId: "",
      employeeType: "Full-time",
      workLocation: "Remote",
      grade: "G2",
      managerId: "",
      startDate: new Date().toISOString().slice(0, 10),
      workSchedule: "Standard (9am - 5pm)",
      isOnProbation: false,
      probationEndDate: "",
      contractType: "Permanent",
      contractEndDate: "",
      needsSystemAccount: true,
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      basicSalary: "",
      payFrequency: "Monthly",
      bankName: "",
      bankAccountNumber: "",
    },
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    trigger,
    formState: { isSubmitting },
  } = methods;

  const isOnProbation = watch("isOnProbation");
  const formValues = watch();

  // Populate data when editing or viewing
  useEffect(() => {
    if (employeeQuery.data && !isNew) {
      const emp = employeeQuery.data;

      // Seed previously uploaded documents once per employee record.
      if (seededDocsFor.current !== id) {
        seededDocsFor.current = id;
        docUploads.seed(emp.documents);
      }

      const deptName =
        typeof emp.department === "object"
          ? emp.department?.name
          : (emp.departmentName ?? emp.department ?? "");

      const deptId =
        typeof emp.department === "object"
          ? emp.department?.id
          : (emp.departmentId ?? "");

      const posTitle =
        emp.jobTitle ||
        (typeof emp.position === "object"
          ? (emp.position?.name ?? "")
          : (emp.positionName ?? emp.position ?? ""));

      const posId =
        typeof emp.position === "object"
          ? emp.position?.id
          : (emp.positionId ?? "");

      const mgrId =
        typeof emp.manager === "object"
          ? emp.manager?.id
          : (emp.managerId ?? "");

      reset({
        firstName: emp.firstName ?? "",
        middleName: emp.middleName ?? "",
        lastName: emp.lastName ?? "",
        email: emp.email ?? "",
        phone: emp.phone ?? emp.phoneNumber ?? "",
        dateOfBirth: emp.dateOfBirth ? emp.dateOfBirth.slice(0, 10) : "",
        gender: emp.gender ?? "",
        nationality: emp.nationality ?? "",
        residentialAddress: emp.residentialAddress ?? "",
        employeeNumber: emp.employeeNumber ?? "",
        department: deptName,
        departmentId: deptId,
        jobTitle: posTitle,
        positionId: posId,
        employeeType: emp.employeeType ?? emp.employmentType ?? "Full-time",
        workLocation: emp.workLocation ?? emp.location ?? "Remote",
        grade: emp.grade ?? "G2",
        managerId: mgrId,
        startDate: emp.startDate ? emp.startDate.slice(0, 10) : "",
        workSchedule: emp.workSchedule ?? "Standard (9am - 5pm)",
        isOnProbation: Boolean(emp.isOnProbation),
        probationEndDate: emp.probationEndDate
          ? emp.probationEndDate.slice(0, 10)
          : "",
        contractType: emp.contractType ?? "Permanent",
        contractEndDate: emp.contractEndDate
          ? emp.contractEndDate.slice(0, 10)
          : "",
        needsSystemAccount: emp.needsSystemAccount !== false,
        emergencyContactName: emp.emergencyContactName ?? "",
        emergencyContactRelationship: emp.emergencyContactRelationship ?? "",
        emergencyContactPhone: emp.emergencyContactPhone ?? "",
        basicSalary:
          emp.basicSalary !== undefined && emp.basicSalary !== null
            ? String(emp.basicSalary)
            : "",
        payFrequency: emp.payFrequency ?? "Monthly",
        bankName: emp.bankName ?? "",
        bankAccountNumber: emp.bankAccountNumber ?? "",
      });
    }
  }, [employeeQuery.data, isNew, reset, id, docUploads.seed]);

  const departmentsList = organizationQuery.data?.departments ?? [];

  const positionsList = organizationQuery.data?.positions ?? [];
  const selectedDepartmentId = watch("departmentId");
  const selectedDepartmentName = watch("department");

  const filteredPositions = selectedDepartmentId
    ? positionsList.filter((pos) => {
        const posDeptId = pos.departmentId ?? pos.department?.id;
        const posDeptName =
          (typeof pos.department === "object"
            ? pos.department?.name
            : pos.department) ?? pos.departmentName;
        if (posDeptId) return posDeptId === selectedDepartmentId;
        if (posDeptName && selectedDepartmentName) {
          return (
            String(posDeptName).toLowerCase() ===
            String(selectedDepartmentName).toLowerCase()
          );
        }
        return false;
      })
    : positionsList;

  const potentialManagers = (allEmployeesQuery.data ?? []).filter(
    (e) => isNew || e.id !== id,
  );

  const handleStepClick = async (targetIndex: number) => {
    if (targetIndex > currentStep) {
      if (currentStep === 0) {
        const valid = await trigger([
          "firstName",
          "lastName",
          "email",
          "phone",
        ]);
        if (!valid) {
          toast.error("Please fill in required personal fields first.");
          return;
        }
      }
    }
    setCurrentStep(targetIndex);
  };

  const handleContinue = async () => {
    if (currentStep === 0) {
      const valid = await trigger(["firstName", "lastName", "email", "phone"]);
      if (!valid) {
        toast.error("Please fill in all required personal fields.");
        return;
      }
    } else if (currentStep === 2) {
      const valid = await trigger(["startDate"]);
      if (!valid) return;
    }
    setCurrentStep((prev) => Math.min(FORM_STEPS.length - 1, prev + 1));
  };

  const handleFileUpload = (key: string, file: File) => {
    toast.promise(docUploads.upload(key, file), {
      loading: `Uploading ${file.name}...`,
      success: `Uploaded: ${file.name}`,
      error: (error) => extract_message(error as never),
    });
  };

  const handleRemoveDoc = (key: string) => {
    docUploads.remove(key);
  };

  const onSubmit = async (values: EmployeeFormData) => {
    if (docUploads.isUploading) {
      toast.error("Please wait for the document uploads to finish.");
      return;
    }
    if (docUploads.hasErrors) {
      toast.error(
        "Some documents failed to upload. Retry or remove them before saving.",
      );
      return;
    }

    try {
      const selectedDept = departmentsList.find(
        (d) => d.id === values.departmentId || d.name === values.department,
      );
      const selectedPos = positionsList.find(
        (p) =>
          p.id === values.positionId ||
          p.name === values.jobTitle ||
          p.title === values.jobTitle,
      );

      const deptName =
        selectedDept?.name ||
        values.department ||
        values.departmentId ||
        undefined;

      const jobTitle =
        values.jobTitle?.trim() ||
        selectedPos?.name ||
        selectedPos?.title ||
        values.positionId ||
        undefined;

      const payload: CreateEmployeeInput = {
        firstName: values.firstName.trim(),
        middleName: values.middleName?.trim() || undefined,
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        employeeNumber: values.employeeNumber?.trim() || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender || undefined,
        nationality: values.nationality?.trim() || undefined,
        residentialAddress: values.residentialAddress?.trim() || undefined,
        department: deptName,
        jobTitle,
        employeeType: values.employeeType || undefined,
        workLocation: values.workLocation || undefined,
        grade: values.grade || undefined,
        managerId: values.managerId?.trim() || undefined,
        startDate: values.startDate || undefined,
        workSchedule: values.workSchedule?.trim() || undefined,
        isOnProbation: Boolean(values.isOnProbation),
        probationEndDate: values.isOnProbation
          ? values.probationEndDate || undefined
          : undefined,
        contractType: values.contractType || undefined,
        contractEndDate: values.contractEndDate || undefined,
        needsSystemAccount: Boolean(values.needsSystemAccount),
        emergencyContactName: values.emergencyContactName?.trim() || undefined,
        emergencyContactRelationship:
          values.emergencyContactRelationship?.trim() || undefined,
        emergencyContactPhone:
          values.emergencyContactPhone?.trim() || undefined,
        basicSalary:
          values.basicSalary !== "" && values.basicSalary !== undefined
            ? Number(values.basicSalary)
            : undefined,
        payFrequency: values.payFrequency || undefined,
        bankName: values.bankName?.trim() || undefined,
        bankAccountNumber: values.bankAccountNumber?.trim() || undefined,
        documents: docUploads.documents.length
          ? docUploads.documents
          : undefined,
      };

      if (isNew) {
        await createEmployee.mutateAsync(payload);
        toast.success("Employee created successfully!");
        navigate({ to: "/hr/staffs" });
      } else {
        await updateEmployee.mutateAsync({ id, ...payload });
        toast.success("Employee profile updated successfully!");
        setActiveTab("view");
      }
    } catch (error: any) {
      toast.error(extract_message(error));
    }
  };

  const handleActivate = () => {
    if (confirm("Are you sure you want to activate this employee?")) {
      toast.promise(activateEmployee.mutateAsync(id), {
        loading: "Activating employee...",
        success: () => {
          employeeQuery.refetch();
          return "Employee activated";
        },
        error: (error) => extract_message(error as never),
      });
    }
  };

  const handleSuspend = () => {
    if (confirm("Are you sure you want to suspend this employee?")) {
      toast.promise(suspendEmployee.mutateAsync(id), {
        loading: "Suspending employee...",
        success: () => {
          employeeQuery.refetch();
          return "Employee suspended";
        },
        error: (error) => extract_message(error as never),
      });
    }
  };

  const handleReactivate = () => {
    if (confirm("Are you sure you want to reactivate this employee?")) {
      toast.promise(reactivateEmployee.mutateAsync(id), {
        loading: "Reactivating employee...",
        success: () => {
          employeeQuery.refetch();
          return "Employee reactivated";
        },
        error: (error) => extract_message(error as never),
      });
    }
  };

  const handleFinalize = () => {
    if (
      confirm("Are you sure you want to finalize this employee's employment?")
    ) {
      toast.promise(finalizeEmployee.mutateAsync(id), {
        loading: "Finalizing employment...",
        success: () => {
          employeeQuery.refetch();
          navigate({ to: "/hr/staffs" });
          return "Employment finalized";
        },
        error: (error) => extract_message(error as never),
      });
    }
  };

  const handleDeactivate = () => {
    if (confirm("Are you sure you want to deactivate this employee?")) {
      toast.promise(removeEmployee.mutateAsync(id), {
        loading: "Deactivating employee...",
        success: () => {
          navigate({ to: "/hr/staffs" });
          return "Employee deactivated";
        },
        error: (error) => extract_message(error as never),
      });
    }
  };

  const handleToggleLeave = () => {
    const current =
      onLeaveLocal !== null
        ? onLeaveLocal
        : Boolean(employeeQuery.data?.onLeave || employeeQuery.data?.isOnLeave);
    setOnLeaveLocal(!current);
    toast.success(
      !current ? "Marked employee as on leave" : "Marked employee as active",
    );
  };

  if (!isNew && employeeQuery.isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className=" text-base-content/80 font-medium">
          Loading employee details...
        </p>
      </div>
    );
  }

  if (!isNew && employeeQuery.isError) {
    return (
      <div className="card bg-base-100 border border-error/20 p-8 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="size-12 rounded-full bg-error/10 text-error flex items-center justify-center mx-auto">
          <AlertCircle className="size-6" />
        </div>
        <h3 className="font-semibold text-lg text-base-content">
          Unable to load employee
        </h3>
        <p className=" text-base-content/80">
          {extract_message(employeeQuery.error as any)}
        </p>
        <div className="flex justify-center gap-2 pt-2">
          <button
            onClick={() => employeeQuery.refetch()}
            className="btn btn-sm btn-primary "
          >
            Try Again
          </button>
          <Link to="/hr/staffs" className="btn btn-sm btn-ghost ">
            Back to Directory
          </Link>
        </div>
      </div>
    );
  }

  const emp = (employeeQuery.data || {}) as Record<string, any>;
  const fullName =
    emp.name ||
    emp.fullName ||
    `${emp.firstName || ""} ${emp.lastName || ""}`.trim() ||
    (isNew ? "New Employee" : "Employee Details");

  const effectiveOnLeave =
    onLeaveLocal !== null
      ? onLeaveLocal
      : Boolean(emp.onLeave || emp.isOnLeave);

  const effectiveStatus = effectiveOnLeave
    ? "On Leave"
    : emp.employmentStatus || emp.status || "Active";

  const isPending =
    isSubmitting ||
    createEmployee.isPending ||
    updateEmployee.isPending ||
    activateEmployee.isPending ||
    suspendEmployee.isPending ||
    reactivateEmployee.isPending ||
    finalizeEmployee.isPending;

  const currentDept =
    departmentsList.find(
      (d) =>
        d.id === formValues.departmentId || d.name === formValues.department,
    )?.name ||
    formValues.department ||
    "—";

  const selectedPosition = positionsList.find(
    (p) =>
      p.id === formValues.positionId ||
      p.name === formValues.jobTitle ||
      p.title === formValues.jobTitle,
  );
  const currentJob =
    formValues.jobTitle?.trim() ||
    selectedPosition?.name ||
    selectedPosition?.title ||
    "—";

  const currentManager =
    potentialManagers.find((m) => m.id === formValues.managerId)?.name ||
    formValues.managerId ||
    "—";

  return (
    <div className="space-y-6 pb-20 max-w-6xl mx-auto">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/hr/staffs"
          className="inline-flex items-center gap-2  font-medium text-base-content/80 hover:text-primary transition-colors"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Employees</span>
        </Link>

        {!isNew && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab("view")}
              className={`btn btn-xs rounded-lg font-medium px-3 ${
                activeTab === "view"
                  ? "btn-primary shadow-xs"
                  : "btn-ghost text-base-content/80"
              }`}
            >
              <Eye className="size-3.5 mr-1" /> Profile View
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`btn btn-xs rounded-lg font-medium px-3 ${
                activeTab === "edit"
                  ? "btn-primary shadow-xs"
                  : "btn-ghost text-base-content/80"
              }`}
            >
              <Pencil className="size-3.5 mr-1" /> Edit Profile
            </button>
          </div>
        )}
      </div>

      {/* ================================================================== */}
      {/* VIEW MODE: Dedicated Full Page Profile View                         */}
      {/* ================================================================== */}
      {!isNew && activeTab === "view" && (
        <div className="space-y-6">
          {/* Hero Profile Banner */}
          <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <EmployeeAvatar name={fullName} size="lg" />
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold text-base-content tracking-tight">
                      {fullName}
                    </h1>
                    <EmployeeStatusBadge status={effectiveStatus} />
                    {emp.employeeNumber && (
                      <span className="badge badge-sm badge-ghost font-mono text-[11px]">
                        ID: {emp.employeeNumber}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4  text-base-content/80">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Briefcase className="size-3.5 text-primary" />
                      {emp.jobTitle ||
                        (typeof emp.position === "object"
                          ? (emp.position?.name ?? emp.position?.title ?? "Staff")
                          : (emp.positionName ?? emp.position ?? "Staff"))}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <Building2 className="size-3.5 text-info" />
                      {typeof emp.department === "object"
                        ? emp.department?.name
                        : (emp.departmentName ?? emp.department ?? "General")}
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <MapPin className="size-3.5 text-warning" />
                      {emp.workLocation || emp.location || "Remote"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className="btn btn-sm btn-primary  gap-1.5 rounded-xl shadow-xs"
                >
                  <Pencil className="size-3.5" /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={handleToggleLeave}
                  className="btn btn-sm btn-outline border-base-300  rounded-xl"
                >
                  <Clock className="size-3.5" />
                  {effectiveOnLeave ? "Mark Returned" : "Mark On Leave"}
                </button>
                {(() => {
                  const rawStatus = String(
                    emp.employmentStatus || emp.status || "active",
                  ).toLowerCase();
                  const isActive = rawStatus === "active";
                  const isSuspended = rawStatus === "suspended";
                  const isExited = rawStatus === "exited";
                  const isNotice = rawStatus === "notice_period";
                  const isDraft = rawStatus === "draft";

                  return (
                    <>
                      {isDraft && (
                        <button
                          type="button"
                          onClick={handleActivate}
                          className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content rounded-xl"
                        >
                          <Play className="size-3.5" /> Activate
                        </button>
                      )}
                      {isActive && (
                        <>
                          <button
                            type="button"
                            onClick={handleSuspend}
                            className="btn btn-sm btn-outline border-warning text-warning hover:bg-warning hover:text-white rounded-xl"
                          >
                            <Pause className="size-3.5" /> Suspend
                          </button>
                          <button
                            type="button"
                            onClick={handleFinalize}
                            className="btn btn-sm btn-ghost text-error hover:bg-error/10 rounded-xl"
                          >
                            <UserX className="size-3.5" /> Finalize
                          </button>
                        </>
                      )}
                      {isSuspended && (
                        <>
                          <button
                            type="button"
                            onClick={handleReactivate}
                            className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content rounded-xl"
                          >
                            <Play className="size-3.5" /> Reactivate
                          </button>
                          <button
                            type="button"
                            onClick={handleFinalize}
                            className="btn btn-sm btn-ghost text-error hover:bg-error/10 rounded-xl"
                          >
                            <UserX className="size-3.5" /> Finalize
                          </button>
                        </>
                      )}
                      {isExited && (
                        <button
                          type="button"
                          onClick={handleReactivate}
                          className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content rounded-xl"
                        >
                          <Play className="size-3.5" /> Reactivate
                        </button>
                      )}
                      {isNotice && (
                        <>
                          <button
                            type="button"
                            onClick={handleActivate}
                            className="btn btn-sm btn-outline border-primary text-primary hover:bg-primary hover:text-primary-content rounded-xl"
                          >
                            <Play className="size-3.5" /> Activate
                          </button>
                          <button
                            type="button"
                            onClick={handleSuspend}
                            className="btn btn-sm btn-outline border-warning text-warning hover:bg-warning hover:text-white rounded-xl"
                          >
                            <Pause className="size-3.5" /> Suspend
                          </button>
                          <button
                            type="button"
                            onClick={handleFinalize}
                            className="btn btn-sm btn-ghost text-error hover:bg-error/10 rounded-xl"
                          >
                            <UserX className="size-3.5" /> Finalize
                          </button>
                        </>
                      )}
                    </>
                  );
                })()}
                <button
                  type="button"
                  onClick={handleDeactivate}
                  className="btn btn-sm btn-ghost text-error hover:bg-error/10  rounded-xl"
                >
                  <UserX className="size-3.5" /> Deactivate
                </button>
              </div>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="card bg-base-100 border border-base-200/80 p-4 rounded-2xl shadow-xs">
              <span className=" font-medium text-base-content/80">
                Employment Type
              </span>
              <p className="text-sm font-bold text-base-content mt-1">
                {emp.employeeType || emp.employmentType || "Full-time"}
              </p>
            </div>
            <div className="card bg-base-100 border border-base-200/80 p-4 rounded-2xl shadow-xs">
              <span className=" font-medium text-base-content/80">
                Grade Level
              </span>
              <p className="text-sm font-bold text-base-content mt-1">
                {emp.grade || "G2"}
              </p>
            </div>
            <div className="card bg-base-100 border border-base-200/80 p-4 rounded-2xl shadow-xs">
              <span className=" font-medium text-base-content/80">
                Monthly Base Salary
              </span>
              <p className="text-sm font-bold text-base-content mt-1">
                {formatSalary(
                  emp.basicSalary ? Number(emp.basicSalary) : undefined,
                )}
              </p>
            </div>
            <div className="card bg-base-100 border border-base-200/80 p-4 rounded-2xl shadow-xs">
              <span className=" font-medium text-base-content/80">
                Date of Joining
              </span>
              <p className="text-sm font-bold text-base-content mt-1 font-mono">
                {emp.startDate
                  ? emp.startDate.slice(0, 10)
                  : emp.createdAt?.slice(0, 10) || "—"}
              </p>
            </div>
          </div>

          {/* Detailed Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Personal & Contact */}
            <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-base-200">
                <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <User className="size-4" />
                </div>
                <h3 className="font-semibold text-sm text-base-content">
                  Personal & Contact Info
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 ">
                <div>
                  <span className="text-base-content/80">Full Legal Name</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {fullName}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Work Email</span>
                  <p className="font-semibold text-base-content mt-0.5 truncate">
                    {emp.email || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Phone Number</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.phone || emp.phoneNumber || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Date of Birth</span>
                  <p className="font-semibold text-base-content mt-0.5 font-mono">
                    {emp.dateOfBirth ? emp.dateOfBirth.slice(0, 10) : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Gender</span>
                  <p className="font-semibold text-base-content mt-0.5 capitalize">
                    {emp.gender || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Nationality</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.nationality || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-base-content/80">
                    Residential Address
                  </span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.residentialAddress || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Employment & Role */}
            <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-base-200">
                <div className="size-8 rounded-lg bg-info/10 text-info flex items-center justify-center">
                  <Building2 className="size-4" />
                </div>
                <h3 className="font-semibold text-sm text-base-content">
                  Role & Organization
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 ">
                <div>
                  <span className="text-base-content/80">Department</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {typeof emp.department === "object"
                      ? emp.department?.name
                      : (emp.departmentName ?? emp.department ?? "—")}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Job Title / Role</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.jobTitle ||
                      (typeof emp.position === "object"
                        ? (emp.position?.name ?? emp.position?.title ?? "—")
                        : (emp.positionName ?? emp.position ?? "—"))}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Reporting Line</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {typeof emp.manager === "object"
                      ? emp.manager?.name
                      : emp.manager || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Work Schedule</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.workSchedule || "Standard"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Start Date</span>
                  <p className="font-semibold text-base-content mt-0.5 font-mono">
                    {emp.startDate ? emp.startDate.slice(0, 10) : "—"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Work Location</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.workLocation || emp.location || "Remote"}
                  </p>
                </div>
              </div>
            </div>

            {/* 3. Contract & Probation */}
            <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-base-200">
                <div className="size-8 rounded-lg bg-warning/10 text-warning flex items-center justify-center">
                  <ShieldCheck className="size-4" />
                </div>
                <h3 className="font-semibold text-sm text-base-content">
                  Contract & Probation
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 ">
                <div>
                  <span className="text-base-content/80">Contract Type</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.contractType || "Permanent"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Contract Expiry</span>
                  <p className="font-semibold text-base-content mt-0.5 font-mono">
                    {emp.contractEndDate
                      ? emp.contractEndDate.slice(0, 10)
                      : "Indefinite"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Probation Status</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.isOnProbation ? (
                      <span className="text-warning font-bold">
                        On Probation
                      </span>
                    ) : (
                      <span className="text-success font-medium">
                        Confirmed
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">
                    Probation End Date
                  </span>
                  <p className="font-semibold text-base-content mt-0.5 font-mono">
                    {emp.probationEndDate
                      ? emp.probationEndDate.slice(0, 10)
                      : "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* 4. Emergency Contact */}
            <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-base-200">
                <div className="size-8 rounded-lg bg-error/10 text-error flex items-center justify-center">
                  <Phone className="size-4" />
                </div>
                <h3 className="font-semibold text-sm text-base-content">
                  Emergency Contact
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3 ">
                <div>
                  <span className="text-base-content/80">Contact Person</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.emergencyContactName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Relationship</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.emergencyContactRelationship || "—"}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-base-content/80">
                    Emergency Contact Number
                  </span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.emergencyContactPhone || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* 5. Compensation & Banking */}
            <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 space-y-4 md:col-span-2">
              <div className="flex items-center gap-2.5 pb-2 border-b border-base-200">
                <div className="size-8 rounded-lg bg-success/10 text-success flex items-center justify-center">
                  <CreditCard className="size-4" />
                </div>
                <h3 className="font-semibold text-sm text-base-content">
                  Compensation & Banking Details
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 ">
                <div>
                  <span className="text-base-content/80">Basic Salary</span>
                  <p className="font-bold text-sm text-base-content mt-0.5">
                    {formatSalary(
                      emp.basicSalary ? Number(emp.basicSalary) : undefined,
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">
                    Payment Frequency
                  </span>
                  <p className="font-semibold text-base-content mt-0.5 capitalize">
                    {emp.payFrequency || "Monthly"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">Bank Institution</span>
                  <p className="font-semibold text-base-content mt-0.5">
                    {emp.bankName || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-base-content/80">
                    Bank Account (NUBAN)
                  </span>
                  <p className="font-mono font-semibold text-base-content mt-0.5">
                    {emp.bankAccountNumber || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* EDIT / CREATE MODE: 6-Step Multi-Section Form (Kinova HR Layout)   */}
      {/* ================================================================== */}
      {(isNew || activeTab === "edit") && (
        <FormProvider {...methods}>
          <form
            id="employee-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6"
          >
            {/* Header: Kinova HR Eyebrow & Title */}
            <div className="space-y-1">
              <p className=" font-semibold uppercase tracking-[0.18em] text-primary">
                Employees › {isNew ? "Add Employee" : "Edit Employee"}
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
                {isNew ? "Create employee record" : `Edit profile: ${fullName}`}
              </h1>
              <p className=" sm:text-sm text-base-content/80">
                Mandatory fields, duplicate IDs and required documents are
                validated before saving.
              </p>
            </div>

            {/* Stepper Pills Navigation */}
            <div className="pt-2">
              <ol className="flex flex-wrap items-center gap-2">
                {FORM_STEPS.map((step, idx) => {
                  const isCompleted = idx < currentStep;
                  const isCurrent = idx === currentStep;
                  return (
                    <li
                      key={step}
                      onClick={() => handleStepClick(idx)}
                      className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5  cursor-pointer select-none transition-all ${
                        isCurrent
                          ? "border-primary bg-primary text-primary-content font-semibold shadow-xs"
                          : isCompleted
                            ? "border-emerald-500/80 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium hover:border-emerald-500/80"
                            : "border-base-300 bg-base-100 text-base-content/80 hover:border-base-content/30 hover:text-base-content"
                      }`}
                    >
                      <span
                        className={`size-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isCurrent
                            ? "bg-primary-content text-primary"
                            : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-base-200 text-base-content/80"
                        }`}
                      >
                        {isCompleted ? "✓" : idx + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* STEP 0: Personal */}
            {currentStep === 0 && (
              <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 sm:p-7 space-y-5 animate-in fade-in duration-300">
                <div className="border-b border-base-200 pb-3">
                  <h3 className="font-semibold text-base text-base-content">
                    Personal Details
                  </h3>
                  <p className=" text-base-content/80">
                    Primary identity, contact details, and demographic
                    background
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SimpleInput
                      label="First Name *"
                      placeholder="e.g. Adebayo"
                      {...register("firstName", {
                        required: "First name is required",
                      })}
                    />
                    <SimpleInput
                      label="Middle Name"
                      placeholder="e.g. Chukwu"
                      {...register("middleName")}
                    />
                    <SimpleInput
                      label="Last Name *"
                      placeholder="e.g. Adeleke"
                      {...register("lastName", {
                        required: "Last name is required",
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SimpleInput
                      label="Work Email Address *"
                      type="email"
                      placeholder="adebayo.adeleke@company.com"
                      {...register("email", {
                        required: "Work email is required",
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                    />

                    <Controller
                      name="phone"
                      control={control}
                      rules={{ required: "Phone number is required" }}
                      render={({ field, fieldState }) => (
                        <SimplePhoneInput
                          label="Phone Number *"
                          value={field.value ?? ""}
                          onChange={(_val, rawValue) =>
                            field.onChange(rawValue ?? "")
                          }
                          placeholder="+234 800 000 0000"
                          error={fieldState.error?.message}
                        />
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SimpleInput
                      label="Date of Birth"
                      type="date"
                      {...register("dateOfBirth")}
                    />

                    <LocalSelect label="Gender" {...register("gender")}>
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer_not_to_say">
                        Prefer not to say
                      </option>
                    </LocalSelect>

                    <SimpleInput
                      label="Nationality"
                      placeholder="e.g. Nigerian"
                      {...register("nationality")}
                    />
                  </div>

                  <SimpleTextArea
                    label="Residential Address"
                    placeholder="Residential street address, city, state..."
                    rows={2}
                    {...register("residentialAddress")}
                  />
                </div>
              </div>
            )}

            {/* STEP 1: Emergency contact */}
            {currentStep === 1 && (
              <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 sm:p-7 space-y-5 animate-in fade-in duration-300">
                <div className="border-b border-base-200 pb-3">
                  <h3 className="font-semibold text-base text-base-content">
                    Emergency Contact
                  </h3>
                  <p className=" text-base-content/80">
                    Designated emergency point of contact for safety &
                    compliance
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <SimpleInput
                    label="Contact Full Name"
                    placeholder="e.g. Mary Adeleke"
                    {...register("emergencyContactName")}
                  />
                  <LocalSelect
                    label="Relationship"
                    {...register("emergencyContactRelationship")}
                  >
                    <option value="">Select Relationship</option>
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel} value={rel}>
                        {rel}
                      </option>
                    ))}
                  </LocalSelect>
                  <SimpleInput
                    label="Emergency Phone Number"
                    placeholder="+234 800 000 0000"
                    {...register("emergencyContactPhone")}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: Employment */}
            {currentStep === 2 && (
              <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 sm:p-7 space-y-5 animate-in fade-in duration-300">
                <div className="border-b border-base-200 pb-3">
                  <h3 className="font-semibold text-base text-base-content">
                    Employment & Organizational Details
                  </h3>
                  <p className=" text-base-content/80">
                    Role assignment, department affiliation, reporting line, and
                    status
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SimpleInput
                      label="Employee Number / ID"
                      placeholder="e.g. EMP-0012"
                      {...register("employeeNumber")}
                    />

                    <Controller
                      control={methods.control}
                      name="departmentId"
                      render={({ field }) => (
                        <LocalSelect
                          label="Department"
                          value={field.value ?? ""}
                          disabled={organizationQuery.isLoading}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            const sel = departmentsList.find(
                              (d) => (d.id || d.name) === value,
                            );
                            methods.setValue("department", sel?.name ?? "");
                            if (methods.getValues("positionId")) {
                              methods.setValue("jobTitle", "");
                            }
                            methods.setValue("positionId", "");
                          }}
                        >
                          <option value="">
                            {organizationQuery.isLoading
                              ? "Loading departments..."
                              : "Select Department"}
                          </option>
                          {departmentsList.map((dept) => (
                            <option
                              key={dept.id || dept.name}
                              value={dept.id || dept.name}
                            >
                              {dept.name}
                            </option>
                          ))}
                        </LocalSelect>
                      )}
                    />

                    <Controller
                      control={methods.control}
                      name="positionId"
                      render={({ field }) => (
                        <LocalSelect
                          label="Position / Role"
                          value={field.value ?? ""}
                          disabled={
                            organizationQuery.isLoading ||
                            positionsList.length === 0 ||
                            (Boolean(selectedDepartmentId) &&
                              filteredPositions.length === 0)
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            const sel = filteredPositions.find(
                              (p) => (p.id || p.name || p.title) === value,
                            );
                            methods.setValue(
                              "jobTitle",
                              sel?.name ?? sel?.title ?? "",
                            );
                          }}
                        >
                          <option value="">
                            {organizationQuery.isLoading
                              ? "Loading positions..."
                              : positionsList.length === 0
                                ? "No positions available"
                                : selectedDepartmentId &&
                                    filteredPositions.length === 0
                                  ? "No positions in this department"
                                  : "Select Position"}
                          </option>
                          {filteredPositions.map((pos) => {
                            const posLabel =
                              pos.name ?? pos.title ?? "Untitled Position";
                            return (
                              <option
                                key={pos.id || posLabel}
                                value={pos.id || posLabel}
                              >
                                {posLabel}
                              </option>
                            );
                          })}
                        </LocalSelect>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SimpleInput
                      label="Job Title"
                      placeholder="e.g. Senior Frontend Engineer"
                      {...register("jobTitle")}
                    />

                    <LocalSelect
                      label="Employment Type"
                      {...register("employeeType")}
                    >
                      {EMPLOYMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </LocalSelect>

                    <LocalSelect
                      label="Work Location"
                      {...register("workLocation")}
                    >
                      {WORK_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <LocalSelect label="Grade / Level" {...register("grade")}>
                      {DEFAULT_GRADES.map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </LocalSelect>

                    <Controller
                      control={methods.control}
                      name="managerId"
                      render={({ field }) => (
                        <SimpleSelect<EmployeeRecord>
                          route="/employees"
                          value={field.value}
                          onChange={field.onChange}
                          label="Reporting Manager / Supervisor"
                          render={(mgr, index) => {
                            const name =
                              mgr.name ||
                              `${mgr.firstName ?? ""} ${mgr.lastName ?? ""}`.trim() ||
                              mgr.email;
                            return (
                              <>
                                {index === 0 && (
                                  <option value="">None / Self</option>
                                )}
                                <option key={mgr.id} value={mgr.id}>
                                  {name} ({mgr.departmentName ?? "Staff"})
                                </option>
                              </>
                            );
                          }}
                        />
                      )}
                    />

                    <SimpleInput
                      label="Start Date *"
                      type="date"
                      {...register("startDate", {
                        required: "Start date is required",
                      })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <SimpleInput
                      label="Work Schedule"
                      placeholder="e.g. Standard (9am - 5pm)"
                      {...register("workSchedule")}
                    />

                    <LocalSelect
                      label="Contract Type"
                      {...register("contractType")}
                    >
                      {CONTRACT_TYPES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </LocalSelect>

                    <SimpleInput
                      label="Contract End Date"
                      type="date"
                      {...register("contractEndDate")}
                    />
                  </div>

                  {/* Toggles */}
                  <div className="pt-2 border-t border-base-200/80 space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        {...register("isOnProbation")}
                      />
                      <span className=" font-medium text-base-content">
                        Staff member is on probation
                      </span>
                    </label>

                    {isOnProbation && (
                      <div className="max-w-xs pl-7">
                        <SimpleInput
                          label="Probation End Date"
                          type="date"
                          {...register("probationEndDate")}
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-primary checkbox-sm"
                        {...register("needsSystemAccount")}
                      />
                      <span className=" font-medium text-base-content">
                        Create CRM login account with this email address
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Compensation */}
            {currentStep === 3 && (
              <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 sm:p-7 space-y-5 animate-in fade-in duration-300">
                {/* Kinova HR Lock Banner */}
                <div className="flex items-center gap-2.5 rounded-xl bg-warning/15 border border-warning/20 p-3.5  text-warning-content font-medium">
                  <Lock className="size-4 shrink-0 text-warning" />
                  <span>
                    Restricted: visible only to users with compensation
                    permission. Changes are audited.
                  </span>
                </div>

                <div className="border-b border-base-200 pb-3">
                  <h3 className="font-semibold text-base text-base-content">
                    Compensation & Banking Details
                  </h3>
                  <p className=" text-base-content/80">
                    Payroll salary configuration and disbursement banking
                    credentials
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SimpleInput
                      label="Basic Salary (₦)"
                      type="number"
                      step="any"
                      placeholder="e.g. 500000"
                      {...register("basicSalary")}
                    />

                    <LocalSelect
                      label="Pay Frequency"
                      {...register("payFrequency")}
                    >
                      {PAY_FREQUENCIES.map((freq) => (
                        <option key={freq} value={freq}>
                          {freq}
                        </option>
                      ))}
                    </LocalSelect>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SimpleInput
                      label="Bank Name"
                      placeholder="e.g. Access Bank / Zenith Bank"
                      {...register("bankName")}
                    />

                    <SimpleInput
                      label="Bank Account Number"
                      placeholder="10-digit NUBAN account number"
                      maxLength={10}
                      {...register("bankAccountNumber")}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Documents */}
            {currentStep === 4 && (
              <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl p-6 sm:p-7 space-y-5 animate-in fade-in duration-300">
                <div className="border-b border-base-200 pb-3">
                  <h3 className="font-semibold text-base text-base-content">
                    Documents & Credentials
                  </h3>
                  <p className=" text-base-content/80">
                    Upload employee verification documents, contracts, and
                    certifications
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {DOCUMENT_ITEMS.map((doc) => (
                    <div
                      key={doc.key}
                      className="rounded-2xl border border-base-300 bg-base-100 p-4 min-w-0"
                    >
                      <div className="mb-3 flex items-start gap-2.5">
                        <div className="size-8 rounded-xl flex shrink-0 items-center justify-center bg-primary/10 text-primary">
                          <FileText className="size-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-semibold text-base-content">
                            {doc.title}
                          </h4>
                          <p className="text-sm text-base-content/80 mt-0.5 line-clamp-2">
                            {doc.description}
                          </p>
                        </div>
                      </div>
                      <DocUploader
                        doc={
                          docUploads.entries[doc.key]
                            ? {
                                name: docUploads.entries[doc.key].fileName,
                                size:
                                  docUploads.entries[doc.key].status ===
                                  "uploading"
                                    ? "Uploading…"
                                    : docUploads.entries[doc.key].status ===
                                        "error"
                                      ? "Upload failed — choose the file again"
                                      : docUploads.entries[doc.key].size,
                              }
                            : undefined
                        }
                        onNewFile={(file) => handleFileUpload(doc.key, file)}
                        onRemoveDoc={() => handleRemoveDoc(doc.key)}
                        disabled={
                          docUploads.entries[doc.key]?.status === "uploading"
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 5: Review */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Kinova HR Checklist */}
                <div className="card bg-base-100 border border-base-200/80 p-5 rounded-2xl shadow-xs">
                  <h4 className=" font-bold uppercase tracking-wider text-base-content/80 mb-3">
                    Pre-Submission Readiness Checklist
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 ">
                    <li className="flex items-center gap-2 text-base-content/80">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span>Mandatory fields complete</span>
                    </li>
                    <li className="flex items-center gap-2 text-base-content/80">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span>No duplicate employee ID</span>
                    </li>
                    <li className="flex items-center gap-2 text-base-content/80">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span>Department & position assigned</span>
                    </li>
                    <li className="flex items-center gap-2 text-base-content/80">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span>Audit event will be created</span>
                    </li>
                    <li className="flex items-center gap-2 text-base-content/80 sm:col-span-2">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      <span>Notifications: HR, Manager, IT</span>
                    </li>
                  </ul>
                </div>

                {/* Review Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                  {/* Personal Summary */}
                  <div className="card bg-base-100 border border-base-200/80 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-base-200">
                      <span className="font-semibold text-sm text-base-content">
                        Personal Information
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(0)}
                        className="btn btn-ghost btn-xs text-primary font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <p>
                        <span className="text-base-content/80">Full Name:</span>{" "}
                        <span className="font-semibold">
                          {formValues.firstName} {formValues.middleName || ""}{" "}
                          {formValues.lastName}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">Email:</span>{" "}
                        <span className="font-semibold">
                          {formValues.email || "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">Phone:</span>{" "}
                        <span className="font-semibold">
                          {formValues.phone || "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          Date of Birth:
                        </span>{" "}
                        <span className="font-semibold font-mono">
                          {formValues.dateOfBirth || "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          Nationality:
                        </span>{" "}
                        <span className="font-semibold">
                          {formValues.nationality || "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">Address:</span>{" "}
                        <span className="font-semibold">
                          {formValues.residentialAddress || "—"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Emergency Contact Summary */}
                  <div className="card bg-base-100 border border-base-200/80 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-base-200">
                      <span className="font-semibold text-sm text-base-content">
                        Emergency Contact
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="btn btn-ghost btn-xs text-primary font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <p>
                        <span className="text-base-content/80">
                          Contact Person:
                        </span>{" "}
                        <span className="font-semibold">
                          {formValues.emergencyContactName || "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          Relationship:
                        </span>{" "}
                        <span className="font-semibold">
                          {formValues.emergencyContactRelationship || "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          Emergency Phone:
                        </span>{" "}
                        <span className="font-semibold">
                          {formValues.emergencyContactPhone || "—"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Employment Summary */}
                  <div className="card bg-base-100 border border-base-200/80 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-base-200">
                      <span className="font-semibold text-sm text-base-content">
                        Employment & Role
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="btn btn-ghost btn-xs text-primary font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <p>
                        <span className="text-base-content/80">
                          Employee ID:
                        </span>{" "}
                        <span className="font-semibold font-mono">
                          {formValues.employeeNumber || "Auto-assigned"}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          Department:
                        </span>{" "}
                        <span className="font-semibold">{currentDept}</span>
                      </p>
                      <p>
                        <span className="text-base-content/80">Job Title:</span>{" "}
                        <span className="font-semibold">{currentJob}</span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          Type / Status:
                        </span>{" "}
                        <span className="font-semibold">
                          {formValues.employeeType}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          Location / Grade:
                        </span>{" "}
                        <span className="font-semibold">
                          {formValues.workLocation} · {formValues.grade}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">Manager:</span>{" "}
                        <span className="font-semibold">{currentManager}</span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          Start Date:
                        </span>{" "}
                        <span className="font-semibold font-mono">
                          {formValues.startDate || "—"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Compensation & Documents Summary */}
                  <div className="card bg-base-100 border border-base-200/80 p-5 rounded-2xl shadow-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-base-200">
                      <span className="font-semibold text-sm text-base-content">
                        Compensation & Documents
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="btn btn-ghost btn-xs text-primary font-medium"
                      >
                        Edit
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      <p>
                        <span className="text-base-content/80">
                          Basic Salary:
                        </span>{" "}
                        <span className="font-bold text-sm text-base-content">
                          {formatSalary(
                            formValues.basicSalary
                              ? Number(formValues.basicSalary)
                              : undefined,
                          )}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          Pay Frequency:
                        </span>{" "}
                        <span className="font-semibold capitalize">
                          {formValues.payFrequency}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">Bank:</span>{" "}
                        <span className="font-semibold">
                          {formValues.bankName || "—"}
                        </span>
                      </p>
                      <p>
                        <span className="text-base-content/80">
                          NUBAN Account:
                        </span>{" "}
                        <span className="font-mono font-semibold">
                          {formValues.bankAccountNumber || "—"}
                        </span>
                      </p>
                      <p className="pt-1">
                        <span className="text-base-content/80">
                          Attached Files:
                        </span>{" "}
                        <span className="font-semibold text-emerald-600">
                          {docUploads.documents.length} document(s) uploaded
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Stepper Navigation Controls */}
            <div className="mt-8 flex items-center justify-between pt-5 border-t border-base-200">
              {currentStep === 0 ? (
                <button
                  type="button"
                  onClick={() =>
                    !isNew
                      ? setActiveTab("view")
                      : navigate({ to: "/hr/staffs" })
                  }
                  className="btn btn-ghost border border-base-300 rounded-xl px-5  font-medium"
                >
                  Cancel
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    setCurrentStep((prev) => Math.max(0, prev - 1))
                  }
                  className="btn btn-outline border-base-300 rounded-xl px-5  font-medium gap-1.5"
                >
                  <ArrowLeft className="size-3.5" /> Back
                </button>
              )}

              {currentStep < FORM_STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={handleContinue}
                  className="btn btn-primary rounded-xl px-6  font-semibold gap-1.5 shadow-sm"
                >
                  <span>Continue</span>
                  <ArrowRight className="size-3.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isPending}
                  className="btn btn-primary rounded-xl px-7  font-semibold gap-2 shadow-sm"
                >
                  {isPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}
                  <span>{isNew ? "Create Employee" : "Save Changes"}</span>
                </button>
              )}
            </div>
          </form>
        </FormProvider>
      )}
    </div>
  );
}

export default StaffDetailPage;
