import type { ReactNode } from "react";

type Width = "content" | "wide" | "full";

type Tag = "div" | "section" | "header" | "footer" | "main" | "nav" | "article" | "aside";

const WIDTH: Record<Width, string> = {
  content: "max-w-content",
  wide: "max-w-wide",
  full: "max-w-none",
};

export function Container({
  as: Tag = "div",
  width = "wide",
  gutter = true,
  className = "",
  children,
}: {
  as?: Tag;
  width?: Width;
  gutter?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag
      className={`mx-auto w-full ${WIDTH[width]} ${gutter ? "u-gutter" : ""} ${className}`}
    >
      {children}
    </Tag>
  );
}
