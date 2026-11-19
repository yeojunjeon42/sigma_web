import type { Metadata } from "next";
import { base, Shell } from "../shell";
import { LOCALES } from "@/i18n/config";
import { META } from "@/i18n/dict/meta";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { localeOf, type PageProps } from "@/i18n/server";

export { viewport } from "../shell";

// Two languages and no others: English is served from /en behind a rewrite (next.config.ts), so
// its pages have no prefix in the address bar.
export const dynamicParams = false;
export const generateStaticParams = () => LOCALES.map((locale) => ({ locale }));

const KEYWORDS = [
  "서울대 로봇동아리",
  "서울대학교 로봇동아리",
  "시그마 인텔리전스",
  "SIGMA INTELLIGENCE",
  "SNU robotics club",
  "로봇 동아리",
  "서울대 로봇",
  "SNU robotics",
  "Seoul National University robotics club",
  "university robotics club Korea",
];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { site } = META[await localeOf(params)];
  return { ...base, title: { default: site.title, template: "%s \\ SIGMA INTELLIGENCE" }, description: site.description, keywords: KEYWORDS };
}

export default async function LocaleLayout({ children, params }: PageProps & { children: React.ReactNode }) {
  const locale = await localeOf(params);
  return (
    <Shell lang={locale} skip={META[locale].skip}>
      <LocaleProvider locale={locale}>{children}</LocaleProvider>
    </Shell>
  );
}
