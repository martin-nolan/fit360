import * as React from "react";
import { toast as sonnerToast } from "sonner";

export type AppToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
};

export function toast(opts: AppToastOptions) {
  const { title, description, variant = "default" } = opts || {};
  const fn = variant === "destructive" ? sonnerToast.error : sonnerToast;

  if (title && description) {
    return fn(String(title), { description: String(description) });
  }
  if (title) {
    return fn(String(title));
  }
  if (description) {
    return fn(String(description));
  }
  return fn("");
}

export function useToast() {
  return React.useMemo(() => ({ toast }), []);
}

export { sonnerToast as rawToast };

