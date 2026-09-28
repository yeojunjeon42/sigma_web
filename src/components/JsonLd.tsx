import { SOCIAL } from "@/features/site/data/social";
import { SITE_URL } from "@/features/site/data/site";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "SIGMA INTELLIGENCE",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  alternateName: ["시그마 인텔리전스", "SNU SIGMA", "서울대학교 로봇동아리 시그마"],
  description:
    "Korea's first university robotics club, founded in 1984 at Seoul National University.",
  parentOrganization: {
    "@type": "CollegeOrUniversity",
    name: "Seoul National University",
    url: "https://www.snu.ac.kr",
  },
  foundingDate: "1984",
  sameAs: SOCIAL.map((s) => s.href),
  contactPoint: {
    "@type": "ContactPoint",
    email: "record.snusigma@gmail.com",
    contactType: "general",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Building 302, Room 215-2, 1 Gwanak-ro, Gwanak-gu",
    addressLocality: "Seoul",
    postalCode: "08826",
    addressCountry: "KR",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "SIGMA INTELLIGENCE",
  alternateName: ["SIGMA INTELLIGENCE — SNU Robotics Club", "시그마 인텔리전스 | 서울대학교 로봇동아리"],
  url: SITE_URL,
  inLanguage: "en",
  publisher: { "@id": `${SITE_URL}/#organization` },
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
