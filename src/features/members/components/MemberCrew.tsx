"use client";

import { spring, type Sprung } from "@/lib/spring";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { MachineFrame } from "@/components/ui";
import type { Bilingual } from "@/features/site/data/about";
import { INKED, InkDefs } from "@/features/hand/HandLayer";
import { Fact } from "@/features/archive/components/EntryBody";
import type { MemberLinks as Links } from "../data/roster";
import MemberLinks from "./MemberLinks";

type CrewGroup = "alumni" | "executives" | "members";

// A group with nobody in it keeps its heading and one row: the link to the profile form.
const GROUPS: { key: CrewGroup; label: string; invite?: string }[] = [
  { key: "alumni", label: "Alumni", invite: "Add your alumni profile" },
  { key: "executives", label: "Executives" },
  { key: "members", label: "Members", invite: "Add your member profile" },
];

export interface CrewMember {
  id: string;
  group: CrewGroup;
  name: string;
  post?: Bilingual;
  duty?: Bilingual;
  department: Bilingual;
  year?: number;
  bio?: string;
  portrait: string | null;
  links?: Links;
}

// Everyone without a portrait shares this one: the club's mark, drawn in the same ink.
const PLACEHOLDER = "/members/ink/placeholder.svg";

// A member's tile: their ink portrait, or the shared placeholder, square behind a hairline. The
// drawings are all 4:5 with one framing, so the tile shows the whole of each.
function Portrait({ m, sizes, className = "" }: { m: CrewMember; sizes: string; className?: string }) {
  return (
    <MachineFrame className={`aspect-[4/5] overflow-hidden bg-canvas ${className}`}>
      {m.portrait ? (
        <Image src={m.portrait} alt={m.name} fill sizes={sizes} loading="lazy" className="rounded-none object-cover" />
      ) : (
        <Image src={PLACEHOLDER} alt="" fill unoptimized loading="lazy" style={INKED} className="rounded-none object-contain" />
      )}
    </MachineFrame>
  );
}

// Keep hyphenated words on one line.
function whole(text: string) {
  return text.split(/(\S*-\S*)/).map((part, i) => (i % 2 ? <span key={i} className="whitespace-nowrap">{part}</span> : part));
}

function Meta({ m, className = "" }: { m: CrewMember; className?: string }) {
  if (m.group === "alumni") {
    return (
      <span className={className}>
        <span className="tabular-nums">{m.year}</span>
        <span className="xl:hidden"> · {m.department.en}</span>
      </span>
    );
  }
  return (
    <span className={className}>
      {m.post && whole(m.post.en)}
      {m.post && m.duty && <span className="text-ink-muted"> · </span>}
      {m.duty && <span>{whole(m.duty.en)}</span>}
    </span>
  );
}

function GroupHead({ id, label, count, className = "" }: { id?: string; label: string; count: number; className?: string }) {
  return (
    <h3 id={id} className={`flex items-baseline justify-between pb-xs text-body-sm text-ink-muted ${className}`}>
      {label}
      {count > 0 && <span className="tabular-nums">{count}</span>}
    </h3>
  );
}

// The whole row is the link: its label where a name sits, its arrow where a row's links sit.
function Invite({ href, label, className = "" }: { href: string; label: string; className?: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`u-swipe-host group/invite flex items-center justify-between text-body-sm text-ink ${className}`}
    >
      <span className="u-swipe">{label}</span>
      <span
        aria-hidden="true"
        className="text-ink-muted transition-colors duration-200 group-hover/invite:text-ink motion-reduce:transition-none"
      >
        ↗
      </span>
    </a>
  );
}

function Card({ m, onSelect }: { m: CrewMember; onSelect: (member: CrewMember) => void }) {
  return (
    <li className="min-w-0">
      <button
        type="button"
        aria-haspopup="dialog"
        aria-label={`${m.name}, view profile`}
        onClick={(e) => {
          // Safari doesn't focus a tapped button, and the dialog hands focus back to whatever had it.
          e.currentTarget.focus({ preventScroll: true });
          onSelect(m);
        }}
        className="block w-full transition-opacity duration-200 [-webkit-tap-highlight-color:transparent] active:opacity-70 active:duration-0 motion-reduce:transition-none"
      >
        <Portrait m={m} sizes="(min-width: 768px) 32vw, 50vw" />
      </button>
    </li>
  );
}

// Closes the group's last row: pale and blank, so it never reads as a person.
function Spare({ members, cols, className }: { members: number; cols: number; className: string }) {
  return Array.from({ length: (cols - (members % cols)) % cols }, (_, i) => (
    <MachineFrame as="li" key={i} aria-hidden="true" className={className} />
  ));
}

function MemberProfile({ member: m, onClose }: { member: CrewMember; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const motion = useRef<{ animation: Animation; path: Sprung | null } | null>(null);

  useEffect(() => {
    const dialog = ref.current;
    const sheet = dialog?.querySelector<HTMLElement>("[data-profile-sheet]");
    if (!dialog || !sheet) return;
    dialog.showModal();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const theme = getComputedStyle(dialog);
    const chrome = Number.parseFloat(theme.getPropertyValue("--duration-chrome"));
    const easing = theme.getPropertyValue("--ease-magnify").trim();
    const path = reduced ? null : spring(100, 0, 0, 0.5, 1);
    const entrance = sheet.animate(
      path ? path.values.map((y) => ({ transform: `translateY(${y}%)` })) : { opacity: [0, 1] },
      {
        duration: path?.duration ?? chrome,
        easing: path ? "linear" : easing,
        fill: "both",
      },
    );
    motion.current = { animation: entrance, path };
    const desktop = window.matchMedia("(min-width: 64rem)");
    const resize = () => { if (desktop.matches) dialog.close(); };
    desktop.addEventListener("change", resize);
    return () => {
      desktop.removeEventListener("change", resize);
      motion.current?.animation.cancel();
      motion.current = null;
      dialog.close();
    };
  }, []);

  const korean = !!m.bio && HANGUL.test(m.bio);
  const hasLinks = m.links && Object.values(m.links).some(Boolean);

  const leave = () => {
    const dialog = ref.current;
    const sheet = dialog?.querySelector<HTMLElement>("[data-profile-sheet]");
    const current = motion.current;
    if (!dialog || !sheet || !current || dialog.hasAttribute("data-closing")) return;
    dialog.toggleAttribute("data-closing", true);
    const { animation, path } = current;
    if (path) {
      // Retarget from the current position and speed, including a close during entry.
      const frame = Math.min(path.values.length - 1, Math.max(0, Number(animation.currentTime) / path.duration * (path.values.length - 1)));
      const index = Math.min(Math.floor(frame), path.values.length - 2);
      const step = path.values[index + 1] - path.values[index];
      const transform = getComputedStyle(sheet).transform;
      const from = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m42 / sheet.getBoundingClientRect().height * 100;
      const velocity = animation.playState === "finished" ? 0 : step / (path.duration / (path.values.length - 1) / 1000);
      const exit = spring(from, 100, velocity, 0.4, 1);
      const leaving = sheet.animate(exit.values.map((y) => ({ transform: `translateY(${y}%)` })), {
        duration: exit.duration,
        easing: "linear",
        fill: "both",
      });
      animation.cancel();
      motion.current = { animation: leaving, path: exit };
      leaving.onfinish = () => dialog.close();
      return;
    }
    // Close while still mounted so the browser restores focus to the selected portrait.
    animation.onfinish = () => dialog.close();
    animation.reverse();
    const duration = animation.effect?.getTiming().duration;
    if (typeof duration === "number") {
      const exit = Number.parseFloat(getComputedStyle(dialog).getPropertyValue("--duration-chrome"));
      animation.updatePlaybackRate(-duration / exit);
    }
  };

  return (
    <dialog
      ref={ref}
      data-overlay
      aria-labelledby={`profile-${m.id}`}
      onCancel={(e) => {
        e.preventDefault();
        leave();
      }}
      onClose={(e) => { if (!e.currentTarget.open) onClose(); }}
      onClick={(e) => {
        // The content fills the dialog, so only the backdrop lands on the dialog itself.
        if (e.target === e.currentTarget) leave();
      }}
      className="member-profile mx-auto mt-auto mb-0 max-h-[calc(100dvh_-_var(--gutter))] w-full max-w-none overflow-clip rounded-t-[1.5rem] bg-transparent text-ink backdrop:bg-black/50 [corner-shape:squircle] md:max-w-[32rem] md:rounded-t-[2.5rem]"
    >
      <div data-profile-sheet className="flex max-h-[inherit] flex-col rounded-[inherit] bg-canvas pt-md [corner-shape:inherit]">
        <article data-profile-paper className="min-h-0 overflow-y-auto overscroll-contain px-gutter">
          <div className="flex flex-col gap-y-sm">
            <header className="flex min-w-0 flex-col gap-y-sm [overflow-wrap:anywhere]">
              <h2 data-profile-part id={`profile-${m.id}`} className="text-body">{m.name}</h2>
              <dl data-profile-part="details" className="flex min-w-0 flex-wrap gap-x-gutter gap-y-sm [&_dd]:text-body [&_dt]:sr-only">
                {m.group === "alumni" ? (
                  <Fact label="Year"><span className="tabular-nums">{m.year}</span></Fact>
                ) : m.post || m.duty ? (
                  <Fact label="Role"><Meta m={m} /></Fact>
                ) : null}
                <Fact label={m.group === "alumni" ? "Field" : "Department"} className="[&_dd]:text-ink-muted">{m.department.en}</Fact>
              </dl>
            </header>
            {m.bio && <p data-profile-part="bio" lang={korean ? "ko" : "en"} className="max-w-[60ch] text-body [overflow-wrap:anywhere]">{m.bio}</p>}
          </div>
        </article>
        <div data-profile-actions data-profile-part="actions" className={`flex shrink-0 items-end gap-x-md px-gutter pt-[calc(var(--spacing-sm)_-_(2.75rem_-_1lh)/2)] pb-[calc(var(--spacing-xs)+env(safe-area-inset-bottom))] ${hasLinks ? "justify-between" : "justify-end"}`}>
          {hasLinks && <MemberLinks name={m.name} links={m.links} variant="text" className="-ml-xs flex-wrap" />}
          <button
            type="button"
            onClick={leave}
            className="-mr-xs min-h-11 min-w-11 shrink-0 px-xs text-body text-ink transition-opacity duration-200 hover:opacity-70 active:opacity-70 active:duration-0 focus-visible:underline focus-visible:underline-offset-4 motion-reduce:transition-none"
          >
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}

const HANGUL = /[가-힣]/;

// Scroll speed (px/s) and endpoint pause (ms).
const RUN = 45;
const REST = 1000;

// Overflowing bios scroll across the role and department columns while active.
function BioLine({ text, on }: { text: string; on: boolean }) {
  const box = useRef<HTMLSpanElement>(null);
  const line = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const b = box.current;
    const l = line.current;
    if (!b || !l || !on) return;
    // Extend past the fade so the final letters remain readable.
    const d = l.scrollWidth - b.clientWidth;
    b.toggleAttribute("data-over", d > 1);
    if (d <= 1 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const far = d + 24;
    const move = (far / RUN) * 1000;
    const total = REST + move + REST;
    const run = l.animate(
      [
        { transform: "translateX(0)", offset: 0 },
        { transform: "translateX(0)", offset: REST / total, easing: "cubic-bezier(0.45, 0, 0.55, 1)" },
        { transform: `translateX(${-far}px)`, offset: (REST + move) / total },
        { transform: `translateX(${-far}px)`, offset: 1 },
      ],
      { duration: total, iterations: Infinity, direction: "alternate" },
    );
    return () => run.cancel();
  }, [on, text]);

  return (
    <span
      ref={box}
      aria-hidden="true"
      lang={HANGUL.test(text) ? "ko" : "en"}
      className={`pointer-events-none absolute inset-0 col-start-3 col-end-[-2] row-end-2 flex xl:col-start-2 items-center overflow-hidden text-[0.9375rem] leading-[21px] text-ink transition-[opacity,visibility] duration-200 motion-reduce:transition-none data-[over]:[mask-image:linear-gradient(90deg,transparent,#000_0.35em,#000_calc(100%-2em),transparent)] ${on ? "visible opacity-100" : "invisible opacity-0"}`}
    >
      <span ref={line} className="shrink-0 whitespace-nowrap [text-box:trim-both_cap_alphabetic]">
        {`“${text}”`}
      </span>
    </span>
  );
}

export default function MemberCrew({ members, total, form }: { members: CrewMember[]; total: number; form: string }) {
  const [hot, setHot] = useState<string | null>(null);
  const [selected, setSelected] = useState<CrewMember | null>(null);
  // Members counts everyone in the club who has no row here.
  const groups = GROUPS.map((g) => {
    const listed = members.filter((m) => m.group === g.key);
    return { ...g, members: listed, count: listed.length + (g.key === "members" ? total - members.length : 0) };
  }).filter((g) => g.members.length > 0 || g.invite);
  const order = groups.flatMap((g) => g.members);

  return (
    <>
      <InkDefs />
      <div className="lg:hidden">
        {groups.map((g, i) => (
          <section key={g.key} aria-labelledby={`crew-m-${g.key}`} className={`pb-xl ${i === 0 ? "pt-sm" : ""}`}>
            <GroupHead id={`crew-m-${g.key}`} label={g.label} count={g.count} />
            {g.members.length === 0 && g.invite ? (
              <p className="border-t border-rule-strong border-b border-b-rule">
                <Invite href={form} label={g.invite} className="min-h-11" />
              </p>
            ) : (
              <ul data-offgrid className="grid grid-cols-4 gap-xs md:grid-cols-6">
                {g.members.map((m) => (
                  <Card key={m.id} m={m} onSelect={setSelected} />
                ))}
                <Spare members={g.members.length} cols={4} className="md:hidden" />
                <Spare members={g.members.length} cols={6} className="hidden md:block" />
              </ul>
            )}
          </section>
        ))}
      </div>

      {selected && <MemberProfile member={selected} onClose={() => setSelected(null)} />}

      <div className="hidden grid-cols-12 gap-x-gutter pt-sm lg:grid" onPointerLeave={() => setHot(null)}>
        <div
          className="col-span-6 grid grid-cols-subgrid content-start xl:col-span-7"
          onFocus={(e) => {
            const row = (e.target as HTMLElement).closest<HTMLElement>("[data-crew]");
            if (row?.dataset.crew) setHot(row.dataset.crew);
          }}
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHot(null);
          }}
        >
          {groups.map((g, i) => (
            <section
              key={g.key}
              aria-labelledby={`crew-d-${g.key}`}
              className={`col-span-full grid grid-cols-subgrid ${i ? "pt-xxl" : ""}`}
            >
              <GroupHead id={`crew-d-${g.key}`} label={g.label} count={g.count} className="col-span-full" />
              <ul className="col-span-full grid grid-cols-subgrid border-t border-rule-strong">
                {g.members.length === 0 && g.invite && (
                  <li className="col-span-full border-b border-rule">
                    <Invite href={form} label={g.invite} className="py-1.5" />
                  </li>
                )}
                {g.members.map((m) => {
                  const read = hot === m.id && !!m.bio;
                  const away = `transition-[opacity,visibility] duration-200 motion-reduce:transition-none ${read ? "invisible opacity-0" : ""}`;
                  return (
                  <li
                    key={m.id}
                    data-crew={m.id}
                    onPointerEnter={() => setHot(m.id)}
                    className={`relative col-span-full grid grid-cols-subgrid items-start border-b border-rule py-1.5 text-body-sm transition-colors duration-200 motion-reduce:transition-none [&>*]:row-start-1 ${
                      hot && hot !== m.id ? "text-ink-muted" : "text-ink"
                    }`}
                  >
                    <span className="col-span-2 col-start-1 whitespace-nowrap xl:col-span-1">{m.name}</span>
                    <Meta m={m} className={`col-span-3 col-start-3 xl:col-span-2 xl:col-start-2 ${away}`} />
                    <span className={`col-span-4 col-start-4 hidden text-ink-muted xl:block ${away}`}>{m.department.en}</span>
                    {/* Centre 32px hit areas on the 21px text line. */}
                    <MemberLinks name={m.name} links={m.links} dense className="col-start-6 -my-[5.5px] -mr-xxs justify-self-end xl:col-start-7" />
                    {m.bio && (
                      <>
                        <span className="sr-only">{m.bio}</span>
                        <BioLine text={m.bio} on={read} />
                      </>
                    )}
                  </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>

        <div aria-hidden="true" className="col-span-6 xl:col-span-5">
          {/* Align the portrait wall with the first table rule. */}
          <GroupHead label={groups[0]?.label ?? ""} count={0} className="invisible" />
          {/* One object on the sheet: its outer edges are on columns, its gaps are the wall's own. */}
          <ul data-offgrid className="grid grid-cols-5 gap-xs">
            {order.map((m) => (
              <li key={m.id} onPointerEnter={() => setHot(m.id)}>
                <Portrait
                  m={m}
                  sizes="(min-width: 1280px) 8vw, 10vw"
                  className={`transition-opacity duration-200 motion-reduce:transition-none ${hot && hot !== m.id ? "opacity-45" : ""}`}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}
