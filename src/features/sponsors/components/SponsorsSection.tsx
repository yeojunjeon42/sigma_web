import Image from "next/image";
import { T } from "@/components/T";
import { urlFor } from "@/sanity/lib/image";
import type { Sponsor } from "../api/getSponsors";

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const imageUrl = sponsor.logo
    ? urlFor(sponsor.logo).width(600).fit("max").url()
    : null;

  const inner = imageUrl ? (
    <Image src={imageUrl} alt={sponsor.name} width={300} height={120} />
  ) : (
    <span>{sponsor.name}</span>
  );

  return sponsor.website ? (
    <a href={sponsor.website} target="_blank" rel="noopener noreferrer">
      {inner}
    </a>
  ) : (
    inner
  );
}

interface SponsorsSectionProps {
  sponsors: Sponsor[];
}

export function SponsorsSection({ sponsors }: SponsorsSectionProps) {
  return (
    <section id="sponsors">
      <h2>
        <T en="Sponsors" ko="후원사" />
      </h2>
      <p>
        <T
          en="Your support makes Sigma Intelligence possible. Interested in sponsoring us? Email us at record.snusigma@gmail.com"
          ko="여러분의 후원이 Sigma Intelligence를 가능하게 합니다. 후원에 관심이 있으신가요? 이메일: record.snusigma@gmail.com"
        />
      </p>

      {sponsors.length === 0 ? (
        <p>
          <T
            en="No sponsors listed yet. Be the first to sponsor us! record.snusigma@gmail.com"
            ko="등록된 후원사가 아직 없습니다. 첫 번째 후원사가 되어 주세요! 이메일: record.snusigma@gmail.com"
          />
        </p>
      ) : (
        <ul>
          {sponsors.map((sponsor) => (
            <li key={sponsor._id}>
              <SponsorLogo sponsor={sponsor} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
