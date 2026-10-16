import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  useAdminProfile,
  useUpdateAdminProfile,
  type AdminProfile,
} from "@/api/adminApi";
import { uploadImage, uploadedFileUrl } from "@/api/imageApi";
import PageLoader from "@/components/layout/PageLoader";
import UserInfo from "./-components/UserInfo";
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
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>();
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
  }, [profile]);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(undefined);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPhotoPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [photoFile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploadingPhoto(true);
      let profilePic: string | undefined;
      if (photoFile) {
        profilePic = uploadedFileUrl(await uploadImage(photoFile));
        if (!profilePic)
          throw new Error("The image upload did not return a URL.");
      }
      await updateProfile.mutateAsync({
        ...form,
        ...(profilePic ? { profilePic } : {}),
      });
      toast.success("Profile updated successfully");
      setPhotoFile(null);
      setIsEditing(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to update profile",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  return (
    <div className="space-y-6">
      <UserInfo
        profile={
          photoPreview ? { ...profile, profilePic: photoPreview } : profile
        }
      />

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
                setPhotoFile(null);
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

        {isEditing && (
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Profile picture</span>
            <input
              key={photoFile?.name ?? "empty"}
              type="file"
              accept="image/*"
              className="file-input file-input-bordered w-full max-w-sm"
              disabled={isUploadingPhoto || updateProfile.isPending}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (
                  !file.type.startsWith("image/") ||
                  file.size > 5 * 1024 * 1024
                ) {
                  toast.error("Choose an image smaller than 5 MB.");
                  event.currentTarget.value = "";
                  return;
                }
                setPhotoFile(file);
              }}
            />
            <span className="block text-xs text-base-content/70">
              Preview above. Save profile to apply the picture.
            </span>
          </label>
        )}

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
            <label className="label">
              <span className="label-text font-semibold flex items-center gap-1.5">
                <Phone className="size-3.5 text-base-content/60" /> Phone Number
              </span>
            </label>
            <input
              type="text"
              disabled={!isEditing}
              value={form.phoneNumber}
              onChange={(e) =>
                setForm({ ...form, phoneNumber: e.target.value })
              }
              className="input input-sm input-bordered w-full"
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
