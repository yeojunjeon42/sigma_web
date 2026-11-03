"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import PostImage from "./PostImage";

export type BlogItem = {
  slug: string;
  title: string;
  date?: string;
  year: number;
  section?: string;
  keys: string[];
  cover?: string;
  sample?: boolean;
};

export type Topic = { key: string; label: string };

type View = "grid" | "list";

const ON = "text-ink";
const OFF = "text-ink-muted transition-colors hover:text-ink";
const META = "text-caption tracking-normal";
const HIT = "relative before:absolute before:inset-x-[-0.25rem] before:top-1/2 before:h-11 before:-translate-y-1/2 before:content-[''] lg:before:hidden";
const COLS = "md:grid md:grid-cols-12 md:gap-x-gutter";

// Read query state after hydration; prerendering has no query, and Back must restore filters.
const MOVED = "blog:query";
const subscribe = (fn: () => void) => {
  window.addEventListener("popstate", fn);
  window.addEventListener(MOVED, fn);
  return () => {
    window.removeEventListener("popstate", fn);
    window.removeEventListener(MOVED, fn);
  };
};
const readQuery = () => window.location.search;


function Section({ post, className = "" }: { post: BlogItem; className?: string }) {
  return post.section ? <span className={className}>{post.section}</span> : null;
}

function Grid({ posts }: { posts: BlogItem[] }) {
  return (
    <ul className="grid gap-x-gutter gap-y-xxl sm:grid-cols-2 lg:grid-cols-3 lg:gap-y-section">
      {posts.map((post, i) => (
        <li key={post.slug}>
          <Link href={`/blog/${post.slug}`} className="group/post flex flex-col">
            <PostImage
              src={post.cover}
              seed={post.slug}
              ratio="1 / 1"
              sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
              eager={i < 3}
              className="u-develop u-corner w-full"
            />
            <h2 className="mt-md max-w-[34ch] text-lead text-ink transition-colors group-hover/post:text-ink-muted">
              {post.title}
            </h2>
            <p className={`mt-sm ${META} text-ink-muted`}>
              <Section post={post} className="mr-md text-ink" />
              {post.date && (
                <span className="tabular-nums">
                  {post.date}
                </span>
              )}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

function List({ posts }: { posts: BlogItem[] }) {
  return (
    <>
      <div className={`hidden border-b border-rule-strong pb-sm text-ink-muted ${COLS} ${META}`}>
        <span className="md:col-span-1 lg:col-span-3">
          Year
        </span>
        <span className="md:col-span-7 lg:col-span-6">
          Title
        </span>
        <span className="md:col-span-2 lg:col-span-1">
          Section
        </span>
        <span className="md:col-span-2 md:text-right">
          Date
        </span>
      </div>
      <ul>
        {posts.map((post, i) => {
          const first = i === 0 || posts[i - 1].year !== post.year;
          return (
            <li
              key={post.slug}
              className="u-scroll-fade relative border-b border-rule transition-colors lg:has-[a:hover]:z-20 lg:has-[a:hover]:border-ink lg:has-[a:focus-visible]:z-20"
            >
              <Link href={`/blog/${post.slug}`} className="group/row block">
                <div className={`relative grid min-h-11 grid-cols-[1fr_auto] items-center gap-x-md gap-y-xs py-[13px] ${COLS} md:text-title lg:min-h-0 lg:py-xs`}>
                  <p className="u-trim hidden text-body tabular-nums text-ink md:col-span-1 md:block lg:col-span-3">{first ? post.year : null}</p>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 hidden md:left-[calc((100%-11*var(--gutter))/12+var(--gutter))] md:right-[calc(4*(100%-11*var(--gutter))/12+4*var(--gutter))] lg:block"
                  >
                    <span className="u-corner absolute top-1/2 right-0 z-30 hidden w-[12rem] -translate-y-1/2 overflow-hidden lg:group-hover/row:block lg:group-focus-visible/row:block">
                      <PostImage src={post.cover} seed={post.slug} ratio="3 / 2" sizes="192px" className="w-full" />
                    </span>
                  </div>
                  <h2 className="u-trim text-title text-ink transition-[translate,color] duration-200 ease-out motion-reduce:transition-none md:col-span-7 lg:col-span-6 lg:text-ink-muted lg:group-hover/row:translate-x-sm lg:group-hover/row:text-ink lg:group-focus-visible/row:translate-x-sm lg:group-focus-visible/row:text-ink">
                    {post.title}
                    <span className="text-ink-muted">{" ↗"}</span>
                  </h2>
                  <p className={`u-trim hidden whitespace-nowrap text-ink-muted md:col-span-2 md:block lg:col-span-1 ${META}`}>
                    <Section post={post} />
                  </p>
                  <p className="u-trim col-start-2 row-start-1 justify-self-end text-body-sm tabular-nums text-ink-muted md:col-span-2 md:col-start-auto md:row-start-auto md:text-right">
                    {post.date}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export default function BlogIndex({ posts, topics, span }: { posts: BlogItem[]; topics: Topic[]; span: string }) {
  const query = new URLSearchParams(useSyncExternalStore(subscribe, readQuery, () => ""));
  const asked = query.get("topic");
  const topic = asked && topics.some((t) => t.key === asked) ? asked : null;
  const view: View = query.get("view") === "list" ? "list" : "grid";
  const go = (next: { topic: string | null; view: View }) => {
    const q = new URLSearchParams();
    if (next.topic) q.set("topic", next.topic);
    if (next.view !== "grid") q.set("view", next.view);
    const s = q.toString();
    window.history.replaceState(null, "", s ? `?${s}` : window.location.pathname);
    window.dispatchEvent(new Event(MOVED));
  };
  const setTopic = (key: string | null) => go({ topic: key, view });
  const setView = (key: View) => go({ topic, view: key });
  const shown = topic ? posts.filter((p) => p.keys.includes(topic)) : posts;

  const pick = (key: string | null) => (
    <button
      type="button"
      aria-pressed={topic === key}
      onClick={() => setTopic(key)}
      className={`${HIT} flex cursor-pointer items-baseline ${topic === key ? ON : OFF}`}
    >
      {key === null ? (
        "All"
      ) : (
        topics.find((t) => t.key === key)?.label ?? key
      )}
    </button>
  );

  const views: { key: View; label: string }[] = [
    { key: "grid", label: "Grid" },
    { key: "list", label: "List" },
  ];

  return (
    <>
      <div className="u-scroll-in flex flex-nowrap items-baseline justify-between gap-x-md whitespace-nowrap border-b border-rule pt-xl pb-sm text-body md:pt-xxl md:grid md:grid-cols-12 md:gap-x-gutter min-[90rem]:text-title">
        <h1 className="flex shrink-0 items-baseline gap-x-sm text-ink md:col-span-3 md:row-start-1">
          Blog
          <span className="tabular-nums text-ink-muted">{span}</span>
        </h1>
        <nav aria-label="Sections" className="u-scroll-x -my-3 min-w-0 overflow-x-auto py-3 max-md:hidden md:col-start-4 md:col-end-11 md:row-start-1">
          <ul className="flex items-baseline gap-x-md lg:gap-x-sm xl:gap-x-md">
            <li className="shrink-0">{pick(null)}</li>
            {topics.map((t) => (
              <li key={t.key} className="shrink-0">
                {pick(t.key)}
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="View" className="flex shrink-0 items-baseline gap-x-md md:col-start-11 md:col-end-13 md:row-start-1 md:justify-self-end lg:gap-x-sm xl:gap-x-md">
          {views.map((v) => (
            <button
              key={v.key}
              type="button"
              aria-pressed={view === v.key}
              onClick={() => setView(v.key)}
              className={`${HIT} flex cursor-pointer items-baseline ${view === v.key ? ON : OFF}`}
            >
              {v.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-lg lg:mt-xl">
        {view === "grid" ? <Grid posts={shown} /> : <List posts={shown} />}
      </div>
    </>
  );
}
