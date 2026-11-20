import { useEffect } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import {
  ArrowLeft,
  Save,
  User,
  Phone,
  CreditCard,
  Building2,
  Calendar,
  AlertCircle,
  Loader2,
} from "lucide-react";
import SimpleInput from "@/components/inputs/SimpleInput";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";
import LocalSelect from "@/components/inputs/LocalSelect";
import SimpleTextArea from "@/components/inputs/SimpleTextArea";
import {
  useCreateEmployee,
  useEmployee,
  useEmployees,
  useEmployeeOrganization,
  useUpdateEmployee,
  type CreateEmployeeInput,
} from "@/api/employeesApi";
import { extract_message } from "@/helpers/auth";

export const Route = createFileRoute("/hr/staffs/$id")({
  component: StaffFormPage,
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

  employeeNumber?: string;
  department?: string;
  departmentId?: string;
  jobTitle?: string;
  positionId?: string;
  employeeType?: string;
  employmentStatus?: string;
  workLocation?: string;
  grade?: string;
  managerId?: string;
  startDate?: string;
  workSchedule?: string;

  isOnProbation?: boolean;
  probationEndDate?: string;
  contractType?: string;
  contractEndDate?: string;
  needsSystemAccount?: boolean;

  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;

  basicSalary?: number | string;
  payFrequency?: string;
  bankName?: string;
  bankAccountNumber?: string;
}

const DEFAULT_DEPARTMENTS = [
  "Sales",
  "Engineering",
  "Finance",
  "Operations",
  "Marketing",
  "Customer Success",
  "HR",
  "Executive",
  "Legal",
];

const DEFAULT_GRADES = ["G1", "G2", "G3", "G4", "G5", "G6", "G7"];
const EMPLOYMENT_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Intern",
  "Casual",
];
const EMPLOYMENT_STATUSES = [
  { value: "active", label: "Active" },
  { value: "probation", label: "Probation" },
  { value: "suspended", label: "Suspended" },
  { value: "notice", label: "Notice Period" },
  { value: "inactive", label: "Inactive" },
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

function StaffFormPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const isNew = id === "new";

  const employeeQuery = useEmployee(isNew ? undefined : id);
  const organizationQuery = useEmployeeOrganization();
  const allEmployeesQuery = useEmployees();

  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();

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
      employmentStatus: "active",
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
    formState: { isSubmitting },
  } = methods;

  const isOnProbation = watch("isOnProbation");

  // Populate data when editing
  useEffect(() => {
    if (employeeQuery.data && !isNew) {
      const emp = employeeQuery.data;

      const deptName =
        typeof emp.department === "object"
          ? emp.department?.name
          : (emp.departmentName ?? emp.department ?? "");

      const deptId =
        typeof emp.department === "object"
          ? emp.department?.id
          : (emp.departmentId ?? "");

      const posTitle =
        typeof emp.position === "object"
          ? emp.position?.name
          : (emp.positionName ?? emp.jobTitle ?? emp.position ?? "");

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
        employmentStatus: emp.employmentStatus ?? emp.status ?? "active",
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
        needsSystemAccount:
          emp.needsSystemAccount !== undefined
            ? Boolean(emp.needsSystemAccount)
            : true,
        emergencyContactName: emp.emergencyContactName ?? "",
        emergencyContactRelationship: emp.emergencyContactRelationship ?? "",
        emergencyContactPhone: emp.emergencyContactPhone ?? "",
        basicSalary:
          emp.basicSalary !== undefined ? String(emp.basicSalary) : "",
        payFrequency: emp.payFrequency ?? "Monthly",
        bankName: emp.bankName ?? "",
        bankAccountNumber: emp.bankAccountNumber ?? "",
      });
    }
  }, [employeeQuery.data, isNew, reset]);

  const departmentsList =
    organizationQuery.data?.departments &&
    organizationQuery.data.departments.length > 0
      ? organizationQuery.data.departments
      : DEFAULT_DEPARTMENTS.map((name) => ({ id: name, name }));

  const positionsList =
    organizationQuery.data?.positions &&
    organizationQuery.data.positions.length > 0
      ? organizationQuery.data.positions
      : [];

  const potentialManagers = (allEmployeesQuery.data ?? []).filter(
    (e) => isNew || e.id !== id,
  );

  const onSubmit = async (values: EmployeeFormData) => {
    try {
      const selectedDept = departmentsList.find(
        (d) => d.id === values.departmentId || d.name === values.department,
      );
      const selectedPos = positionsList.find(
        (p) => p.id === values.positionId || p.name === values.jobTitle,
      );

      const deptName =
        selectedDept?.name ||
        values.department ||
        values.departmentId ||
        undefined;
      const deptId = selectedDept?.id || values.departmentId || undefined;

      const jobTitle =
        selectedPos?.name || values.jobTitle || values.positionId || undefined;
      const positionId = selectedPos?.id || values.positionId || undefined;

      const payload: CreateEmployeeInput = {
        firstName: values.firstName.trim(),
        middleName: values.middleName?.trim() || undefined,
        lastName: values.lastName.trim(),
        email: values.email.trim(),
        phone: values.phone?.trim() || undefined,
        phoneNumber: values.phone?.trim() || undefined,
        employeeNumber: values.employeeNumber?.trim() || undefined,
        dateOfBirth: values.dateOfBirth || undefined,
        gender: values.gender || undefined,
        nationality: values.nationality?.trim() || undefined,
        residentialAddress: values.residentialAddress?.trim() || undefined,
        department: deptName,
        departmentId: deptId,
        jobTitle,
        positionId,
        employeeType: values.employeeType || undefined,
        employmentType: values.employeeType || undefined,
        employmentStatus: values.employmentStatus || undefined,
        status: values.employmentStatus || undefined,
        workLocation: values.workLocation || undefined,
        location: values.workLocation || undefined,
        grade: values.grade || undefined,
        managerId: values.managerId || undefined,
        startDate: values.startDate || undefined,
        workSchedule: values.workSchedule || undefined,
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
        basicSalary: values.basicSalary
          ? Number(values.basicSalary)
          : undefined,
        payFrequency: values.payFrequency || undefined,
        bankName: values.bankName?.trim() || undefined,
        bankAccountNumber: values.bankAccountNumber?.trim() || undefined,
      };

      if (isNew) {
        await createEmployee.mutateAsync(payload);
        toast.success("Employee created successfully!");
      } else {
        await updateEmployee.mutateAsync({ id, ...payload });
        toast.success("Employee profile updated successfully!");
      }

      navigate({ to: "/hr/staffs" });
    } catch (error: any) {
      toast.error(extract_message(error));
    }
  };

  const isPending =
    isSubmitting || createEmployee.isPending || updateEmployee.isPending;

  if (!isNew && employeeQuery.isLoading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="size-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-base-content/60">
          Loading employee details...
        </p>
      </div>
    );
  }

  if (!isNew && employeeQuery.isError) {
    return (
      <div className="card bg-base-100 border border-error/30 p-12 text-center space-y-4 max-w-lg mx-auto mt-12 rounded-2xl">
        <AlertCircle className="size-12 mx-auto text-error" />
        <h3 className="font-bold text-lg text-base-content">
          Employee Not Found
        </h3>
        <p className="text-sm text-base-content/60">
          {extract_message(employeeQuery.error as never) ||
            "Unable to retrieve the requested employee record."}
        </p>
        <Link
          to="/hr/staffs"
          className="btn btn-sm btn-primary rounded-xl px-4 inline-flex items-center gap-1.5 mx-auto"
        >
          <ArrowLeft className="size-4" />
          <span>Back to Staff Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 max-w-5xl mx-auto">
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-base-200 pb-5">
        <div className="space-y-1">
          <Link
            to="/hr/staffs"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-base-content/60 hover:text-primary transition-colors mb-1"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to Staff Directory</span>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">
            {isNew
              ? "Add New Employee"
              : `Edit Employee · ${watch("firstName")} ${watch("lastName")}`.trim()}
          </h1>
          <p className="text-xs text-base-content/60">
            {isNew
              ? "Register a new employee profile, department allocation, and contract terms."
              : `Updating employee details for ${id}. All changes sync to directory & payroll.`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/hr/staffs"
            className="btn btn-sm btn-ghost border border-base-300 rounded-xl text-xs font-medium"
          >
            Cancel
          </Link>
          <button
            type="submit"
            form="employee-form"
            disabled={isPending}
            className="btn btn-sm btn-primary rounded-xl text-xs font-semibold gap-1.5 shadow-sm"
          >
            {isPending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Save className="size-3.5" />
            )}
            <span>{isNew ? "Create Employee" : "Save Changes"}</span>
          </button>
        </div>
      </div>

      <FormProvider {...methods}>
        <form
          id="employee-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-8"
        >
          {/* Section 1: Personal Details */}
          <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-base-200 bg-base-200/30 flex items-center gap-3">
              <div className="size-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-semibold">
                <User className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-base-content">
                  Personal Information
                </h3>
                <p className="text-xs text-base-content/60">
                  Primary identity, contact details, and demographic background
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
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
                  <option value="prefer_not_to_say">Prefer not to say</option>
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

          {/* Section 2: Employment & Organizational Details */}
          <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-base-200 bg-base-200/30 flex items-center gap-3">
              <div className="size-9 rounded-xl bg-info/10 text-info flex items-center justify-center font-semibold">
                <Building2 className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-base-content">
                  Employment & Organizational Details
                </h3>
                <p className="text-xs text-base-content/60">
                  Role assignment, department affiliation, reporting line, and
                  status
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SimpleInput
                  label="Employee Number / ID"
                  placeholder="e.g. EMP-0012"
                  {...register("employeeNumber")}
                />

                <LocalSelect
                  label="Department"
                  {...register("departmentId", {
                    onChange: (e) => {
                      const sel = departmentsList.find(
                        (d) => d.id === e.target.value,
                      );
                      if (sel) methods.setValue("department", sel.name);
                    },
                  })}
                >
                  <option value="">Select Department</option>
                  {departmentsList.map((dept) => (
                    <option
                      key={dept.id || dept.name}
                      value={dept.id || dept.name}
                    >
                      {dept.name}
                    </option>
                  ))}
                </LocalSelect>

                {positionsList.length > 0 ? (
                  <LocalSelect
                    label="Position / Role"
                    {...register("positionId", {
                      onChange: (e) => {
                        const sel = positionsList.find(
                          (p) => p.id === e.target.value,
                        );
                        if (sel) methods.setValue("jobTitle", sel.name);
                      },
                    })}
                  >
                    <option value="">Select Position</option>
                    {positionsList.map((pos) => (
                      <option key={pos.id} value={pos.id}>
                        {pos.name}
                      </option>
                    ))}
                  </LocalSelect>
                ) : (
                  <SimpleInput
                    label="Job Title"
                    placeholder="e.g. Senior Frontend Engineer"
                    {...register("jobTitle")}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  label="Employment Status"
                  {...register("employmentStatus")}
                >
                  {EMPLOYMENT_STATUSES.map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
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

                <LocalSelect
                  label="Reporting Manager / Supervisor"
                  {...register("managerId")}
                >
                  <option value="">None / Self</option>
                  {potentialManagers.map((mgr) => {
                    const name =
                      mgr.name ??
                      `${mgr.firstName ?? ""} ${mgr.lastName ?? ""}`.trim() ??
                      mgr.email;
                    return (
                      <option key={mgr.id} value={mgr.id}>
                        {name} ({mgr.departmentName ?? "Staff"})
                      </option>
                    );
                  })}
                </LocalSelect>

                <SimpleInput
                  label="Start / Joining Date"
                  type="date"
                  {...register("startDate")}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SimpleInput
                  label="Work Schedule"
                  placeholder="e.g. Standard (9am - 5pm)"
                  {...register("workSchedule")}
                />

                <div className="flex items-center gap-3 pt-6">
                  <input
                    type="checkbox"
                    id="needsSystemAccount"
                    className="checkbox checkbox-primary"
                    {...register("needsSystemAccount")}
                  />
                  <label
                    htmlFor="needsSystemAccount"
                    className="text-xs font-medium text-base-content cursor-pointer"
                  >
                    Provision ERP & CRM system login account for this employee
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Contract & Probation Terms */}
          <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-base-200 bg-base-200/30 flex items-center gap-3">
              <div className="size-9 rounded-xl bg-warning/10 text-warning flex items-center justify-center font-semibold">
                <Calendar className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-base-content">
                  Contract & Probation Terms
                </h3>
                <p className="text-xs text-base-content/60">
                  Contract timelines, probation monitoring, and renewal details
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <LocalSelect
                  label="Contract Type"
                  {...register("contractType")}
                >
                  {CONTRACT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </LocalSelect>

                <SimpleInput
                  label="Contract End Date (If applicable)"
                  type="date"
                  {...register("contractEndDate")}
                />
              </div>

              <div className="border border-base-200 rounded-xl p-4 bg-base-200/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-base-content">
                      Probation Period
                    </p>
                    <p className="text-xs text-base-content/60">
                      Enable if this hire is currently undergoing probationary
                      review.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    className="toggle toggle-warning"
                    {...register("isOnProbation")}
                  />
                </div>

                {isOnProbation && (
                  <div className="pt-2 max-w-sm">
                    <SimpleInput
                      label="Probation End Date"
                      type="date"
                      {...register("probationEndDate")}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Emergency Contact */}
          <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-base-200 bg-base-200/30 flex items-center gap-3">
              <div className="size-9 rounded-xl bg-error/10 text-error flex items-center justify-center font-semibold">
                <Phone className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-base-content">
                  Emergency Contact
                </h3>
                <p className="text-xs text-base-content/60">
                  Designated emergency point of contact for safety & compliance
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SimpleInput
                  label="Contact Full Name"
                  placeholder="e.g. Mary Adeleke"
                  {...register("emergencyContactName")}
                />
                <SimpleInput
                  label="Relationship"
                  placeholder="e.g. Spouse / Sister"
                  {...register("emergencyContactRelationship")}
                />
                <SimpleInput
                  label="Emergency Phone"
                  placeholder="+234 800 000 0000"
                  {...register("emergencyContactPhone")}
                />
              </div>
            </div>
          </div>

          {/* Section 5: Compensation & Bank Details */}
          <div className="card bg-base-100 border border-base-200/80 shadow-xs rounded-2xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-base-200 bg-base-200/30 flex items-center gap-3">
              <div className="size-9 rounded-xl bg-success/10 text-success flex items-center justify-center font-semibold">
                <CreditCard className="size-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-base-content">
                  Compensation & Banking Details
                </h3>
                <p className="text-xs text-base-content/60">
                  Payroll salary configuration and disbursement banking
                  credentials
                </p>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
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

          {/* Bottom Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Link
              to="/hr/staffs"
              className="btn btn-ghost border border-base-300 rounded-xl px-5 text-xs font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary rounded-xl px-6 text-xs font-semibold gap-1.5 shadow-sm"
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              <span>{isNew ? "Create Employee" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
export default StaffFormPage;
