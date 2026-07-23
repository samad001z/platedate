"use client";

import { cn } from "@/lib/cn";
import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";

export type SheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  /** bottom = mobile default; right = desktop drawer */
  side?: "bottom" | "right";
  children: ReactNode;
  className?: string;
};

const sideClasses = {
  bottom: "mt-auto mb-0 max-h-[85dvh] w-full max-w-full rounded-t-lg",
  right: "mr-0 ml-auto h-dvh max-h-dvh w-[min(90vw,24rem)] rounded-l-lg",
} as const;

export function Sheet({
  open,
  onClose,
  title,
  side = "bottom",
  children,
  className,
}: SheetProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    else if (!open && el.open) el.close();
  }, [open]);

  function onBackdropClick(e: MouseEvent<HTMLDialogElement>) {
    if (e.target === ref.current) onClose();
  }

  return (
    <dialog
      ref={ref}
      data-ui={side === "bottom" ? "sheet-bottom" : "sheet-right"}
      onClose={onClose}
      onClick={onBackdropClick}
      className={cn(
        "bg-porcelain text-plum-ink shadow-overlay flex-col p-0 open:flex",
        sideClasses[side],
        className,
      )}
    >
      <div className="flex items-center justify-between gap-4 p-5 pb-0">
        {title ? <h2 className="text-title">{title}</h2> : <span />}
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="rounded-pill text-plum-ink/60 hover:bg-blush hover:text-plum-ink -m-2 flex size-11 shrink-0 items-center justify-center"
        >
          <svg aria-hidden className="size-5" viewBox="0 0 20 20" fill="none">
            <path
              d="M5 5l10 10M15 5L5 15"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto p-5">{children}</div>
    </dialog>
  );
}
