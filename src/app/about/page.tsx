import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { T } from "@/components/T";
import { getActivities } from "@/features/about/api/getActivities";
import ActivitiesGallery from "@/features/about/components/ActivitiesGallery";

export const metadata: Metadata = {
  title: "소개",
  description:
    "서울대학교 로봇동아리 시그마 인텔리전스 소개. 문제를 구조화하고, 직접 만들고, 실전에서 검증하는 서울대 로봇 동아리입니다.",
};

export default async function AboutPage() {
  const activities = await getActivities();

  return (
    <div>
      <Navbar />
      <main>
        <section>
          <p>
            <T en="About SIGMA" ko="시그마 소개" />
          </p>
          <h1>Sigma Intelligence</h1>
          <p>
            <T
              en="Sigma Intelligence at Seoul National University structures problems, builds solutions, and validates them in the field."
              ko="서울대학교 로봇 동아리 Sigma Intelligence는 문제를 구조화하고, 직접 만들고, 실전에서 검증하는 팀입니다."
            />
          </p>
        </section>

        <section>
          <h2>
            <T en="Activities" ko="활동" />
          </h2>
          <ActivitiesGallery activities={activities} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
