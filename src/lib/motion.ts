/**
 * Precision Motion UI — Sigma Intelligence
 *
 * A motion system built on Anime.js v4 for a clean, technical feel.
 * Animates only `transform` and `opacity` (no layout-thrashing properties).
 * Fully respects `prefers-reduced-motion`.
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  TUNING GUIDE                                                  │
 * │                                                                │
 * │  HERO_DURATION    500ms  Base reveal speed for hero elements   │
 * │  HERO_OFFSET       80ms  Cascade gap between hero steps       │
 * │  REVEAL_DURATION  450ms  Scroll-triggered section reveals     │
 * │  REVEAL_STAGGER    70ms  Gap between sibling reveal items     │
 * │  CARD_BOUNCE      0.12   Spring bounce (0 = no bounce, 1 max) │
 * │  NAV_THRESHOLD     60px  Scroll distance to compact navbar    │
 * │                                                                │
 * │  → Faster feel: reduce durations by ~30%, reduce stagger      │
 * │  → Slower feel: increase durations by ~20%, add stagger       │
 * │  → Snappier: lower CARD_BOUNCE toward 0                       │
 * │  → Bouncier: raise CARD_BOUNCE toward 0.3 (max recommended)  │
 * └─────────────────────────────────────────────────────────────────┘
 */

import {
  animate,
  createTimeline,
  createScope,
  stagger,
  spring,
} from "animejs";
import type { Scope } from "animejs";

// ── Timing Constants ─────────────────────────────────────────────────

const HERO_DURATION = 500;
const HERO_OFFSET = 80;
const REVEAL_DURATION = 450;
const REVEAL_STAGGER = 70;
const REVEAL_THRESHOLD = 0.15;
const CARD_BOUNCE = 0.12;
const NAV_THRESHOLD = 60;

// ── Internal State ───────────────────────────────────────────────────

let _scope: Scope | null = null;
let _observer: IntersectionObserver | null = null;
let _scrollHandler: (() => void) | null = null;
let _cardCleanups: Array<() => void> = [];

// ── Helpers ──────────────────────────────────────────────────────────

function reducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function showInstant(selector: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach((el) => {
    el.style.opacity = "1";
    el.style.transform = "none";
  });
}

// ── 1) Hero Intro ────────────────────────────────────────────────────
// Choreographed timeline: badge → title → subtitle → CTAs → visual
// Total runtime ≈ 1000ms. Easing: outQuad for a decisive, non-bouncy feel.

export function initHeroMotion(): void {
  const heroTitle = document.querySelector('[data-anim="hero-title"]');
  if (!heroTitle) return;

  if (reducedMotion()) {
    showInstant('[data-anim^="hero-"]');
    return;
  }

  const tl = createTimeline({
    defaults: { ease: "outQuad", duration: HERO_DURATION },
  });

  tl.add('[data-anim="hero-badge"]', {
    opacity: [0, 1],
    translateY: [12, 0],
    duration: 350,
  }, 0);

  tl.add('[data-anim="hero-title"]', {
    opacity: [0, 1],
    translateY: [20, 0],
  }, HERO_OFFSET);

  tl.add('[data-anim="hero-sub"]', {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 400,
  }, HERO_OFFSET * 2);

  tl.add('[data-anim="hero-cta"]', {
    opacity: [0, 1],
    translateY: [16, 0],
    duration: 380,
    delay: stagger(HERO_OFFSET),
  }, HERO_OFFSET * 3);

  // Subtle scale-in: 0.96 → 1 gives a "precision lock" effect
  tl.add('[data-anim="hero-visual"]', {
    opacity: [0, 1],
    scale: [0.96, 1],
    duration: 600,
    ease: "outQuad",
  }, HERO_OFFSET * 2.5);
}

// ── 2) Section Reveal on Scroll ──────────────────────────────────────
// Each [data-anim="reveal-group"] fires once when 15% visible.
// Children [data-anim="reveal-item"] and [data-anim="card"] cascade
// at REVEAL_STAGGER intervals. Cards get both reveal + hover behavior.

const REVEAL_CHILDREN = '[data-anim="reveal-item"], [data-anim="card"]';

export function initSectionReveal(): void {
  _observer?.disconnect();
  _observer = null;

  const groups = document.querySelectorAll('[data-anim="reveal-group"]');
  if (!groups.length) return;

  if (reducedMotion()) {
    groups.forEach((g) => {
      g.querySelectorAll<HTMLElement>(REVEAL_CHILDREN).forEach((el) => {
        el.style.opacity = "1";
        el.style.transform = "none";
      });
    });
    return;
  }

  _observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const items = entry.target.querySelectorAll(REVEAL_CHILDREN);
        if (items.length) {
          animate(items, {
            opacity: [0, 1],
            translateY: [16, 0],
            duration: REVEAL_DURATION,
            ease: "outQuad",
            delay: stagger(REVEAL_STAGGER),
          });
        }
        _observer?.unobserve(entry.target);
      });
    },
    { threshold: REVEAL_THRESHOLD, rootMargin: "0px 0px -40px 0px" },
  );

  groups.forEach((g) => _observer?.observe(g));
}

// ── 3) Card Hover / Focus ────────────────────────────────────────────
// Spring-based micro-interaction: translateY(-4px) + scale(1.01) on
// hover/focus. Spring bounce is kept low for a "machined" tactile feel.

export function initCardInteractions(): void {
  _cardCleanups.forEach((fn) => fn());
  _cardCleanups = [];

  if (reducedMotion()) return;

  const cards = document.querySelectorAll<HTMLElement>('[data-anim="card"]');

  cards.forEach((card) => {
    const enter = () => {
      animate(card, {
        translateY: -4,
        scale: 1.01,
        ease: spring({ bounce: CARD_BOUNCE, duration: 300 }),
      });
    };
    const leave = () => {
      animate(card, {
        translateY: 0,
        scale: 1,
        ease: spring({ bounce: CARD_BOUNCE * 0.5, duration: 260 }),
      });
    };

    card.addEventListener("mouseenter", enter);
    card.addEventListener("mouseleave", leave);
    card.addEventListener("focusin", enter);
    card.addEventListener("focusout", leave);

    _cardCleanups.push(() => {
      card.removeEventListener("mouseenter", enter);
      card.removeEventListener("mouseleave", leave);
      card.removeEventListener("focusin", enter);
      card.removeEventListener("focusout", leave);
    });
  });
}

// ── 4) Navbar Compact on Scroll ──────────────────────────────────────
// Toggles `.nav-compact` class; CSS transitions handle the 220ms change.
// Padding on a fixed-position element doesn't reflow the document.

export function initNavbarMotion(): void {
  if (_scrollHandler) {
    window.removeEventListener("scroll", _scrollHandler);
    _scrollHandler = null;
  }

  const nav = document.querySelector<HTMLElement>('[data-nav="header"]');
  if (!nav) return;

  let compacted = false;

  _scrollHandler = () => {
    const shouldCompact = window.scrollY > NAV_THRESHOLD;
    if (shouldCompact !== compacted) {
      compacted = shouldCompact;
      nav.classList.toggle("nav-compact", shouldCompact);
    }
  };

  _scrollHandler();
  window.addEventListener("scroll", _scrollHandler, { passive: true });
}

// ── Master Init ──────────────────────────────────────────────────────
// Wraps mount-time animations in a scope for automatic cleanup.

export function initMotion(): void {
  destroyMotion();

  _scope = createScope({ root: document.documentElement });
  _scope.add(() => {
    initHeroMotion();
  });

  initNavbarMotion();
  initSectionReveal();
  initCardInteractions();
}

// Re-init page-level animations after client-side navigation.
export function refreshPageMotion(): void {
  _observer?.disconnect();
  _cardCleanups.forEach((fn) => fn());
  _cardCleanups = [];

  if (_scope) {
    _scope.add(() => {
      initHeroMotion();
    });
  } else {
    initHeroMotion();
  }

  initSectionReveal();
  initCardInteractions();
}

// ── Cleanup ──────────────────────────────────────────────────────────

export function destroyMotion(): void {
  _observer?.disconnect();
  _observer = null;

  if (_scrollHandler) {
    window.removeEventListener("scroll", _scrollHandler);
    _scrollHandler = null;
  }

  _cardCleanups.forEach((fn) => fn());
  _cardCleanups = [];

  _scope?.revert();
  _scope = null;
}
