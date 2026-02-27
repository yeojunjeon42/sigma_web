import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { T } from "@/components/T";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white text-dark dark:bg-dark dark:text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16 md:px-10 lg:px-16">
        <section data-anim="reveal-group" className="mb-14">
          <p data-anim="reveal-item" className="mb-3 inline-block rounded-full bg-bright-red/10 px-4 py-2 text-sm font-semibold text-bright-red">
            <T en="What We Build" ko="우리가 만드는 것" />
          </p>
          <h1 data-anim="reveal-item" className="mb-4 text-4xl font-bold md:text-5xl"><T en="Projects" ko="프로젝트" /></h1>
          <p data-anim="reveal-item" className="max-w-3xl text-lg text-gray">
            <T
              en="From autonomous ground vehicles to robotic arms, Sigma Intelligence takes on complex engineering challenges and competes at the highest levels."
              ko="자율 주행 차량부터 로봇 팔까지, 시그마 인텔리전스는 복잡한 엔지니어링 과제에 도전하며 최고의 무대에서 경쟁합니다."
            />
          </p>
        </section>

        <section data-anim="reveal-group" className="py-24 text-center text-gray">
          <svg
            data-anim="reveal-item"
            className="mx-auto mb-6 h-16 w-16 opacity-30"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          <p data-anim="reveal-item" className="text-lg"><T en="Projects coming soon." ko="프로젝트 정보가 곧 업데이트됩니다." /></p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
