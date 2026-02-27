"use client";

import Link from "next/link";
import { useState } from "react";
import { LangToggle } from "./LangToggle";
import { T } from "./T";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { nameEn: "About",    nameKo: "소개",      href: "/about" },
    { nameEn: "Projects", nameKo: "프로젝트",   href: "/projects" },
    { nameEn: "Sponsors", nameKo: "후원사",     href: "/sponsors" },
    { nameEn: "Members",  nameKo: "멤버",       href: "/members" },
    { nameEn: "Contact",  nameKo: "연락처",     href: "/contact" },
  ];

  return (
    <header data-nav="header" className="fixed left-0 top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-dark/70 border-b border-white/20 dark:border-white/10">
      <div data-nav="inner" className="container mx-auto flex flex-wrap items-center justify-between px-8 py-4 lg:px-16">
        {/* Logo */}
        <div className="relative z-50 max-w-[250px] pr-4">
          <Link href="/" className="text-2xl font-bold text-dark dark:text-white">
            Sigma <span className="text-bright-red">Intelligence</span>
          </Link>
        </div>

        {/* Mobile: toggle + hamburger */}
        <div className="flex items-center gap-3 lg:hidden">
          <LangToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative z-50 text-dark dark:text-white focus:outline-none"
            aria-label="Toggle menu"
          >
            <svg className="h-8 w-8 fill-current" viewBox="0 0 24 24">
              {isOpen ? (
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M18.278 16.864a1 1 0 0 1-1.414 1.414l-4.829-4.828-4.828 4.828a1 1 0 0 1-1.414-1.414l4.828-4.829-4.828-4.828a1 1 0 0 1 1.414-1.414l4.829 4.828 4.828-4.828a1 1 0 1 1 1.414 1.414l-4.828 4.829 4.828 4.828z"
                />
              ) : (
                <path
                  fillRule="evenodd"
                  d="M4 5h16a1 1 0 0 1 0 2H4a1 1 0 1 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2zm0 6h16a1 1 0 0 1 0 2H4a1 1 0 0 1 0-2z"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <div
          className={`fixed inset-0 z-40 flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-dark transition-all duration-300 lg:static lg:h-auto lg:w-auto lg:flex-row lg:bg-transparent lg:dark:bg-transparent ${
            isOpen ? "visible opacity-100" : "invisible opacity-0 lg:visible lg:opacity-100"
          }`}
        >
          <nav>
            <ul className="flex flex-col items-center space-y-6 lg:flex-row lg:space-x-8 lg:space-y-0">
              {navigation.map((item) => (
                <li key={item.nameEn}>
                  <Link
                    href={item.href}
                    className="font-medium text-dark hover:text-bright-red dark:text-white dark:hover:text-bright-red text-base transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <T en={item.nameEn} ko={item.nameKo} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Desktop lang toggle — far right */}
        <div className="hidden lg:flex items-center">
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
