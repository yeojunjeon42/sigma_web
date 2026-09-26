"use client";

import { useEffect, useRef, useState } from "react";
import { EMAIL } from "@/features/site/data/contact";

const ENDPOINT = "https://api.web3forms.com/submit";
const KEY = "43dcbf5f-1d3d-45bc-acd1-61606eba946c";

type Status = "idle" | "sending" | "sent" | "error";

const ARCHIVE_DRAFT = `I'd like to add a build to the archive.

Name of the build:
Year:
Team (names and 학번):
What it does, in a few lines:
Photos or links:`;

const BLOG_DRAFT = `I'd like to write a post for the blog.

Working title:
What it's about, in a few lines:
Who's writing (names and 학번):`;

const DRAFTS: Record<string, string> = { archive: ARCHIVE_DRAFT, blog: BLOG_DRAFT };

const FIELD = "group flex flex-col gap-y-xs";
const HEAD = "flex items-baseline justify-between text-caption text-ink-muted transition-colors group-focus-within:text-ink";
const ENTRY = "block h-11 w-full border-b border-ink/30 bg-transparent text-title text-ink transition-colors focus:border-ink focus:outline-none";

function Field({ label, note, className = "", children }: { label: string; note?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`${FIELD} ${className}`}>
      <span className={HEAD}>
        <span className="u-trim">
          {label}
        </span>
        {note ? (
          <span className="u-trim">
            {note}
          </span>
        ) : null}
      </span>
      {children}
    </label>
  );
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

  async function send(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = String(data.get("message") ?? "");
    const subject = `[Contact] ${String(data.get("name") ?? "")}`;
    setDraft(`mailto:${EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    data.append("access_key", KEY);
    data.append("subject", subject);
    data.append("from_name", "sigmaintelligence.org");
    setStatus("sending");
    try {
      const res = await fetch(ENDPOINT, { method: "POST", body: data });
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
          <p className="mt-md">
            <button
              type="button"
              onClick={() => setStatus("idle")}
              className="u-swipe-rest relative cursor-pointer text-ui text-ink uppercase before:absolute before:inset-x-0 before:top-1/2 before:h-11 before:-translate-y-1/2 lg:before:hidden"
            >
              Send another
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={send} className="grid gap-y-lg md:grid-cols-2 md:gap-x-lg lg:grid-cols-7">
      <Field label={"Name"} className="lg:col-span-4">
        <input name="name" type="text" required autoComplete="name" className={ENTRY} />
      </Field>

      <Field label={"Email"} className="lg:col-span-3">
        <input name="email" type="email" required autoComplete="email" className={ENTRY} />
      </Field>

      <Field label={"From"} note={"Optional"} className="md:col-span-2 lg:col-span-7">
        <input name="organisation" type="text" autoComplete="organization" className={ENTRY} />
      </Field>

      <Field label={"Message"} className="md:col-span-2 lg:col-span-7">
        <textarea
          name="message"
          required
          rows={3}
          ref={(el) => {
            const draft = DRAFTS[new URLSearchParams(window.location.search).get("about") ?? ""];
            if (el && !el.value && draft) {
              el.value = draft;
            }
            fit(el);
          }}
          onInput={(e) => fit(e.currentTarget)}
          className="block min-h-[calc(3lh+var(--spacing-sm))] w-full resize-none border-b border-ink/30 bg-transparent py-xs text-title text-ink transition-colors [field-sizing:content] focus:border-ink focus:outline-none"
        />
      </Field>

      <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" className="hidden" />

      <div className="mt-sm flex flex-wrap items-center gap-x-xl gap-y-sm md:col-span-2 lg:col-span-7">
        <button
          type="submit"
          disabled={status === "sending"}
          className="group/send inline-flex h-12 cursor-pointer items-center rounded-pill bg-ink px-lg text-body text-canvas transition-opacity hover:opacity-80 disabled:cursor-default disabled:opacity-40"
        >
          <span className="u-trim block">
            {status === "sending" ? (
              "Sending"
            ) : (
              "Send message"
            )}
            <span
              aria-hidden="true"
              className="ml-[0.4em] inline-block transition-transform group-hover/send:translate-x-0.5"
            >
              ↗
            </span>
          </span>
        </button>
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
