"use client";

import type { Platform } from "@/lib/sample";
import { InstagramMark, SnapchatMark } from "./Logos";

export default function PlatformSwitch({
  value,
  onChange,
}: {
  value: Platform;
  onChange: (p: Platform) => void;
}) {
  return (
    <div className="seg" role="group" aria-label="Plateforme">
      <button type="button" aria-pressed={value === "instagram"} onClick={() => onChange("instagram")}>
        <InstagramMark size={18} /> Instagram
      </button>
      <button type="button" aria-pressed={value === "snapchat"} onClick={() => onChange("snapchat")}>
        <SnapchatMark size={18} /> Snapchat
      </button>
    </div>
  );
}
