import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { T } from "@/components/T";
import { getProjects } from "@/features/projects/api/getProjects";
import ProjectsGallery from "@/features/projects/components/ProjectsGallery";

export const metadata: Metadata = {
  title: "프로젝트",
  description:
    "시그마 인텔리전스 프로젝트. 자율주행 차량, 로봇팔 등 서울대 로봇동아리의 엔지니어링 도전.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div>
      <Navbar />
      <main>
        <section>
          <p>
            <T en="What We Build" ko="우리가 만드는 것" />
          </p>
          <h1>
            <T en="Projects" ko="프로젝트" />
          </h1>
        </section>

        <ProjectsGallery projects={projects} />
      </main>
      <Footer />
    </div>
  );
}
