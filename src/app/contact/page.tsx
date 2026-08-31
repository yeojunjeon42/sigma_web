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
    <div>
      <Navbar />
      <main>
        <section>
          <p>
            <T en="Reach Out" ko="문의하기" />
          </p>
          <h1>
            <T en="Contact" ko="연락처" />
          </h1>
          <p>
            <T
              en="Have a question, want to collaborate, or interested in sponsoring? We'd love to hear from you."
              ko="질문이 있거나 협업을 원하시거나 후원에 관심이 있으신가요? 언제든지 연락해 주세요."
            />
          </p>
        </section>

        <section>
          <h2>
            <T en="Email" ko="이메일" />
          </h2>
          <ul>
            <li>
              <a href="mailto:record.snusigma@gmail.com">
                record.snusigma@gmail.com
              </a>
            </li>
            <li>
              <a href="tel:010-8178-6206">+82-10-8178-6206</a>
            </li>
          </ul>

          <h2>
            <T en="Location" ko="위치" />
          </h2>
          <p>Seoul National University</p>
          <p>Seoul, South Korea</p>

          <h2>
            <T en="Follow Us" ko="팔로우" />
          </h2>
          <ul>
            <li>
              <a
                href="https://www.instagram.com/sigma_intelligence_/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/sigma-intelligence/"
                target="_blank"
                rel="noopener noreferrer"
              >
                LinkedIn
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/sigmaintelligence/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </li>
          </ul>
        </section>

        <section>
          <ContactForm />
        </section>
      </main>
      <Footer />
    </div>
  );
}
