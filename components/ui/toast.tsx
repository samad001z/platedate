"use client";

import { cn } from "@/lib/cn";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "default" | "error";

export type ToastOptions = {
  /** error = assertive announcement + warning glyph; hue stays on-palette */
  variant?: ToastVariant;
  /** ms before auto-dismiss */
  duration?: number;
};

type ToastItem = { id: number; message: string; variant: ToastVariant };

type ToastContextValue = {
  toast: (message: string, options?: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (
      message: string,
      { variant = "default", duration = 4000 }: ToastOptions = {},
    ) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismiss(id), duration);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-stretch gap-2 sm:left-auto sm:w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            data-ui="toast"
            role={t.variant === "error" ? "alert" : "status"}
            className={cn(
              "border-gold/60 bg-plum-ink text-small text-porcelain shadow-raised pointer-events-auto flex items-start justify-between gap-3 rounded-md border px-4 py-3",
            )}
          >
            <p className="flex-1">
              {t.variant === "error" && (
                <span aria-hidden className="mr-1.5">
                  ⚠
                </span>
              )}
              {t.message}
            </p>
            <button
              type="button"
              aria-label="Dismiss"
              onClick={() => dismiss(t.id)}
              className="text-porcelain/70 hover:text-porcelain -m-1 rounded-sm p-1"
            >
              <svg
                aria-hidden
                className="size-4"
                viewBox="0 0 20 20"
                fill="none"
              >
                <path
                  d="M5 5l10 10M15 5L5 15"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
