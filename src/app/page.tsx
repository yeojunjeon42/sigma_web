import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import { T } from "@/components/T";


export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-dark text-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        {/* Placeholder for future sections */}
        <section data-anim="reveal-group" className="py-24 bg-dark">
          <div className="container mx-auto px-6 text-center md:px-10 lg:px-16">
            <h2 data-anim="reveal-item" className="mb-6 text-3xl font-bold text-white">
              <T en="Our Mission" ko="우리의 미션" />
            </h2>
            <p data-anim="reveal-item" className="mx-auto max-w-2xl text-lg text-gray">
              <T
                en="To inspire and educate the next generation of roboticists through hands-on projects, competition, and collaboration."
                ko="실전 프로젝트, 대회, 협업을 통해 차세대 로봇 공학자들을 양성하고 영감을 줍니다."
              />
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
