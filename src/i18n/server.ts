import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";

// Every page under app/[locale] takes its language from the address.
export type PageProps<P = object> = { params: Promise<{ locale: string } & P> };

export async function localeOf(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}
