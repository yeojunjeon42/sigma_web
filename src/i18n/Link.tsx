"use client";

import NextLink from "next/link";
import type { ComponentProps } from "react";
import { isLocale, localePath } from "./config";
import { useLocale } from "./LocaleProvider";

// The site's link: an address inside the site is given without its language ("/blog") and goes to
// the reader's own ("/ko/blog"). Anything else passes through.
export default function Link({ href, ...rest }: ComponentProps<typeof NextLink>) {
  const locale = useLocale();
  const inside = typeof href === "string" && /^\/(?!\/|ai(?:\/|$))/.test(href) && !isLocale(href.split(/[/?#]/)[1]);
  const to = inside ? localePath(locale, href as string) : href;
  return <NextLink href={to} {...rest} />;
}
