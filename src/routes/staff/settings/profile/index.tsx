import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import { Info } from "lucide-react";
import {
  extractEmployeePhoto,
  useMyEmployeeProfile,
  useUpdateMyEmployeeProfile,
  useUploadMyEmployeePhoto,
  type MyEmployeeProfileUpdate,
} from "@/api/employeesApi";
import { useStaffMe } from "@/api/tenantApi";
import { get_user_value } from "@/store/authStore";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import ImageUpload from "@/components/images/ImageUpload";
import UserInfo from "./-components/UserInfo";
import PersonalInfo from "./-components/PersonalInfo";
import EmergencyContactInfo from "./-components/EmergencyContactInfo";
import EmploymentInfo from "./-components/EmploymentInfo";

export const Route = createFileRoute("/staff/settings/profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  const employeeQuery = useMyEmployeeProfile();
  const staffQuery = useStaffMe();
  const updateProfile = useUpdateMyEmployeeProfile();
  const uploadPhoto = useUploadMyEmployeePhoto();

  const avatarModalRef = useRef<ModalHandle>(null);
  const [avatarFile, setAvatarFile] = useState<File>();

  const employee = employeeQuery.data;
  const staff = staffQuery.data;
  const hasEmployeeProfile = Boolean(employee);
  const currentAvatar =
    extractEmployeePhoto(employee) || staff?.profilePic || staff?.tenant?.logo;

  const defaults = useMemo<MyEmployeeProfileUpdate>(
    () => ({
      phone:
        employee?.phone ??
        employee?.phoneNumber ??
        staff?.phoneNumber ??
        get_user_value()?.user.phoneNumber ??
        "",
      residentialAddress: employee?.residentialAddress ?? "",
      emergencyContactName: employee?.emergencyContactName ?? "",
      emergencyContactRelationship:
        employee?.emergencyContactRelationship ?? "",
      emergencyContactPhone: employee?.emergencyContactPhone ?? "",
    }),
    [employee, staff],
  );

  const formMethods = useForm<MyEmployeeProfileUpdate>({
    defaultValues: defaults,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = formMethods;

  useEffect(() => {
    reset(defaults, { keepDirtyValues: true });
  }, [defaults, reset]);

  const saveAvatar = async () => {
    if (!avatarFile || !hasEmployeeProfile) return;
    try {
      await uploadPhoto.mutateAsync(avatarFile);
      setAvatarFile(undefined);
      avatarModalRef.current?.close();
      toast.success("Profile photo updated.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update your profile photo.",
      );
    }
  };

  const save = handleSubmit(async (values) => {
    if (!hasEmployeeProfile) return;
    const updates = Object.fromEntries(
      Object.keys(dirtyFields).map((key) => [
        key,
        String(values[key as keyof MyEmployeeProfileUpdate] ?? "").trim(),
      ]),
    ) as MyEmployeeProfileUpdate;
    if (!Object.keys(updates).length) return;

    try {
      await updateProfile.mutateAsync(updates);
      reset({ ...values, ...updates });
      toast.success("Profile updated.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update your profile. Try again.",
      );
    }
  });

  if (employeeQuery.isPending && staffQuery.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center" role="status">
        <span className="loading loading-spinner text-primary" />
        <span className="sr-only">Loading profile</span>
      </div>
    );
  }

  if (!employee && !staff) {
    return (
      <div className="rounded-box bg-base-100 p-6" role="alert">
        <p className="font-medium">Your profile could not be loaded.</p>
        <button
          type="button"
          className="btn btn-outline btn-sm mt-4"
          onClick={() => {
            employeeQuery.refetch();
            staffQuery.refetch();
          }}
        >
          Try again
        </button>
      </div>
    );
  }

  const email =
    employee?.email || staff?.email || get_user_value()?.user.email || "";
  const firstName =
    employee?.firstName ?? staff?.firstName ?? get_user_value()?.user.firstName;
  const lastName =
    employee?.lastName ?? staff?.lastName ?? get_user_value()?.user.lastName;
  const formDisabled = updateProfile.isPending || !hasEmployeeProfile;

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-8">
      <UserInfo
        employee={employee}
        staff={staff}
        avatar={currentAvatar}
        onAvatarClick={
          hasEmployeeProfile
            ? () => {
                setAvatarFile(undefined);
                avatarModalRef.current?.open();
              }
            : undefined
        }
      />

      {!employeeQuery.isPending && !hasEmployeeProfile && (
        <div
          className="alert border border-info/30 bg-info/10 text-sm"
          role="status"
        >
          <Info className="size-5 shrink-0 text-info" aria-hidden="true" />
          <span>
            No HR employee profile is linked to this account yet. Contact HR to
            link your employee record before editing contact details or profile
            photo.
          </span>
        </div>
      )}

      <Modal ref={avatarModalRef} title="Profile photo">
        <p className="mb-4 text-sm text-base-content/80">
          Choose an image to display on your employee profile.
        </p>
        <ImageUpload
          image={
            currentAvatar
              ? { url: currentAvatar, path: currentAvatar }
              : undefined
          }
          setNew={setAvatarFile}
          disabled={uploadPhoto.isPending}
          fit="contain"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={uploadPhoto.isPending}
            onClick={() => avatarModalRef.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={
              !avatarFile || uploadPhoto.isPending || !hasEmployeeProfile
            }
            onClick={saveAvatar}
          >
            {uploadPhoto.isPending ? "Saving photo..." : "Save photo"}
          </button>
        </div>
      </Modal>

      <FormProvider {...formMethods}>
        <form onSubmit={save} className="space-y-4">
          <PersonalInfo
            firstName={firstName}
            middleName={employee?.middleName}
            lastName={lastName}
            email={email}
            dateOfBirth={employee?.dateOfBirth}
            gender={employee?.gender}
            nationality={employee?.nationality}
            register={register}
            errors={errors}
            disabled={formDisabled}
          />
          <EmergencyContactInfo
            register={register}
            errors={errors}
            disabled={formDisabled}
          />
          <EmploymentInfo employee={employee} staff={staff} />

          {hasEmployeeProfile && (
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost"
                disabled={!isDirty || updateProfile.isPending}
                onClick={() => reset(defaults)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isDirty || updateProfile.isPending}
              >
                {updateProfile.isPending ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </form>
      </FormProvider>
    </div>
  );
}
