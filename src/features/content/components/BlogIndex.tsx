"use client";

import Link from "next/link";
import { useState } from "react";
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
const COLS = "md:grid md:grid-cols-12 md:gap-x-lg";

function Sample() {
  return (
    <span className="ml-sm inline-block rounded-full border border-rule-strong px-[0.45em] align-[0.1em] text-[12px] leading-[1.5] tracking-normal text-ink-muted">
      Sample
    </span>
  );
}

function Section({ post, className = "" }: { post: BlogItem; className?: string }) {
  return post.section ? <span className={className}>{post.section}</span> : null;
}

function Grid({ posts }: { posts: BlogItem[] }) {
  return (
    <ul className="grid gap-x-lg gap-y-xxl md:grid-cols-2 lg:grid-cols-3 lg:gap-y-section">
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
              {post.sample && <Sample />}
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
        <span className="md:col-span-1">
          Year
        </span>
        <span className="md:col-span-7">
          Title
        </span>
        <span className="md:col-span-2">
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
                <div className={`relative grid grid-cols-[1fr_auto] items-center gap-x-md gap-y-xs py-md ${COLS} md:text-title lg:py-xs`}>
                  <p className="u-trim hidden text-body tabular-nums text-ink md:col-span-1 md:block">{first ? post.year : null}</p>
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 hidden md:left-[calc((100%-11*var(--spacing-lg))/12+var(--spacing-lg))] md:right-[calc(4*(100%-11*var(--spacing-lg))/12+4*var(--spacing-lg))] lg:block"
                  >
                    <span className="u-corner absolute top-1/2 right-0 z-30 hidden w-[12rem] -translate-y-1/2 overflow-hidden lg:group-hover/row:block lg:group-focus-visible/row:block">
                      <PostImage src={post.cover} seed={post.slug} ratio="3 / 2" sizes="192px" className="w-full" />
                    </span>
                  </div>
                  <h2 className="u-trim text-title text-ink transition-[translate,color] duration-200 ease-out motion-reduce:transition-none md:col-span-7 lg:text-ink-muted lg:group-hover/row:translate-x-sm lg:group-hover/row:text-ink lg:group-focus-visible/row:translate-x-sm lg:group-focus-visible/row:text-ink">
                    {post.title}
                    <span className="text-ink-muted">{" ↗"}</span>
                    {post.sample && (
                      <span className="max-md:hidden">
                        <Sample />
                      </span>
                    )}
                  </h2>
                  <p className={`u-trim col-span-2 row-start-2 text-ink-muted md:col-span-2 md:row-start-auto ${META}`}>
                    <Section post={post} />
                    {post.sample && (
                      <span className="md:hidden">
                        <Sample />
                      </span>
                    )}
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
  const [topic, setTopic] = useState<string | null>(null);
  const [view, setView] = useState<View>("grid");
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
      <div className="u-scroll-in flex flex-wrap items-baseline justify-between gap-x-xl border-b border-rule pt-xl pb-sm text-body md:pt-xxl lg:flex-nowrap lg:gap-x-lg xl:gap-x-xl xl:text-title">
        <h1 className="flex shrink-0 items-baseline gap-x-sm text-ink">
          Blog
          <span className="tabular-nums text-ink-muted">{span}</span>
        </h1>
        <nav aria-label="Sections" className="max-lg:order-last max-lg:w-full max-lg:min-w-0 lg:flex-1">
          <ul className="u-scroll-x flex items-baseline gap-x-md whitespace-nowrap max-lg:overflow-x-auto max-lg:pr-10 max-lg:[mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] lg:flex-wrap lg:gap-x-sm xl:gap-x-md">
            <li className="shrink-0">{pick(null)}</li>
            {topics.map((t) => (
              <li key={t.key} className="shrink-0">
                {pick(t.key)}
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="View" className="flex shrink-0 items-baseline gap-x-md lg:gap-x-sm xl:gap-x-md">
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
