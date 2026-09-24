import type { ReactNode } from "react";

export function GridField({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`u-arrive relative isolate overflow-x-clip ${className}`}>
      {children}
    </div>
  );
}
