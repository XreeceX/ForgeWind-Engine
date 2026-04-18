"use client";

import { useEffect } from "react";

/**
 * Client-side friction only — discourages casual copy/save; not a security boundary.
 * Skipped on public auth routes via the caller (enabled flag).
 */
export function useAntiCopy(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;
      const k = e.key.toLowerCase();

      if (k === "u" || k === "s") {
        e.preventDefault();
        return;
      }

      if (k === "a") {
        const ae = document.activeElement;
        if (
          ae instanceof HTMLInputElement ||
          ae instanceof HTMLTextAreaElement ||
          ae instanceof HTMLSelectElement
        ) {
          return;
        }
        if (ae instanceof HTMLElement && ae.isContentEditable) return;
        e.preventDefault();
      }
    };

    const onDragStart = (e: DragEvent) => {
      const t = e.target;
      if (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement) {
        return;
      }
      if (t instanceof HTMLElement && t.isContentEditable) return;
      e.preventDefault();
    };

    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("dragstart", onDragStart, true);

    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("dragstart", onDragStart, true);
    };
  }, [enabled]);
}
