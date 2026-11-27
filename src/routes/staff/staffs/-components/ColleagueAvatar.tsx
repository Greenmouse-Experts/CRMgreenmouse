import { getAvatarColor, getInitials } from "./colleagueUtils";

interface ColleagueAvatarProps {
  name: string;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function ColleagueAvatar({
  name,
  src,
  size = "sm",
  className = "",
}: ColleagueAvatarProps) {
  const sizeClasses = {
    sm: "size-8 ",
    md: "size-10 text-sm",
    lg: "size-16 text-xl",
  }[size];

  const colorClass = getAvatarColor(name);
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`rounded-full object-cover border border-base-200 shrink-0 ${sizeClasses} ${className}`}
      />
    );
  }

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full font-semibold border select-none shrink-0 ${sizeClasses} ${colorClass} ${className}`}
      title={name}
    >
      {initials}
    </span>
  );
}
