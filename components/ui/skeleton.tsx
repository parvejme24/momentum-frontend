import type { ComponentProps } from "react";

import { skeleton } from "@/lib/ui";
import { cn } from "@/lib/utils";

type SkeletonProps = ComponentProps<"span"> & {
  block?: boolean;
};

export function Skeleton({
  block = true,
  className = "",
  ...props
}: SkeletonProps) {
  return (
    <span
      className={cn(skeleton, block && "block", className)}
      aria-hidden
      {...props}
    />
  );
}
