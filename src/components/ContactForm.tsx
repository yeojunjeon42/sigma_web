"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { EMAIL } from "@/features/site/data/contact";

const ENDPOINT = "https://api.web3forms.com/submit";
const KEY = "88d928f1-f41f-4ec4-b59b-e3c66d04209c";

type Status = "idle" | "sending" | "sent" | "error";
type RequiredField = "name" | "email" | "message";
type Errors = Partial<Record<RequiredField, string>>;

const ARCHIVE_DRAFT = `I'd like to add a build to the archive.

Name:
Year:
Team:
Link (Google Drive or other):`;

const BLOG_DRAFT = `I'd like to write a post for the blog.

Title:
Author:
Article link (Google Drive or other):`;

const DRAFTS: Record<string, string> = { archive: ARCHIVE_DRAFT, blog: BLOG_DRAFT };

const FIELD = "group flex flex-col gap-y-xs";
const HEAD = "flex items-baseline justify-between text-caption text-ink-muted transition-colors group-focus-within:text-ink";
const BORDER = "border-b border-ink/30 transition-colors focus:border-ink focus:outline-none aria-invalid:border-accent aria-invalid:focus:border-accent";
const ENTRY = `block h-11 w-full bg-transparent text-title text-ink ${BORDER}`;

function Field({ id, label, note, error, className = "", children }: { id: string; label: string; note?: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`${FIELD} ${className}`}>
      <label htmlFor={id} className={HEAD}>
        <span className="u-trim">
          {label}
        </span>
        {note ? (
          <span className="u-trim">
            {note}
          </span>
        ) : null}
      </label>
      {children}
      {error && <p id={`${id}-error`} className="text-caption text-accent-deep">{error}</p>}
    </div>
  );
}

function SendButton({ children, type = "button", disabled = false, onClick }: { children: React.ReactNode; type?: "button" | "submit"; disabled?: boolean; onClick?: () => void }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="group/send inline-flex h-12 cursor-pointer items-center rounded-pill bg-ink px-lg text-body text-canvas transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-40"
    >
      <span className="u-trim block">
        {children}
        <span aria-hidden="true" className="ml-[0.4em] inline-block transition-transform group-hover/send:translate-x-0.5">↗</span>
      </span>
    </button>
  );
}

function fieldError(field: HTMLInputElement | HTMLTextAreaElement) {
  if (!field.value.trim()) {
    return field.name === "name" ? "Enter your name." : field.name === "email" ? "Enter your email address." : "Enter a message.";
  }
  if (field.validity.typeMismatch) return "Enter a valid email address.";
}

function fit(el: HTMLTextAreaElement | null) {
  if (!el || CSS.supports("field-sizing", "content")) return;
  el.style.overflowY = "hidden";
  el.style.height = "auto";
  el.style.height = `${el.scrollHeight}px`;
}

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [draft, setDraft] = useState("");
  const [stamp, setStamp] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const messageRef = useCallback((el: HTMLTextAreaElement | null) => {
    if (!el) return;
    const draft = DRAFTS[new URLSearchParams(window.location.search).get("about") ?? ""];
    if (!el.value && draft) el.value = draft;
    fit(el);
  }, []);

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    const fields = [...e.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[required]")];
    const nextErrors: Errors = {};
    for (const field of fields) {
      const error = fieldError(field);
      if (error) nextErrors[field.name as RequiredField] = error;
    }
    setErrors(nextErrors);
    const firstInvalid = fields.find((field) => nextErrors[field.name as RequiredField]);
    if (firstInvalid) {
      requestAnimationFrame(() => firstInvalid.focus());
      return;
    }
    const data = new FormData(e.currentTarget);
    const body = String(data.get("message") ?? "");
    const subject = `[Contact] ${String(data.get("name") ?? "")}`;
    setDraft(`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    data.append("access_key", KEY);
    data.append("subject", subject);
    data.append("from_name", "snusigma.net");
    setStatus("sending");
    try {
      // A stalled phone connection would otherwise leave it "sending" with no mailto fallback.
      const res = await fetch(ENDPOINT, { method: "POST", body: data, signal: AbortSignal.timeout?.(20000) });
      const json = await res.json();
      if (!json.success) throw new Error();
      const now = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setStamp(`${now.getFullYear()}.${p(now.getMonth() + 1)}.${p(now.getDate())} ${p(now.getHours())}:${p(now.getMinutes())}`);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex flex-col items-start gap-y-lg py-lg sm:flex-row sm:items-center sm:gap-x-xl">
        <Receipt stamp={stamp} />
        <div>
          <p className="text-display-md text-ink">
            Message sent
          </p>
          <p className="mt-md text-body text-ink">
            We’ll come back to you shortly.
          </p>
          <div className="mt-lg">
            <SendButton onClick={() => setStatus("idle")}>Send another</SendButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={send}
      onInput={(e) => {
        const field = e.target;
        if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement) || !field.required) return;
        const name = field.name as RequiredField;
        if (errors[name]) setErrors((previous) => ({ ...previous, [name]: fieldError(field) }));
      }}
      className="grid gap-y-lg md:grid-cols-2 md:gap-x-lg lg:grid-cols-7"
    >
      <Field id="contact-name" label="Name" error={errors.name} className="lg:col-span-4">
        <input
          id="contact-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "contact-name-error" : undefined}
          className={ENTRY}
        />
      </Field>

      <Field id="contact-email" label="Email" error={errors.email} className="lg:col-span-3">
        <input
          id="contact-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "contact-email-error" : undefined}
          className={ENTRY}
        />
      </Field>

      <Field id="contact-organisation" label="From" note="Optional" className="md:col-span-2 lg:col-span-7">
        <input id="contact-organisation" name="organisation" type="text" autoComplete="organization" className={ENTRY} />
      </Field>

      <Field id="contact-message" label="Message" error={errors.message} className="md:col-span-2 lg:col-span-7">
        <textarea
          id="contact-message"
          name="message"
          required
          rows={3}
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "contact-message-error" : undefined}
          ref={messageRef}
          onInput={(e) => fit(e.currentTarget)}
          className={`block min-h-[calc(3lh+var(--spacing-sm))] w-full resize-none bg-transparent py-xs text-title text-ink [field-sizing:content] ${BORDER}`}
        />
      </Field>

      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="mt-sm flex flex-wrap items-center gap-x-xl gap-y-sm md:col-span-2 lg:col-span-7">
        <SendButton type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Sending" : "Send message"}
        </SendButton>
        <p aria-live="polite" className="text-body-sm text-ink">
          {status === "error" ? (
            <>
              {"It could not be sent. "}
              <a
                href={draft}
                className="u-swipe-rest text-ink"
              >
                Open it as an email instead
              </a>
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}

const SIZE = 176;
const CELL = 4;
const MARK =
  "M119.69 274C75.08 274 33.13 252.17 7.47 215.59L0 204.94L97.03 137L0 69.06L7.47 58.41C33.13 21.84 75.08 0 119.69 0C164.3 0 206.25 21.84 231.91 58.41L210.63 73.34C189.83 43.7 155.84 26 119.69 26C87.91 26 57.8 39.68 36.85 63.13L142.36 137L36.85 210.87C57.8 234.32 87.91 248 119.69 248C155.84 248 189.83 230.3 210.63 200.66L231.91 215.59C206.25 252.17 164.3 274 119.69 274";

function Receipt({ stamp }: { stamp: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const g = canvas?.getContext("2d");
    if (!canvas || !g) return;
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const css = (n: string, f: string) =>
      getComputedStyle(document.documentElement).getPropertyValue(n).trim() || f;
    const accent = css("--color-accent", "#ed2024");

    const n = Math.floor(SIZE / CELL);
    const src = document.createElement("canvas");
    src.width = n * 3;
    src.height = n * 3;
    const s = src.getContext("2d", { willReadFrequently: true });
    if (!s) return;
    const u = src.width;
    s.fillStyle = "#fff";
    s.fillRect(0, 0, u, u);
    s.strokeStyle = "#000";
    s.lineWidth = u * 0.03;
    s.beginPath();
    s.arc(u / 2, u / 2, u * 0.46, 0, Math.PI * 2);
    s.stroke();
    s.save();
    s.translate(u * 0.5 - 119.69 * (u * 0.0015), u * 0.2);
    s.scale(u * 0.0015, u * 0.0015);
    s.fillStyle = "#000";
    s.fill(new Path2D(MARK));
    s.restore();
    const d = s.getImageData(0, 0, u, u).data;
    const tone = new Float32Array(n * n);
    for (let y = 0; y < n; y++)
      for (let x = 0; x < n; x++) {
        let sum = 0;
        for (let yy = 0; yy < 3; yy++)
          for (let xx = 0; xx < 3; xx++) sum += d[((y * 3 + yy) * u + x * 3 + xx) * 4];
        tone[y * n + x] = sum / 9 / 255;
      }

    let raf = 0;
    const t0 = performance.now();
    const draw = (now: number) => {
      const k = still ? 1 : Math.min(1, (now - t0) / 900);
      g.setTransform(2, 0, 0, 2, 0, 0);
      g.clearRect(0, 0, SIZE, SIZE);
      g.fillStyle = accent;
      for (let y = 0; y < n; y++)
        for (let x = 0; x < n; x++) {
          const local = Math.min(1, Math.max(0, k * 1.7 - (x / n) * 0.7));
          const r = (1 - tone[y * n + x]) * CELL * 0.52 * local;
          if (r < 0.2) continue;
          g.beginPath();
          g.arc((x + 0.5) * CELL, (y + 0.5) * CELL, r, 0, Math.PI * 2);
          g.fill();
        }
      if (k < 1) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [stamp]);

  return (
    <div aria-hidden="true" className="relative size-[176px] shrink-0 -rotate-6">
      <canvas ref={ref} width={SIZE * 2} height={SIZE * 2} className="size-full" />
      <p className="absolute inset-x-0 top-[66%] text-center font-mono text-[12px] leading-[1.35] text-accent tabular-nums">
        {stamp.split(" ")[0]}
        <br />
        {stamp.split(" ")[1]}
      </p>
    </div>
  );
}
