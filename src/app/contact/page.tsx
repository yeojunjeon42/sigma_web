import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { T } from "@/components/T";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "연락처",
  description:
    "시그마 인텔리전스 연락처. 서울대학교 로봇동아리에 문의, 협업, 후원 관련 연락.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white text-dark dark:bg-dark dark:text-white">
      <Navbar />
      <main className="container mx-auto px-6 pt-32 pb-16 md:px-10 lg:px-16">
        <section data-anim="reveal-group" className="mb-14">
          <p data-anim="reveal-item" className="mb-3 inline-block rounded-full bg-bright-red/10 px-4 py-2 text-sm font-semibold text-bright-red">
            <T en="Reach Out" ko="문의하기" />
          </p>
          <h1 data-anim="reveal-item" className="mb-4 text-4xl font-bold md:text-5xl">
            <T en="Contact" ko="연락처" />
          </h1>
          <p data-anim="reveal-item" className="max-w-2xl text-lg text-gray">
            <T
              en="Have a question, want to collaborate, or interested in sponsoring? We'd love to hear from you."
              ko="질문이 있거나 협업을 원하시거나 후원에 관심이 있으신가요? 언제든지 연락해 주세요."
            />
          </p>
        </section>

        <div data-anim="reveal-group" className="grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          <section data-anim="reveal-item" className="space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="mb-2 text-lg font-semibold"><T en="Email" ko="이메일" /></h2>
              <a
                href="mailto:record.snusigma@gmail.com"
                className="text-bright-red hover:text-darker-red transition-colors"
              >
                record.snusigma@gmail.com
              </a>
              <a
                href="tel:010-8178-6206"
                className="text-bright-red hover:text-darker-red transition-colors"
              >
                +82-10-8178-6206
              </a>
            </div>
            <div>
              <h2 className="mb-2 text-lg font-semibold"><T en="Location" ko="위치" /></h2>
              <p className="text-gray">Seoul National University</p>
              <p className="text-gray">Seoul, South Korea</p>
            </div>
            <div>
              <h2 className="mb-4 text-lg font-semibold"><T en="Follow Us" ko="팔로우" /></h2>
              <div className="flex gap-4">
                <a
                  href="https://www.instagram.com/sigma_intelligence_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gray/10 text-dark hover:bg-bright-red hover:text-white dark:bg-white/10 dark:text-white transition-colors"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.069-4.85.069-3.204 0-3.584-.012-4.849-.069-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                  <span className="sr-only">Instagram</span>
                </a>
                <a
                  href="https://www.linkedin.com/company/sigma-intelligence/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gray/10 text-dark hover:bg-bright-red hover:text-white dark:bg-white/10 dark:text-white transition-colors"
                >
                  <img src="/icons/linkedin-svgrepo-com.svg" alt="LinkedIn" className="h-5 w-5" />
                  <span className="sr-only">LinkedIn</span>
                </a>
                <a
                  href="https://www.facebook.com/sigmaintelligence/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-gray/10 text-dark hover:bg-bright-red hover:text-white dark:bg-white/10 dark:text-white transition-colors"
                >
                  <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span className="sr-only">Facebook</span>
                </a>
              </div>
            </div>
          </section>

          {/* Contact Form */}
          <section data-anim="reveal-item">
            <ContactForm />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
