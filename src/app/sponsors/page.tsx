import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";
import { T } from "@/components/T";

interface Sponsor {
  _id: string;
  name: string;
  logo?: { asset: { _ref: string } };
  tier?: string;
  website?: string;
  order?: number;
}

async function getSponsors(): Promise<Sponsor[]> {
  return client.fetch(
    `*[_type == "sponsor"] | order(order asc, name asc) {
      _id,
      name,
      logo,
      tier,
      website,
      order
    }`
  );
}

const tierOrder = ["platinum", "gold", "silver", "bronze"];

function groupByTier(sponsors: Sponsor[]): Record<string, Sponsor[]> {
  return sponsors.reduce(
    (acc, sponsor) => {
      const tier = sponsor.tier ?? "gold";
      if (!acc[tier]) acc[tier] = [];
      acc[tier].push(sponsor);
      return acc;
    },
    {} as Record<string, Sponsor[]>
  );
}

export default async function SponsorsPage() {
  const sponsors = await getSponsors();
  const grouped = groupByTier(sponsors);
  const hasSanitySponsors = sponsors.length > 0;

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-24 md:px-10 lg:px-16">
        <section data-anim="reveal-group" className="mb-16 text-center">
          <h1 data-anim="reveal-item" className="mb-4 text-4xl font-bold md:text-5xl">
            <T en="Sponsors" ko="후원사" />
          </h1>
          <p data-anim="reveal-item" className="mx-auto max-w-xl text-base text-gray">
            <T en="Your support makes Sigma Intelligence possible." ko="여러분의 후원이 Sigma Intelligence를 가능하게 합니다." />
          </p>
        </section>

        {hasSanitySponsors ? (
          <div className="space-y-16">
            {tierOrder.map((tier) => {
              const list = grouped[tier];
              if (!list?.length) return null;
              return (
                <section key={tier}>
                  <h2 className="mb-8 text-center text-sm font-semibold uppercase tracking-widest text-gray">
                    {tier}
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-10">
                    {list.map((sponsor) => (
                      <SponsorLogo key={sponsor._id} sponsor={sponsor} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <EmptySponsors />
        )}

        <section data-anim="reveal-group" className="mt-24 rounded-2xl border border-white/10 bg-white/5 px-8 py-12 text-center">
          <h2 data-anim="reveal-item" className="mb-4 text-2xl font-bold">
            <T en="Become a Sponsor" ko="후원사가 되세요" />
          </h2>
          <p data-anim="reveal-item" className="mx-auto mb-8 max-w-xl text-gray">
            <T
              en="Partner with Sigma Intelligence and support the next generation of robotics engineers at Seoul National University."
              ko="시그마 인텔리전스와 함께 서울대학교 차세대 로봇 엔지니어들을 후원해 주세요."
            />
          </p>
          <a
            href="mailto:record.snusigma@gmail.com"
            className="inline-block rounded-full bg-bright-red px-8 py-3 font-semibold text-white hover:bg-darker-red transition-colors"
          >
            <T en="Get in Touch" ko="문의하기" />
          </a>
        </section>
      </main>
      <Footer />
    </div>
  );
}

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const imageUrl = sponsor.logo
    ? urlFor(sponsor.logo).width(300).height(120).url()
    : null;

  const inner = imageUrl ? (
    <Image
      src={imageUrl}
      alt={sponsor.name}
      width={240}
      height={96}
      className="h-16 w-auto object-contain brightness-0 invert"
    />
  ) : (
    <span className="text-xl font-bold text-white">{sponsor.name}</span>
  );

  return sponsor.website ? (
    <a
      href={sponsor.website}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
    >
      {inner}
    </a>
  ) : (
    <div className="flex items-center justify-center opacity-80">{inner}</div>
  );
}

function EmptySponsors() {
  return (
    <section data-anim="reveal-group" className="py-20 text-center">
      <svg
        data-anim="reveal-item"
        className="mx-auto mb-6 h-14 w-14 opacity-25 text-neutral-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p data-anim="reveal-item" className="text-lg text-neutral-400">
        <T
          en="No sponsors listed yet. Be the first to sponsor us!"
          ko="등록된 후원사가 아직 없습니다. 첫 번째 후원사가 되어 주세요!"
        />
      </p>
    </section>
  );
}
