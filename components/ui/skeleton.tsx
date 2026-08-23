import type { ComponentProps } from "react";

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
      className={[block ? "skeleton skeleton-block" : "skeleton", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
      {...props}
    />
  );
}
