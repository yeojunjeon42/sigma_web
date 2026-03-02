const SITE_URL = "https://sigmaintelligence.org";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "시그마 인텔리전스 (Sigma Intelligence)",
  url: SITE_URL,
  description:
    "서울대학교 로봇동아리 시그마 인텔리전스. 1984년 설립된 국내 최초 대학 로봇 동아리.",
  foundingDate: "1984",
  sameAs: [
    "https://www.instagram.com/sigma_intelligence_/",
    "https://www.linkedin.com/company/sigma-intelligence/",
    "https://www.facebook.com/sigmaintelligence/",
  ],
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
  name: "시그마 | 서울대학교 로봇동아리",
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
