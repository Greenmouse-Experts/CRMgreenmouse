export function getInitials(name: string): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function getAvatarColor(name: string): string {
  const palettes = [
    "bg-primary/15 text-primary border-primary/20",
    "bg-info/15 text-info border-info/20",
    "bg-success/15 text-success border-success/20",
    "bg-warning/20 text-warning-foreground border-warning/30",
    "bg-secondary/15 text-secondary border-secondary/20",
    "bg-accent/15 text-accent-foreground border-accent/20",
  ];
  const sum = [...name].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return palettes[sum % palettes.length];
}
