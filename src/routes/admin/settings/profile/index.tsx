import { useState, useEffect, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useAdminProfile,
  useUpdateAdminProfile,
  type AdminProfile,
} from "@/api/adminApi";
import { uploadImage, uploadedFileUrl } from "@/api/imageApi";
import PageLoader from "@/components/layout/PageLoader";
import Modal, { type ModalHandle } from "@/components/DialogModal";
import ImageUpload from "@/components/images/ImageUpload";
import UserInfo from "./-components/UserInfo";
import SimplePhoneInput from "@/components/inputs/SimplePhoneInput";
import { toast } from "sonner";
import { User, Mail, Phone, MapPin, FileText, Save, Edit3 } from "lucide-react";

export const Route = createFileRoute("/admin/settings/profile/")({
  component: RouteComponent,
});

function RouteComponent() {
  const query = useAdminProfile();

  return (
    <div className="space-y-6">
      <PageLoader query={query}>
        {(profile) => <ProfileContent profile={profile} />}
      </PageLoader>
    </div>
  );
}

function ProfileContent({ profile }: { profile: AdminProfile }) {
  const updateProfile = useUpdateAdminProfile();
  const [isEditing, setIsEditing] = useState(false);
  const photoModalRef = useRef<ModalHandle>(null);
  const [photoFile, setPhotoFile] = useState<File>();
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [form, setForm] = useState({
    firstName: profile.firstName || "",
    lastName: profile.lastName || "",
    email: profile.email || "",
    phoneNumber: profile.phoneNumber || "",
    bio: profile.bio || "",
    country: profile.country || "",
    cityState: profile.cityState || "",
    postalCode: profile.postalCode || "",
    taxId: profile.taxId || "",
  });

  useEffect(() => {
    if (isEditing) return;
    setForm({
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      email: profile.email || "",
      phoneNumber: profile.phoneNumber || "",
      bio: profile.bio || "",
      country: profile.country || "",
      cityState: profile.cityState || "",
      postalCode: profile.postalCode || "",
      taxId: profile.taxId || "",
    });
  }, [profile, isEditing]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(form);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile",
      );
    }
  };

  const savePhoto = async () => {
    if (!photoFile) return;
    try {
      setIsUploadingPhoto(true);
      const profilePic = uploadedFileUrl(await uploadImage(photoFile));
      if (!profilePic)
        throw new Error("The image upload did not return a URL.");
      await updateProfile.mutateAsync({ profilePic });
      setPhotoFile(undefined);
      photoModalRef.current?.close();
      toast.success("Profile picture updated.");
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Could not update the profile picture.",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-6">
      <UserInfo
        profile={profile}
        onPhotoClick={() => {
          setPhotoFile(undefined);
          photoModalRef.current?.open();
        }}
      />

      <Modal ref={photoModalRef} title="Profile picture">
        <p className="mb-4 text-sm text-base-content/70">
          Choose an image for your administrator profile.
        </p>
        <ImageUpload
          image={
            profile.profilePic
              ? { url: profile.profilePic, path: profile.profilePic }
              : undefined
          }
          setNew={setPhotoFile}
          disabled={isUploadingPhoto}
          fit="cover"
        />
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="btn btn-ghost"
            disabled={isUploadingPhoto}
            onClick={() => photoModalRef.current?.close()}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!photoFile || isUploadingPhoto || updateProfile.isPending}
            onClick={savePhoto}
          >
            {isUploadingPhoto ? "Saving picture..." : "Save picture"}
          </button>
        </div>
      </Modal>

      <form
        onSubmit={handleSave}
        className="card bg-base-100 p-6 border border-base-200 space-y-6"
      >
        <div className="flex items-center justify-between border-b border-base-200 pb-4">
          <div>
            <h3 className="text-lg font-semibold text-base-content">
              Profile & Organization Details
            </h3>
            <p className="text-xs text-base-content/60">
              Manage personal and administrative contact details.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (isEditing) {
                setForm({
                  firstName: profile.firstName || "",
                  lastName: profile.lastName || "",
                  email: profile.email || "",
                  phoneNumber: profile.phoneNumber || "",
                  bio: profile.bio || "",
                  country: profile.country || "",
                  cityState: profile.cityState || "",
                  postalCode: profile.postalCode || "",
                  taxId: profile.taxId || "",
                });
              }
              setIsEditing(!isEditing);
            }}
            disabled={updateProfile.isPending || isUploadingPhoto}
            className={`btn btn-sm ${isEditing ? "btn-ghost" : "btn-primary btn-outline"}`}
          >
            <Edit3 className="size-4" />
            {isEditing ? "Cancel" : "Edit Details"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <User className="size-3.5 text-base-content/60" /> First Name
              </span>
            </label>
            <input
              type="text"
              required
              disabled={!isEditing}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <User className="size-3.5 text-base-content/60" /> Last Name
              </span>
            </label>
            <input
              type="text"
              required
              disabled={!isEditing}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <Mail className="size-3.5 text-base-content/60" /> Email Address
              </span>
            </label>
            <input
              type="email"
              required
              disabled={!isEditing}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <SimplePhoneInput
              size="sm"
              label="Phone Number"
              icon={<Phone className="size-3.5 text-base-content/60" />}
              disabled={!isEditing}
              value={form.phoneNumber}
              onChange={(phone) => setForm({ ...form, phoneNumber: phone })}
              placeholder="+234 800 000 0000"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <FileText className="size-3.5 text-base-content/60" /> Bio /
                Title
              </span>
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={form.bio}
              onChange={(e) => setForm({ ...form, bio: e.target.value })}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <MapPin className="size-3.5 text-base-content/60" /> Country
              </span>
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <MapPin className="size-3.5 text-base-content/60" /> City /
                State
              </span>
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={form.cityState}
              onChange={(e) => setForm({ ...form, cityState: e.target.value })}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">Postal Code</span>
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              className="input input-sm input-bordered w-full"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-semibold">TAX ID</span>
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={form.taxId}
              onChange={(e) => setForm({ ...form, taxId: e.target.value })}
              className="input input-sm input-bordered w-full"
            />
          </div>
        </div>

        {isEditing && (
          <div className="flex justify-end pt-4 border-t border-base-200">
            <button
              type="submit"
              disabled={updateProfile.isPending || isUploadingPhoto}
              className="btn btn-primary btn-sm gap-2"
            >
              <Save className="size-4" />
              {updateProfile.isPending || isUploadingPhoto
                ? "Saving..."
                : "Save Profile"}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
