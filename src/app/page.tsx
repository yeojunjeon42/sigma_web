import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Hero from "@/features/hero/Hero";
import Footer from "@/components/Footer";
import { T } from "@/components/T";
import { getHero } from "@/features/hero/api/getHero";
import { getSponsors } from "@/features/sponsors/api/getSponsors";
import { SponsorsSection } from "@/features/sponsors/components/SponsorsSection";
import { urlFor } from "@/sanity/lib/image";

export const metadata: Metadata = {
  title: "시그마 | 서울대학교 로봇동아리",
  description:
    "서울대학교 로봇동아리 시그마 인텔리전스(Sigma Intelligence) 공식 웹사이트. 1984년 설립된 국내 최초 대학 로봇 동아리.",
};

export default async function Home() {
  const [hero, sponsors] = await Promise.all([getHero(), getSponsors()]);
  const backgroundImageUrl = hero?.backgroundImage
    ? urlFor(hero.backgroundImage).url()
    : null;

  return (
    <div>
      <Navbar />
      <main>
        <Hero backgroundImageUrl={backgroundImageUrl} />
        <section>
          <h2>
            <T en="Our Mission" ko="우리의 미션" />
          </h2>
          <p>
            <T
              en="To inspire and educate the next generation of roboticists through hands-on projects, competition, and collaboration."
              ko="실전 프로젝트, 대회, 협업을 통해 차세대 로봇 공학자들을 양성하고 영감을 줍니다."
            />
          </p>
        </section>
        <SponsorsSection sponsors={sponsors} />
      </main>
      <Footer />
    </div>
  );
}
