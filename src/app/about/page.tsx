import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { T } from "@/components/T";
import { getActivities } from "@/features/about/api/getActivities";
import ActivitiesGallery from "@/features/about/components/ActivitiesGallery";

const gallery = [
  "/images/about/sigma-img-p1-1.jpg",
  "/images/about/sigma-img-p1-2.jpg",
  "/images/about/sigma-img-p3-5.jpg",
  "/images/about/sigma-img-p3-7.jpg",
];

export default async function AboutPage() {
  const activities = await getActivities();

  return (
    <div className="min-h-screen bg-white text-dark dark:bg-dark dark:text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16 md:px-10 lg:px-16">
        <section data-anim="reveal-group" className="mb-14">
          <p data-anim="reveal-item" className="mb-3 inline-block rounded-full bg-bright-red/10 px-4 py-2 text-sm font-semibold text-bright-red">
            <T en="About SIGMA" ko="시그마 소개" />
          </p>
          <h1 data-anim="reveal-item" className="mb-4 text-4xl font-bold md:text-5xl">Sigma Intelligence</h1>
          <p data-anim="reveal-item" className="max-w-3xl text-lg text-gray">
            <T
              en="Sigma Intelligence at Seoul National University structures problems, builds solutions, and validates them in the field."
              ko="서울대학교 로봇 동아리 Sigma Intelligence는 문제를 구조화하고, 직접 만들고, 실전에서 검증하는 팀입니다."
            />
          </p>
        </section>

        <section data-anim="reveal-group" className="mb-16">
          <h2 data-anim="reveal-item" className="mb-6 text-2xl font-bold">
            <T en="Activities" ko="활동" />
          </h2>
          <ActivitiesGallery activities={activities} />
        </section>

        <section data-anim="reveal-group">
          <h2 data-anim="reveal-item" className="mb-6 text-2xl font-bold"><T en="Gallery" ko="활동 사진" /></h2>
          <p data-anim="reveal-item" className="mb-6 text-gray">
            <T
              en="Images from Sigma Intelligence promotional materials."
              ko="아래 이미지는 시그마 홍보 자료(시그마_홍보PPT.pdf)에서 발췌했습니다."
            />
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {gallery.map((src) => (
              <div
                data-anim="reveal-item"
                key={src}
                className="overflow-hidden rounded-xl border border-gray/20 bg-gray/5 dark:border-white/10 dark:bg-white/5"
              >
                <Image
                  src={src}
                  alt="Sigma promotional material"
                  width={1400}
                  height={900}
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
