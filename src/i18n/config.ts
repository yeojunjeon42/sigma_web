// The site's two languages. English has no prefix; Korean lives under /ko.
export const LOCALES = ["en", "ko"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT: Locale = "en";
export const isLocale = (value: string | undefined): value is Locale => LOCALES.includes(value as Locale);
export const other = (locale: Locale): Locale => (locale === "en" ? "ko" : "en");

// The chosen language, set by the switcher and read by `proxy.ts` on the next visit.
export const COOKIE = "lang";

// A page's address in a language: "/blog" is "/blog" in English and "/ko/blog" in Korean.
export function localePath(locale: Locale, path: string): string {
  if (locale === DEFAULT) return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

// The reverse: the language an address is in, and the page it names in any language. A build
// is prerendered under /en, so that prefix is taken off too.
export function splitPath(pathname: string): { locale: Locale; path: string } {
  const [, first, ...rest] = pathname.split("/");
  if (!isLocale(first)) return { locale: DEFAULT, path: pathname || "/" };
  return { locale: first, path: `/${rest.join("/")}` };
}

// A value that exists in both languages; Korean falls back to English where it is missing.
export type Both<T = string> = { en: T; ko?: T };
export const pick = <T,>(locale: Locale, value: Both<T>): T => (locale === "ko" && value.ko !== undefined ? value.ko : value.en);
