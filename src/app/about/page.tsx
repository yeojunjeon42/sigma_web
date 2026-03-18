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
    <div className="min-h-screen bg-white text-dark dark:bg-dark dark:text-white">
      <Navbar />
      <main className="mx-auto w-full max-w-7xl px-4 pt-32 pb-16 sm:px-6 md:px-10 lg:px-16">
        <section data-anim="reveal-group" className="mb-14">
          <p data-anim="reveal-item" className="mb-3 inline-block rounded-full bg-bright-red/10 px-4 py-2 text-sm font-semibold text-bright-red">
            <T en="About SIGMA" ko="시그마 소개" />
          </p>
          <h1 data-anim="reveal-item" className="mb-4 text-3xl font-bold sm:text-4xl md:text-5xl">Sigma Intelligence</h1>
          <p data-anim="reveal-item" className="max-w-3xl text-base text-gray sm:text-lg">
            <T
              en="Sigma Intelligence at Seoul National University structures problems, builds solutions, and validates them in the field."
              ko="서울대학교 로봇 동아리 Sigma Intelligence는 문제를 구조화하고, 직접 만들고, 실전에서 검증하는 팀입니다."
            />
          </p>
        </section>

        <section data-anim="reveal-group">
          <h2 data-anim="reveal-item" className="mb-6 text-xl font-bold sm:text-2xl">
            <T en="Activities" ko="활동" />
          </h2>
          <ActivitiesGallery activities={activities} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
