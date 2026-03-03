import Image from "next/image";
import { T } from "@/components/T";
import { urlFor } from "@/sanity/lib/image";
import type { Sponsor } from "../api/getSponsors";

const TIER_ORDER = ["platinum", "gold", "silver", "bronze"] as const;

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
    <div data-anim="reveal-group" className="py-12 text-center">
      <svg
        data-anim="reveal-item"
        className="mx-auto mb-4 h-12 w-12 opacity-25 text-neutral-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p data-anim="reveal-item" className="text-base text-neutral-400">
        <T
          en="No sponsors listed yet. Be the first to sponsor us!"
          ko="등록된 후원사가 아직 없습니다. 첫 번째 후원사가 되어 주세요!"
        />
      </p>
    </div>
  );
}

interface SponsorsSectionProps {
  sponsors: Sponsor[];
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  const grouped = groupByTier(sponsors);
  const hasSponsors = sponsors.length > 0;

  return (
    <section
      id="sponsors"
      data-anim="reveal-group"
      className="py-24 bg-dark"
    >
      <div className="container mx-auto px-6 md:px-10 lg:px-16">
        <div className="mb-12 text-center">
          <h2 data-anim="reveal-item" className="mb-4 text-3xl font-bold text-white">
            <T en="Sponsors" ko="후원사" />
          </h2>
          <p data-anim="reveal-item" className="mx-auto max-w-xl text-base text-gray">
            <T
              en="Your support makes Sigma Intelligence possible."
              ko="여러분의 후원이 Sigma Intelligence를 가능하게 합니다."
            />
          </p>
        </div>

        {hasSponsors ? (
          <div className="space-y-12">
            {TIER_ORDER.map((tier) => {
              const list = grouped[tier];
              if (!list?.length) return null;
              return (
                <div key={tier} data-anim="reveal-item">
                  <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-gray">
                    {tier}
                  </h3>
                  <div className="flex flex-wrap items-center justify-center gap-10">
                    {list.map((sponsor) => (
                      <SponsorLogo key={sponsor._id} sponsor={sponsor} />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptySponsors />
        )}

        <div
          data-anim="reveal-group"
          className="mt-16 rounded-2xl border border-white/10 bg-white/5 px-8 py-10 text-center"
        >
          <h3 data-anim="reveal-item" className="mb-3 text-xl font-bold">
            <T en="Become a Sponsor" ko="후원사가 되세요" />
          </h3>
          <p data-anim="reveal-item" className="mx-auto mb-6 max-w-xl text-gray">
            <T
              en="Partner with Sigma Intelligence and support the next generation of robotics engineers at Seoul National University."
              ko="시그마 인텔리전스와 함께 서울대학교 차세대 로봇 엔지니어들을 후원해 주세요."
            />
          </p>
          <a
            href="mailto:record.snusigma@gmail.com"
            className="inline-block rounded-full bg-bright-red px-8 py-3 font-semibold text-white transition-colors hover:bg-darker-red"
          >
            <T en="Get in Touch" ko="문의하기" />
          </a>
        </div>
      </div>
    </section>
  );
}
