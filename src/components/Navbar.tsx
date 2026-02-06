"use client";

import Link from "next/link";
import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const navigation = [
    { name: "About", href: "/about" },
    { name: "Projects", href: "/projects" },
    { name: "Sponsors", href: "/sponsors" },
    { name: "Members", href: "/members" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="absolute left-0 top-0 z-50 w-full bg-transparent">
      <div className="container mx-auto flex flex-wrap items-center justify-between px-4 py-4 lg:px-8">
        {/* Logo */}
        <div className="relative z-50 max-w-[250px] pr-4">
          <Link href="/" className="text-2xl font-bold text-dark dark:text-white">
            Sigma<span className="text-bright-red">Intelligence</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative z-50 block lg:hidden text-dark dark:text-white focus:outline-none"
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

        {/* Navigation Menu */}
        <div
          className={`fixed inset-0 z-40 flex h-screen w-full flex-col items-center justify-center bg-white dark:bg-dark transition-all duration-300 lg:static lg:h-auto lg:w-auto lg:flex-row lg:bg-transparent lg:dark:bg-transparent ${
            isOpen ? "visible opacity-100" : "invisible opacity-0 lg:visible lg:opacity-100"
          }`}
        >
          <nav>
            <ul className="flex flex-col items-center space-y-6 lg:flex-row lg:space-x-8 lg:space-y-0">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="font-medium text-dark hover:text-bright-red dark:text-white dark:hover:text-bright-red text-base transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}
