import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { T } from "@/components/T";
import { getProjects } from "@/features/projects/api/getProjects";
import ProjectsGallery from "@/features/projects/components/ProjectsGallery";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="min-h-screen bg-dark text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16 md:px-10 lg:px-16">
        <section data-anim="reveal-group" className="mb-14">
          <p
            data-anim="reveal-item"
            className="mb-3 inline-block rounded-full bg-bright-red/10 px-4 py-2 text-sm font-semibold text-bright-red"
          >
            <T en="What We Build" ko="우리가 만드는 것" />
          </p>
          <h1
            data-anim="reveal-item"
            className="mb-4 text-4xl font-bold md:text-5xl"
          >
            <T en="Projects" ko="프로젝트" />
          </h1>
          <p
            data-anim="reveal-item"
            className="max-w-3xl text-lg text-neutral-400"
          >
            <T
              en="From autonomous ground vehicles to robotic arms, Sigma Intelligence takes on complex engineering challenges and competes at the highest levels."
              ko="자율 주행 차량부터 로봇 팔까지, 시그마 인텔리전스는 복잡한 엔지니어링 과제에 도전하며 최고의 무대에서 경쟁합니다."
            />
          </p>
        </section>

        <ProjectsGallery projects={projects} />
      </main>
      <Footer />
    </div>
  );
}
