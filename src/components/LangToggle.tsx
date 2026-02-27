"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LangToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center rounded-full border border-gray/20 bg-white/5 p-0.5 text-sm font-semibold backdrop-blur-sm dark:border-white/10">
      <button
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
        className={`rounded-full px-3 py-1 transition-colors ${
          lang === "en"
            ? "bg-bright-red text-white"
            : "text-gray hover:text-dark dark:hover:text-white"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ko")}
        aria-pressed={lang === "ko"}
        className={`rounded-full px-3 py-1 transition-colors ${
          lang === "ko"
            ? "bg-bright-red text-white"
            : "text-gray hover:text-dark dark:hover:text-white"
        }`}
      >
        한
      </button>
    </div>
  );
}
