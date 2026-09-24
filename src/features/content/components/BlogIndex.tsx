"use client";

// The blog index: one control line of topics, the three latest as cards, then every post by year.

import Link from "next/link";
import { useState } from "react";
import { T } from "@/components/T";
import type { Bilingual } from "@/features/archive/types";
import PostImage from "./PostImage";

export type BlogItem = {
  slug: string;
  title: Bilingual;
  date?: Bilingual;
  day?: Bilingual;
  year: number;
  tags: Bilingual[];
  keys: string[];
  excerpt: string | null;
  cover?: string;
  sample?: boolean;
};

export type Topic = { key: string; label: Bilingual };

const ON = "text-ink";
const OFF = "text-ink-subtle transition-colors hover:text-ink";
const META = "text-caption tracking-normal";
const LEAD = 3;

function Sample() {
  return (
    <span className="ml-sm inline-block rounded-full border border-rule-strong px-[0.45em] align-[0.1em] text-[12px] leading-[1.5] tracking-normal text-ink-subtle">
      <T en="Sample" ko="샘플" />
    </span>
  );
}

function Stamp({ post }: { post: BlogItem }) {
  return (
    <p className={`${META} text-ink-subtle`}>
      {post.date && (
        <span className="tabular-nums text-ink">
          <T {...post.date} />
        </span>
      )}
      {post.tags.slice(0, 1).map((tag) => (
        <span key={tag.ko} className="before:mx-1 before:content-['·']">
          <T en={tag.en} ko={tag.ko} />
        </span>
      ))}
    </p>
  );
}

export default function BlogIndex({
  posts,
  topics,
  span,
}: {
  posts: BlogItem[];
  topics: Topic[];
  span: string;
}) {
  const [topic, setTopic] = useState<string | null>(null);
  const shown = topic ? posts.filter((p) => p.keys.includes(topic)) : posts;
  const lead = topic ? [] : posts.slice(0, LEAD);
  const years = [...new Set(shown.map((p) => p.year))];

  const pick = (key: string | null) => (
    <button
      type="button"
      aria-pressed={topic === key}
      onClick={() => setTopic(key)}
      className={`flex min-h-11 min-w-[1.5rem] cursor-pointer items-baseline lg:min-h-0 ${topic === key ? ON : OFF}`}
    >
      {key === null ? (
        <T en="All" ko="전체" />
      ) : (
        <T {...(topics.find((t) => t.key === key)?.label ?? { en: key, ko: key })} />
      )}
    </button>
  );

  return (
    <>
      <div className="u-scroll-in flex flex-wrap items-baseline justify-between gap-x-xl border-b border-rule pt-xl pb-sm text-body md:pt-xxl lg:flex-nowrap lg:gap-x-lg xl:gap-x-xl xl:text-title">
        <h1 className="flex min-h-11 shrink-0 items-baseline gap-x-sm text-ink lg:min-h-0">
          <T en="Blog" ko="블로그" />
          <span className="tabular-nums text-ink-subtle">{span}</span>
        </h1>
        <nav aria-label="Topics" className="max-lg:order-last max-lg:w-full max-lg:min-w-0 lg:flex-1">
          <ul className="u-scroll-x flex items-baseline gap-x-md whitespace-nowrap max-lg:overflow-x-auto max-lg:pr-10 max-lg:[mask-image:linear-gradient(to_right,#000_calc(100%-2.5rem),transparent)] lg:flex-wrap lg:justify-end lg:gap-x-sm xl:gap-x-md">
            <li className="shrink-0">{pick(null)}</li>
            {topics.map((t) => (
              <li key={t.key} className="shrink-0">
                {pick(t.key)}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {lead.length > 0 && (
        <ul className="mt-lg grid gap-lg md:grid-cols-2 lg:mt-xl lg:grid-cols-3">
          {lead.map((post, i) => (
            <li key={post.slug} className={i === 0 ? "" : i === 1 ? "max-md:hidden" : "max-lg:hidden"}>
              <Link href={`/blog/${post.slug}`} className="group/post flex flex-col gap-sm">
                <PostImage
                  src={post.cover}
                  ratio="1 / 1"
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                  eager={i === 0}
                  className="u-develop w-full u-corner"
                />
                <div className="flex flex-col gap-sm pt-xs">
                  <Stamp post={post} />
                  <h2 className="text-title text-ink transition-colors group-hover/post:text-ink-muted">
                    <T en={post.title.en} ko={post.title.ko} />
                    {post.sample && <Sample />}
                  </h2>
                  {post.excerpt && (
                    <p
                      className="line-clamp-2 text-body-sm text-ink-muted"
                      dangerouslySetInnerHTML={{ __html: post.excerpt }}
                    />
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <div className={lead.length > 0 ? "mt-xxl lg:mt-section" : "mt-lg lg:mt-xl"}>
        {years.map((year) => (
          <section key={year} aria-label={String(year)} className="u-rule-in grid border-t border-rule py-md lg:grid-cols-12 lg:gap-x-lg lg:py-lg">
            <h2 className="pb-xs text-body tabular-nums text-ink lg:col-span-2 lg:pb-0">{year}</h2>
            <ul className="u-scroll-fade lg:col-span-10">
              {shown
                .filter((p) => p.year === year)
                .map((post) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group/row grid grid-cols-[4.5rem_1fr] gap-x-md py-xs lg:grid-cols-10 lg:gap-x-lg"
                    >
                      <span className="text-body-sm tabular-nums text-ink-subtle lg:col-span-1">
                        {post.day && <T {...post.day} />}
                      </span>
                      <span className="text-body text-ink transition-transform duration-300 group-hover/row:translate-x-[0.4rem] motion-reduce:transition-none lg:col-span-7">
                        <T en={post.title.en} ko={post.title.ko} />
                        {post.sample && (
                          <span className="max-lg:hidden">
                            <Sample />
                          </span>
                        )}
                      </span>
                      <span className={`${META} col-start-2 text-ink-subtle lg:col-span-2 lg:truncate lg:col-start-auto lg:text-right`}>
                        {post.tags.slice(0, 1).map((tag) => (
                          <T key={tag.ko} en={tag.en} ko={tag.ko} />
                        ))}
                        {post.sample && (
                          <span className="lg:hidden">
                            <Sample />
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
