import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const leadership = [
  { role: "회장", name: "전여준" },
  { role: "부회장", name: "송희경" },
  { role: "관리부장", name: "조용우" },
  { role: "교육부장", name: "황인성" },
  { role: "프로젝트장", name: "이승현" },
  { role: "홍보부장", name: "전현태" },
  { role: "회계", name: "좌희주" },
];

const gallery = [
  "/images/about/sigma-img-p1-1.jpg",
  "/images/about/sigma-img-p1-2.jpg",
  "/images/about/sigma-img-p3-5.jpg",
  "/images/about/sigma-img-p3-7.jpg",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white text-dark dark:bg-dark dark:text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16 md:px-10 lg:px-16">
        <section className="mb-14">
          <p className="mb-3 inline-block rounded-full bg-bright-red/10 px-4 py-2 text-sm font-semibold text-bright-red">
            About SIGMA
          </p>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Sigma Intelligence</h1>
          <p className="max-w-3xl text-lg text-gray">
            서울대학교 로봇 동아리 Sigma Intelligence는 문제를 구조화하고,
            직접 만들고, 실전에서 검증하는 팀입니다. 아래는 현재 운영진입니다.
          </p>
        </section>

        <section className="mb-16">
          <h2 className="mb-6 text-2xl font-bold">운영진</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leadership.map((member) => (
              <div
                key={`${member.role}-${member.name}`}
                className="rounded-xl border border-gray/25 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5"
              >
                <p className="text-sm font-semibold text-bright-red">{member.role}</p>
                <p className="mt-1 text-lg font-bold">{member.name}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-6 text-2xl font-bold">활동 사진</h2>
          <p className="mb-6 text-gray">
            아래 이미지는 시그마 홍보 자료(시그마_홍보PPT.pdf)에서 발췌했습니다.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {gallery.map((src) => (
              <div
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
