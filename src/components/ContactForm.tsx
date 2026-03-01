"use client";

import { useT } from "@/components/T";
import { T } from "@/components/T";

export function ContactForm() {
  const tr = useT();

  return (
    <form className="space-y-5">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-dark dark:text-white"
        >
          <T en="Name" ko="이름" />
        </label>
        <input
          id="name"
          type="text"
          placeholder={tr("Your name", "이름을 입력하세요")}
          className="w-full rounded-lg border border-gray/30 bg-white px-4 py-3 text-dark placeholder-gray/60 outline-none focus:border-bright-red dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray/50"
        />
      </div>
      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-dark dark:text-white"
        >
          <T en="Email" ko="이메일" />
        </label>
        <input
          id="email"
          type="email"
          placeholder={tr("you@example.com", "email@example.com")}
          className="w-full rounded-lg border border-gray/30 bg-white px-4 py-3 text-dark placeholder-gray/60 outline-none focus:border-bright-red dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray/50"
        />
      </div>
      <div>
        <label
          htmlFor="message"
          className="mb-1.5 block text-sm font-medium text-dark dark:text-white"
        >
          <T en="Message" ko="메시지" />
        </label>
        <textarea
          id="message"
          rows={5}
          placeholder={tr("Tell us about your inquiry...", "문의 내용을 입력해 주세요...")}
          className="w-full resize-none rounded-lg border border-gray/30 bg-white px-4 py-3 text-dark placeholder-gray/60 outline-none focus:border-bright-red dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-gray/50"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-lg bg-bright-red px-6 py-3 font-semibold text-white hover:bg-darker-red transition-colors"
      >
        <T en="Send Message" ko="메시지 보내기" />
      </button>
    </form>
  );
}
