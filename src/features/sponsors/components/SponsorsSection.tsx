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
          en="No sponsors listed yet. Be the first to sponsor us! record.snusigma@gmail.com"
          ko="등록된 후원사가 아직 없습니다. 첫 번째 후원사가 되어 주세요! 이메일: record.snusigma@gmail.com"
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
              en="Your support makes Sigma Intelligence possible. Interested in sponsoring us? Email us at record.snusigma@gmail.com"
              ko="여러분의 후원이 Sigma Intelligence를 가능하게 합니다. 후원에 관심이 있으신가요? 이메일: record.snusigma@gmail.com"
            />
          </p>
        </div>

        <div
          data-anim="reveal-group"
          className="rounded-2xl border border-white/10 bg-white/5 px-8 py-10 text-center"
        >

          {hasSponsors ? (
            <div className="mb-8 space-y-4">
              {TIER_ORDER.map((tier) => {
                const list = grouped[tier];
                if (!list?.length) return null;
                return (
                  <div key={tier} data-anim="reveal-item">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-gray">
                      {tier}
                    </p>
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
        </div>
      </div>
    </section>
  );
}
