"use client";

import { daysBetween } from "@/lib/dates";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  /** menuItemId + variantId — merge key */
  key: string;
  menuItemId: string;
  variantId?: string;
  name: string;
  unitPricePaise: number;
  quantity: number;
  minQuantity: number;
  leadTimeHours: number;
};

type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotalPaise: number;
  /** the single delivery date this order is locked to */
  deliveryDate: string | null;
  add: (line: Omit<CartLine, "key">) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  setDeliveryDate: (iso: string | null) => void;
  /** lines whose lead time cannot be met by `iso` */
  incompatibleFor: (iso: string, todayISO: string) => CartLine[];
};

const CartContext = createContext<CartContextValue | null>(null);

// sessionStorage on purpose: order intent should not survive a week.
const STORAGE_KEY = "plate-date-cart-v2";

type StoredCart = { lines: CartLine[]; deliveryDate: string | null };

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [deliveryDate, setDeliveryDateState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as StoredCart;
        setLines(stored.lines ?? []);
        setDeliveryDateState(stored.deliveryDate ?? null);
      }
    } catch {
      // corrupted storage, start fresh
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ lines, deliveryDate } satisfies StoredCart),
      );
    }
  }, [lines, deliveryDate, hydrated]);

  const add = useCallback((line: Omit<CartLine, "key">) => {
    const key = line.variantId
      ? `${line.menuItemId}:${line.variantId}`
      : line.menuItemId;
    setLines((current) => {
      const existing = current.find((l) => l.key === key);
      if (existing) {
        return current.map((l) =>
          l.key === key ? { ...l, quantity: l.quantity + line.quantity } : l,
        );
      }
      return [...current, { ...line, key }];
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setLines((current) =>
      current.map((l) =>
        l.key === key
          ? { ...l, quantity: Math.max(l.minQuantity, quantity) }
          : l,
      ),
    );
  }, []);

  const remove = useCallback((key: string) => {
    setLines((current) => current.filter((l) => l.key !== key));
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    setDeliveryDateState(null);
  }, []);

  const setDeliveryDate = useCallback((iso: string | null) => {
    setDeliveryDateState(iso);
  }, []);

  const incompatibleFor = useCallback(
    (iso: string, todayISO: string) => {
      const hoursAvailable = daysBetween(todayISO, iso) * 24;
      return lines.filter((l) => l.leadTimeHours > hoursAvailable);
    },
    [lines],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      count: lines.reduce((n, l) => n + l.quantity, 0),
      subtotalPaise: lines.reduce(
        (n, l) => n + l.unitPricePaise * l.quantity,
        0,
      ),
      deliveryDate,
      add,
      setQuantity,
      remove,
      clear,
      setDeliveryDate,
      incompatibleFor,
    }),
    [
      lines,
      deliveryDate,
      add,
      setQuantity,
      remove,
      clear,
      setDeliveryDate,
      incompatibleFor,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
