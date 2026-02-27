import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ProjectsPage() {
  return (
    <div className="min-h-screen bg-white text-dark dark:bg-dark dark:text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16 md:px-10 lg:px-16">
        <section className="mb-14">
          <p className="mb-3 inline-block rounded-full bg-bright-red/10 px-4 py-2 text-sm font-semibold text-bright-red">
            What We Build
          </p>
          <h1 className="mb-4 text-4xl font-bold md:text-5xl">Projects</h1>
          <p className="max-w-3xl text-lg text-gray">
            From autonomous ground vehicles to robotic arms, Sigma Intelligence takes
            on complex engineering challenges and competes at the highest levels.
          </p>
        </section>

        <section className="py-24 text-center text-gray">
          <svg
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
          <p className="text-lg">Projects coming soon.</p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
