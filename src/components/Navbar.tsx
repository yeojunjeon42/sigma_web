import Link from "next/link";
import { LangToggle } from "./LangToggle";

const navigation = [
  { name: "About", href: "/about" },
  { name: "Projects", href: "/projects" },
  { name: "Sponsors", href: "/#sponsors" },
  { name: "Members", href: "/members" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  return (
    <header>
      <Link href="/">SIGMA Intelligence</Link>
      <nav>
        <ul>
          {navigation.map((item) => (
            <li key={item.name}>
              <Link href={item.href}>{item.name}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <LangToggle />
    </header>
  );
}
