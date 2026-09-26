import type { CSSProperties } from "react";

const EDGE =
  "polygon(0% 8%, 3% 0%, 6% 10%, 9% 2%, 12% 6%, 88% 4%, 91% 0%, 94% 9%, 97% 3%, 100% 10%, 100% 90%, 97% 100%, 94% 92%, 91% 99%, 88% 94%, 12% 97%, 9% 91%, 6% 100%, 3% 93%, 0% 98%)";
const GRAIN =
  "repeating-linear-gradient(95deg, rgb(255 255 255 / 0.14) 0 2px, transparent 2px 5px), repeating-linear-gradient(8deg, rgb(0 0 0 / 0.04) 0 1px, transparent 1px 4px)";

export type TapeKind = "paper" | "accent" | "stripe" | "dots" | "grid";

const FILL: Record<TapeKind, CSSProperties> = {
  paper: { backgroundColor: "rgb(232 226 208 / 0.82)", backgroundImage: GRAIN },
  accent: { backgroundColor: "rgb(196 120 110 / 0.62)", backgroundImage: GRAIN },
  stripe: {
    backgroundColor: "rgb(236 232 220 / 0.8)",
    backgroundImage: "repeating-linear-gradient(135deg, rgb(142 19 22 / 0.28) 0 5px, transparent 5px 12px)",
  },
  dots: {
    backgroundColor: "rgb(214 219 206 / 0.78)",
    backgroundImage: "radial-gradient(rgb(15 13 9 / 0.28) 1.2px, transparent 1.6px)",
    backgroundSize: "8px 8px",
  },
  grid: {
    backgroundColor: "rgb(226 224 236 / 0.8)",
    backgroundImage:
      "linear-gradient(rgb(35 58 139 / 0.18) 1px, transparent 1px), linear-gradient(90deg, rgb(35 58 139 / 0.18) 1px, transparent 1px)",
    backgroundSize: "7px 7px",
  },
};

export function Tape({ kind, className, turn = 0, width = "34%" }: { kind: TapeKind; className: string; turn?: number; width?: string }) {
  return (
    <span aria-hidden="true" className={`absolute z-10 block ${className}`} style={{ width }}>
      <span
        className="block aspect-[10/3] drop-shadow-[0_1px_1px_rgb(0_0_0/0.18)]"
        style={{ clipPath: EDGE, transform: `rotate(${turn}deg)`, ...FILL[kind] }}
      />
    </span>
  );
}

export function Pin({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 40 48" className={`absolute z-10 w-7 ${className}`}>
      <defs>
        <radialGradient id="pin-head" cx="0.35" cy="0.3" r="0.75">
          <stop offset="0" stopColor="#ff8a8c" />
          <stop offset="0.45" stopColor="#ed2024" />
          <stop offset="1" stopColor="#7d0e10" />
        </radialGradient>
      </defs>
      <ellipse cx="24" cy="44" rx="9" ry="3" fill="rgb(0 0 0 / 0.22)" />
      <path d="M19 22 L24 44" stroke="#9ea1a6" strokeWidth="2" strokeLinecap="round" />
      <ellipse cx="18" cy="23" rx="8" ry="3.4" fill="#a3080c" />
      <path d="M12 12 C12 6, 24 6, 24 12 L23 22 L13 22 Z" fill="url(#pin-head)" />
      <circle cx="18" cy="9" r="8.5" fill="url(#pin-head)" />
      <ellipse cx="15" cy="6" rx="2.6" ry="1.6" fill="#fff" opacity="0.7" />
    </svg>
  );
}

export function PaperClip({ className }: { className: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 22 64" className={`absolute z-10 w-4 drop-shadow-[0_1px_1px_rgb(0_0_0/0.3)] ${className}`}>
      <defs>
        <linearGradient id="paperclip" x1="0" x2="1">
          <stop offset="0" stopColor="#7c8087" />
          <stop offset="0.5" stopColor="#eef0f2" />
          <stop offset="1" stopColor="#6b6f75" />
        </linearGradient>
      </defs>
      <path
        d="M15 18 L15 50 C15 58, 5 58, 5 50 L5 10 C5 1, 19 1, 19 10 L19 54 C19 64, 2 64, 2 54 L2 22"
        fill="none"
        stroke="url(#paperclip)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BinderClip({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 80 74"
      className={`absolute z-10 w-[5.25rem] drop-shadow-[0_4px_3px_rgb(0_0_0/0.28)] ${className}`}
    >
      <defs>
        <linearGradient id="binder-body" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#4a4c50" />
          <stop offset="0.35" stopColor="#1c1d1f" />
          <stop offset="1" stopColor="#0b0b0c" />
        </linearGradient>
        <linearGradient id="binder-wire" x1="0" x2="1">
          <stop offset="0" stopColor="#6e7278" />
          <stop offset="0.35" stopColor="#f4f5f7" />
          <stop offset="0.65" stopColor="#b9bcc1" />
          <stop offset="1" stopColor="#5b5e63" />
        </linearGradient>
      </defs>
      <path
        d="M22 50 L22 30 C22 24, 26 20, 32 18 L36 6 C37 2, 43 2, 44 6 L48 18 C54 20, 58 24, 58 30 L58 50"
        fill="none"
        stroke="url(#binder-wire)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M8 44 L72 44 L76 70 C76 72, 74 73, 72 73 L8 73 C6 73, 4 72, 4 70 Z" fill="url(#binder-body)" />
      <path d="M8 44 L72 44 L73 48 L7 48 Z" fill="#5c5f63" />
      <path d="M10 52 L70 52" stroke="rgb(255 255 255 / 0.12)" strokeWidth="1" />
      <circle cx="22" cy="48" r="2.4" fill="url(#binder-wire)" />
      <circle cx="58" cy="48" r="2.4" fill="url(#binder-wire)" />
    </svg>
  );
}

export function Stamp({ text, className, turn = -8 }: { text: string; className: string; turn?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-10 grid size-[4.75rem] place-items-center rounded-full border-2 border-accent-deep/70 text-center text-[0.6875rem] font-bold uppercase leading-tight tracking-[0.08em] text-accent-deep/75 mix-blend-multiply [mask-image:repeating-radial-gradient(circle_at_30%_40%,#000_0_2px,rgb(0_0_0/0.72)_2px_3px)] ${className}`}
      style={{ transform: `rotate(${turn}deg)` }}
    >
      <span className="absolute inset-[4px] rounded-full border border-accent-deep/60" />
      <span className="px-2">{text}</span>
    </span>
  );
}

export function TornNote({ text, className, turn = 3 }: { text: string; className: string; turn?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-20 block w-[11rem] bg-[#fbf8ee] px-4 pb-4 pt-5 font-[family-name:var(--f-hand)] text-[1.375rem] leading-[1.1] text-[#233a8b] shadow-[0_10px_18px_-12px_rgb(0_0_0/0.45)] ${className}`}
      style={{
        transform: `rotate(${turn}deg)`,
        clipPath:
          "polygon(0 6%, 6% 0, 13% 5%, 21% 1%, 30% 6%, 39% 0, 47% 5%, 56% 1%, 64% 6%, 73% 0, 81% 5%, 90% 1%, 100% 5%, 100% 100%, 0 100%)",
        backgroundImage: "repeating-linear-gradient(0deg, transparent 0 21px, rgb(35 58 139 / 0.12) 21px 22px)",
      }}
    >
      {text}
    </span>
  );
}

export function Sticker({ className, turn = 10 }: { className: string; turn?: number }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute z-20 grid size-14 place-items-center rounded-full bg-[#fbfaf6] shadow-[0_3px_6px_-2px_rgb(0_0_0/0.35),inset_0_0_0_3px_rgb(237_32_36/0.9)] ${className}`}
      style={{ transform: `rotate(${turn}deg)` }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.svg" alt="" className="size-8" />
    </span>
  );
}
