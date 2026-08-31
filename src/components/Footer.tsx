import Link from "next/link";

export default function Footer() {
  return (
    <footer>
      <Link href="/">Sigma Intelligence</Link>
      <p>Official website for Sigma Intelligence (SNU Robotics Club).</p>

      <ul>
        <li>
          Email:{" "}
          <a href="mailto:record.snusigma@gmail.com">record.snusigma@gmail.com</a>
        </li>
        <li>
          Phone: <a href="tel:010-8178-6206">+82-10-8178-6206</a>
        </li>
      </ul>

      <ul>
        <li>
          <a href="https://www.facebook.com/sigmaintelligence/">Facebook</a>
        </li>
        <li>
          <a href="https://www.linkedin.com/company/sigma-intelligence/">LinkedIn</a>
        </li>
        <li>
          <a href="https://www.instagram.com/sigma_intelligence_/">Instagram</a>
        </li>
      </ul>

      <nav>
        <h2>Useful Links</h2>
        <ul>
          <li>
            <Link href="/about">About</Link>
          </li>
          <li>
            <Link href="/projects">Projects</Link>
          </li>
          <li>
            <Link href="/#sponsors">Sponsors</Link>
          </li>
          <li>
            <Link href="/members">Members</Link>
          </li>
        </ul>
      </nav>

      <p>© {new Date().getFullYear()} Sigma Intelligence. All rights reserved.</p>
      <p>Powered by Yeojun Jeon.</p>
    </footer>
  );
}
