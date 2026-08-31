"use client";

import { useState } from "react";
import { T, useT } from "@/components/T";

type Status = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const tr = useT();
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "43dcbf5f-1d3d-45bc-acd1-61606eba946c");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setStatus(data.success ? "success" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div>
        <p>
          <T en="Message sent!" ko="메시지가 전송되었습니다!" />
        </p>
        <p>
          <T en="We'll get back to you soon." ko="곧 연락드리겠습니다." />
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">
          <T en="Name" ko="이름" />
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          placeholder={tr("Your name", "이름을 입력하세요")}
        />
      </div>
      <div>
        <label htmlFor="email">
          <T en="Email" ko="이메일" />
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder={tr("you@example.com", "email@example.com")}
        />
      </div>
      <div>
        <label htmlFor="message">
          <T en="Message" ko="메시지" />
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          required
          placeholder={tr(
            "Your inquiry will be sent to the president via email.",
            "문의 내용은 회장에게 이메일로 갑니다.",
          )}
        />
      </div>
      {status === "error" && (
        <p>
          <T
            en="Something went wrong. Please try again."
            ko="오류가 발생했습니다. 다시 시도해 주세요."
          />
        </p>
      )}
      <button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? (
          <T en="Sending…" ko="전송 중…" />
        ) : (
          <T en="Send Message" ko="메시지 보내기" />
        )}
      </button>
    </form>
  );
}
