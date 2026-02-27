import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { client } from "@/sanity/lib/client";
import { urlFor } from "@/sanity/lib/image";

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
          <h1 data-anim="reveal-item" className="mb-4 text-4xl font-bold md:text-5xl">Sponsors</h1>
          <p data-anim="reveal-item" className="mx-auto max-w-xl text-base text-gray">
            Your support makes Sigma Intelligence possible.
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
          <FallbackSponsors />
        )}

        <section data-anim="reveal-group" className="mt-24 rounded-2xl border border-white/10 bg-white/5 px-8 py-12 text-center">
          <h2 data-anim="reveal-item" className="mb-4 text-2xl font-bold">Become a Sponsor</h2>
          <p data-anim="reveal-item" className="mx-auto mb-8 max-w-xl text-gray">
            Partner with Sigma Intelligence and support the next generation of
            robotics engineers at Seoul National University.
          </p>
          <a
            href="mailto:record.snusigma@gmail.com"
            className="inline-block rounded-full bg-bright-red px-8 py-3 font-semibold text-white hover:bg-darker-red transition-colors"
          >
            Get in Touch
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

function FallbackSponsors() {
  const placeholders = [
    { id: "aptiv", label: "• A P T I V •", style: "text-2xl font-bold tracking-widest" },
    { id: "maxon", label: "maxon", style: "text-3xl font-bold italic text-red-500" },
    {
      id: "edgerton",
      label: "EDGERTON CENTER",
      style: "text-xl font-bold tracking-wide",
    },
    { id: "gm", label: "General Motors", style: "text-2xl font-semibold text-blue-400" },
  ];

  return (
    <div className="space-y-12">
      <div className="flex flex-wrap items-center justify-center gap-16">
        {placeholders.slice(0, 3).map((s) => (
          <div
            key={s.id}
            className="flex h-24 min-w-[180px] items-center justify-center opacity-80"
          >
            <span className={s.style}>{s.label}</span>
          </div>
        ))}
      </div>
      <div className="flex justify-center">
        <div className="flex h-24 min-w-[180px] items-center justify-center opacity-80">
          <span className={placeholders[3].style}>{placeholders[3].label}</span>
        </div>
      </div>
    </div>
  );
}
