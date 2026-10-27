"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "amz_cut";
const EMPTY: readonly string[] = [];
const listeners = new Set<() => void>();
let cache: readonly string[] | null = null;

function read(): readonly string[] {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    cache = Array.isArray(raw) ? raw.filter((x): x is string => typeof x === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: readonly string[]) {
  cache = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* stockage indisponible : la liste reste en mémoire pour la session */
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useCutList() {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((handle: string) => {
    const cur = read();
    write(cur.includes(handle) ? cur.filter((h) => h !== handle) : [...cur, handle]);
  }, []);
  const clear = useCallback(() => write([]), []);
  return { list, toggle, clear, has: (h: string) => list.includes(h) };
}
