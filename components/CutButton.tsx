"use client";

import { useCutList } from "@/lib/cutlist";

export default function CutButton({ handle, large }: { handle: string; large?: boolean }) {
  const { has, toggle } = useCutList();
  const on = has(handle);
  return (
    <button
      type="button"
      className={large ? "flag large" : "flag"}
      aria-pressed={on}
      onClick={() => toggle(handle)}
    >
      {on ? "À dégager ✓" : "À dégager ?"}
    </button>
  );
}
