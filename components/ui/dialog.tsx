"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Centred modal on native <dialog>: focus trap, Esc-to-close and
 * focus return to the invoker come from the platform for free.
 */
export function Dialog({
  open,
  onClose,
  title,
  children,
  className,
}: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  function onBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    // padding lives on the inner div, so the dialog element itself is
    // only hit when the click lands on the backdrop
    if (e.target === ref.current) onClose();
  }

  return (
    <dialog
      ref={ref}
      data-ui="dialog"
      onClose={onClose}
      onClick={onBackdropClick}
      className={cn(
        "bg-porcelain text-plum-ink shadow-overlay m-auto w-[min(calc(100vw-2rem),28rem)] rounded-lg p-0",
        className,
      )}
    >
      <div className="p-6">
        {title && <h2 className="text-title mb-3">{title}</h2>}
        {children}
      </div>
    </dialog>
  );
}
