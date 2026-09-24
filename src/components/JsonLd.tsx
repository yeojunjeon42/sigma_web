import { SOCIAL } from "@/features/site/data/social";
const SITE_URL = "https://sigmaintelligence.org";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "Sigma Intelligence",
  url: SITE_URL,
  alternateName: "시그마 인텔리전스",
  description:
    "Korea's first university robotics club, founded in 1984 at Seoul National University.",
  foundingDate: "1984",
  sameAs: SOCIAL.map((s) => s.href),
  contactPoint: {
    "@type": "ContactPoint",
    email: "record.snusigma@gmail.com",
    contactType: "general",
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "Seoul",
    addressCountry: "KR",
    name: "Seoul National University",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Sigma Intelligence — SNU Robotics Club",
  alternateName: "시그마 | 서울대학교 로봇동아리",
  url: SITE_URL,
};

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
