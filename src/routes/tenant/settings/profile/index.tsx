import { useEffect, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useTenantMe,
  useTenantOnboarding,
  useUpdateTenantProfile,
  type TenantProfileUpdate,
} from "@/api/tenantApi";
import { get_user_value } from "@/store/authStore";
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
  const profile = profileQuery.data;
  const onboarding = onboardingQuery.data;
  const defaults = useMemo<TenantProfileUpdate>(
    () => ({
      companyName: profile?.companyName ?? "",
      phoneNumber: profile?.phoneNumber ?? get_user_value()?.user.phoneNumber ?? "",
      companyWebsite: profile?.companyWebsite ?? onboarding?.companyWebsite ?? "",
      companyAddress: profile?.companyAddress ?? onboarding?.companyAddress ?? "",
      companyCity: profile?.companyCity ?? onboarding?.companyCity ?? "",
      companyState: profile?.companyState ?? onboarding?.companyState ?? "",
      companyCountry: profile?.companyCountry ?? onboarding?.companyCountry ?? "",
    }),
    [profile, onboarding],
  );
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<TenantProfileUpdate>({ defaultValues: defaults });

  useEffect(() => {
    reset(defaults, { keepDirtyValues: true });
  }, [defaults, reset]);

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
      toast.error(error?.response?.data?.message || "Could not update your profile. Try again.");
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
        <button type="button" className="btn btn-outline btn-sm mt-4" onClick={() => profileQuery.refetch()}>
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4 pb-8">
      <UserInfo profile={{ ...profile, ...defaults }} />
      {onboardingQuery.isError && (
        <div className="alert alert-warning text-sm" role="alert">
          Some existing business details could not be loaded. Only fields you change will be saved.
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => onboardingQuery.refetch()}>Retry</button>
        </div>
      )}
      <form onSubmit={save} className="space-y-4">
        <PersonalInfo email={profile.email} register={register} errors={errors} disabled={updateProfile.isPending} />
        <AddressInfo register={register} disabled={updateProfile.isPending} />
        <div className="flex justify-end gap-2">
          <button type="button" className="btn btn-ghost" disabled={!isDirty || updateProfile.isPending} onClick={() => reset(defaults)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={!isDirty || updateProfile.isPending}>
            {updateProfile.isPending ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
