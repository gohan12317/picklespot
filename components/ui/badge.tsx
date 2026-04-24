import * as React from "react";

import { cn } from "./utils";

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: "default" | "outline";
};

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        variant === "default" &&
          "border-transparent bg-gray-900 text-white [&>svg]:size-3",
        variant === "outline" &&
          "border-gray-200 bg-white text-gray-900 [&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
