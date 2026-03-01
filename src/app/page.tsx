import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-dark text-dark dark:text-white">
      <Navbar />
      <main className="flex-grow">
        <Hero />
        {/* Placeholder for future sections */}
        <section className="py-20 bg-gray/5 dark:bg-dark/50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-8">Our Mission</h2>
            <p className="max-w-2xl mx-auto text-lg text-gray">
              To inspire and educate the next generation of roboticists through hands-on projects, competition, and collaboration.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
