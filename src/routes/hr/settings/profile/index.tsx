import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import {
  useStaffMe,
  useUpdateStaffProfile,
  type StaffProfileUpdate,
} from "@/api/tenantApi";
import { uploadImage, uploadedFileUrl } from "@/api/imageApi";
import { get_user_value } from "@/store/authStore";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import ImageUpload from "@/components/images/ImageUpload";
import UserInfo from "./-components/UserInfo";
import PersonalInfo from "./-components/PersonalInfo";

export const Route = createFileRoute("/hr/settings/profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  const profileQuery = useStaffMe();
  const updateProfile = useUpdateStaffProfile();
  const avatarModalRef = useRef<ModalHandle>(null);
  const [avatarFile, setAvatarFile] = useState<File>();
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const profile = profileQuery.data;
  const staffId = profile?.id || profile?.sub || get_user_value()?.user.id;
  const currentAvatar = profile?.profilePic || profile?.tenant?.logo;

  const defaults = useMemo<StaffProfileUpdate>(
    () => ({
      firstName: profile?.firstName ?? get_user_value()?.user.firstName ?? "",
      lastName: profile?.lastName ?? get_user_value()?.user.lastName ?? "",
      phoneNumber:
        profile?.phoneNumber ?? get_user_value()?.user.phoneNumber ?? "",
    }),
    [profile],
  );

  const formMethods = useForm<StaffProfileUpdate>({ defaultValues: defaults });
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
    if (!avatarFile || !staffId) return;
    try {
      setIsUploadingAvatar(true);
      const profilePic = uploadedFileUrl(await uploadImage(avatarFile));
      if (!profilePic)
        throw new Error("The image upload did not return a URL.");
      await updateProfile.mutateAsync({ id: staffId, profilePic });
      setAvatarFile(undefined);
      avatarModalRef.current?.close();
      toast.success("Profile photo updated.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update your profile photo.",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const save = handleSubmit(async (values) => {
    if (!staffId) return;
    const updates = Object.fromEntries(
      Object.keys(dirtyFields).map((key) => [
        key,
        String(values[key as keyof StaffProfileUpdate] ?? "").trim(),
      ]),
    ) as StaffProfileUpdate;
    if (!Object.keys(updates).length) return;

    try {
      await updateProfile.mutateAsync({ id: staffId, ...updates });
      reset({ ...values, ...updates });
      toast.success("Profile updated.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Could not update your profile. Try again.",
      );
    }
  });

  if (profileQuery.isPending) {
    return (
      <div className="flex min-h-64 items-center justify-center" role="status">
        <span className="loading loading-spinner text-primary" />
        <span className="sr-only">Loading profile</span>
      </div>
    );
  }

  if (profileQuery.isError || !profile) {
    return (
      <div className="rounded-box bg-base-100 p-6" role="alert">
        <p className="font-medium">Your profile could not be loaded.</p>
        <button
          type="button"
          className="btn btn-outline btn-sm mt-4"
          onClick={() => profileQuery.refetch()}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-8">
      <UserInfo
        profile={{ ...profile, ...defaults }}
        avatar={currentAvatar}
        onAvatarClick={
          staffId
            ? () => {
                setAvatarFile(undefined);
                avatarModalRef.current?.open();
              }
            : undefined
        }
      />
      <Modal ref={avatarModalRef} title="Profile photo">
        <p className="mb-4 text-sm text-base-content/80">
          Choose an image to display on your staff profile.
        </p>
        <ImageUpload
          image={
            currentAvatar
              ? { url: currentAvatar, path: currentAvatar }
              : undefined
          }
          setNew={setAvatarFile}
          disabled={isUploadingAvatar}
          fit="contain"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={isUploadingAvatar}
            onClick={() => avatarModalRef.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!avatarFile || isUploadingAvatar || !staffId}
            onClick={saveAvatar}
          >
            {isUploadingAvatar ? "Saving photo..." : "Save photo"}
          </button>
        </div>
      </Modal>
      <FormProvider {...formMethods}>
        <form onSubmit={save} className="space-y-4">
          <PersonalInfo
            email={profile.email}
            roleName={profile.role?.name}
            register={register}
            errors={errors}
            disabled={updateProfile.isPending}
          />
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
              disabled={!isDirty || updateProfile.isPending || !staffId}
            >
              {updateProfile.isPending ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
