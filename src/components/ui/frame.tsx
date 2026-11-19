import type { ComponentPropsWithoutRef, ElementType } from "react";

type Props<T extends ElementType> = { as?: T; className?: string } & Omit<ComponentPropsWithoutRef<T>, "as" | "className">;

// The two frames of the site (DESIGN.md). What a machine renders (halftone, dither, dot grid) and
// what is printed on the sheet sits square behind a hairline drawn over it; a photograph sits in
// the squircle, in its own colours, with nothing laid over it.
const MACHINE = "after:pointer-events-none after:absolute after:inset-0 after:border after:border-rule";
// The hairline hangs on the frame, so the frame must be positioned: relative unless it already is.
const PLACED = /(^|\s)(absolute|fixed|sticky|relative)(\s|$)/;
const PHOTO = "u-corner overflow-hidden";

export function MachineFrame<T extends ElementType = "div">({ as, className = "", ...rest }: Props<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={`${PLACED.test(className) ? "" : "relative"} ${MACHINE} ${className}`} {...rest} />;
}

export function PhotoFrame<T extends ElementType = "div">({ as, className = "", ...rest }: Props<T>) {
  const Tag: ElementType = as ?? "div";
  return <Tag className={`${PHOTO} ${className}`} {...rest} />;
}
