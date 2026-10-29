import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm, FormProvider } from "react-hook-form";
import { toast } from "sonner";
import {
  useTenantMe,
  useTenantOnboarding,
  useUpdateTenantProfile,
  useSaveTenantOnboarding,
  type TenantProfileUpdate,
} from "@/api/tenantApi";
import { uploadImage, uploadedFileUrl } from "@/api/imageApi";
import { get_user_value } from "@/store/authStore";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import ImageUpload from "@/components/images/ImageUpload";
import UserInfo from "./-components/UserInfo";
import PersonalInfo from "./-components/PersonalInfo";
import AddressInfo from "./-components/AddressInfo";

export const Route = createFileRoute("/tenant/settings/profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  const profileQuery = useTenantMe();
  const onboardingQuery = useTenantOnboarding();
  const updateProfile = useUpdateTenantProfile();
  const saveOnboarding = useSaveTenantOnboarding();
  const logoModalRef = useRef<ModalHandle>(null);
  const [logoFile, setLogoFile] = useState<File>();
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const profile = profileQuery.data;
  const onboarding = onboardingQuery.data;
  const defaults = useMemo<TenantProfileUpdate>(
    () => ({
      companyName: profile?.companyName ?? "",
      phoneNumber:
        profile?.phoneNumber ?? get_user_value()?.user.phoneNumber ?? "",
      companyWebsite:
        profile?.companyWebsite ?? onboarding?.companyWebsite ?? "",
      companyAddress:
        profile?.companyAddress ?? onboarding?.companyAddress ?? "",
      companyCity: profile?.companyCity ?? onboarding?.companyCity ?? "",
      companyState: profile?.companyState ?? onboarding?.companyState ?? "",
      companyCountry:
        profile?.companyCountry ?? onboarding?.companyCountry ?? "",
    }),
    [profile, onboarding],
  );
  const formMethods = useForm<TenantProfileUpdate>({ defaultValues: defaults });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = formMethods;

  useEffect(() => {
    reset(defaults, { keepDirtyValues: true });
  }, [defaults, reset]);

  const saveLogo = async () => {
    if (!logoFile) return;
    try {
      setIsUploadingLogo(true);
      const logo = uploadedFileUrl(await uploadImage(logoFile));
      if (!logo) throw new Error("The image upload did not return a URL.");
      await saveOnboarding.mutateAsync({ logo });
      setLogoFile(undefined);
      logoModalRef.current?.close();
      toast.success("Company logo updated.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update the company logo.",
      );
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const save = handleSubmit(async (values) => {
    const updates = Object.fromEntries(
      Object.keys(dirtyFields).map((key) => [
        key,
        String(values[key as keyof TenantProfileUpdate] ?? "").trim(),
      ]),
    ) as TenantProfileUpdate;
    if (!Object.keys(updates).length) return;

    try {
      await updateProfile.mutateAsync(updates);
      reset({ ...values, ...updates });
      toast.success("Profile updated.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          "Could not update your profile. Try again.",
      );
    }
  });

  if (profileQuery.isPending || onboardingQuery.isPending) {
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
        logo={onboarding?.logo}
        onLogoClick={() => {
          setLogoFile(undefined);
          logoModalRef.current?.open();
        }}
      />
      <Modal ref={logoModalRef} title="Company logo">
        <p className="mb-4 text-sm text-base-content/70">
          Choose an image to display on your company profile.
        </p>
        <ImageUpload
          image={
            onboarding?.logo
              ? { url: onboarding.logo, path: onboarding.logo }
              : undefined
          }
          setNew={setLogoFile}
          disabled={isUploadingLogo}
          fit="contain"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={isUploadingLogo}
            onClick={() => logoModalRef.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!logoFile || isUploadingLogo}
            onClick={saveLogo}
          >
            {isUploadingLogo ? "Saving logo..." : "Save logo"}
          </button>
        </div>
      </Modal>
      {onboardingQuery.isError && (
        <div className="alert alert-warning text-sm" role="alert">
          Some existing business details could not be loaded. Only fields you
          change will be saved.
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => onboardingQuery.refetch()}
          >
            Retry
          </button>
        </div>
      )}
      <FormProvider {...formMethods}>
        <form onSubmit={save} className="space-y-4">
          <PersonalInfo
            email={profile.email}
            register={register}
            errors={errors}
            disabled={updateProfile.isPending}
          />
          <AddressInfo disabled={updateProfile.isPending} />
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
        </form>
      </FormProvider>
    </div>
  );
}
