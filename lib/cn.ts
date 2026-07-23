import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// teach tailwind-merge our custom type scale so e.g. `text-body` and
// `text-small` conflict with each other, not with `text-berry`
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        "text-hero",
        "text-title",
        "text-heading",
        "text-body",
        "text-small",
        "text-price",
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
