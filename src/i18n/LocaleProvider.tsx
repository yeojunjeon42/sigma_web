"use client";

import { createContext, useContext, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT, splitPath, type Locale } from "./config";

const Context = createContext<Locale>(DEFAULT);

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <Context.Provider value={locale}>{children}</Context.Provider>;
}

export const useLocale = () => useContext(Context);

// The page's address without its language. English is served from /en behind a rewrite, so the
// prerender reads "/en/blog" where the browser reads "/blog": both come out as "/blog" here, and
// anything that compares addresses must use this, never `usePathname` itself.
export const usePath = () => splitPath(usePathname()).path;
