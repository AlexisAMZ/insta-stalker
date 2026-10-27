import { initials } from "@/lib/sample";

export function Avatar({ name, hue }: { name: string; hue: number }) {
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{ background: `hsl(${hue} 85% 88%)`, color: `hsl(${hue} 60% 20%)` }}
    >
      {initials(name)}
    </span>
  );
}
