"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LangToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div>
      <button onClick={() => setLang("en")} aria-pressed={lang === "en"}>
        EN
      </button>
      <button onClick={() => setLang("ko")} aria-pressed={lang === "ko"}>
        한
      </button>
    </div>
  );
}
