import type { CSSProperties } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { displayTags } from "@/features/content/data/tags";
import type { ArchiveProject } from "../types";
import { COVERS, type Look } from "../data/covers";
import { tileFor } from "../data/field";
import { LAYERS, SHEET, layoutDepth, type Layer } from "../data/depth";

import { splitTitle } from "./splitTitle";
import { commonTags } from "./commonTags";
import PlateArt from "./PlateArt";
import DepthStage from "./DepthStage";
import FieldScreen from "./FieldScreen";
import PlateHandoff from "./PlateHandoff";
import { GROUND_DOT, GROUND_INK, SCREEN } from "@/lib/halftone";

interface DepthGroup {
  era: string | null;
  projects: ArchiveProject[];
}

const META = "text-caption tracking-normal leading-[1.35]";

const CHIP_AT: CSSProperties = {
  translate: "calc(var(--mx) + 14px) calc(var(--my) + 14px)",
};

const pct = (n: number) => `${n * 100}%`;

const EDGE: CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent 0, #000 7rem, #000 calc(100% - 7rem), transparent 100%)",
};

export default function ArchiveDepth({
  groups,
  tags,
  teamSize,
  look,
  reelHref,
}: {
  groups: DepthGroup[];
  tags: Map<string, string[]>;
  teamSize: Map<string, number>;
  look: Look;
  reelHref: (id: string) => string;
}) {
  const layer = new Map<string, Layer>();
  for (const g of groups) {
    const sizes = g.projects
      .map((p) => teamSize.get(p.id))
      .filter((n): n is number => n !== undefined)
      .sort((a, b) => a - b);
    const median = sizes.length ? sizes[Math.floor(sizes.length / 2)] : Infinity;
    for (const p of g.projects) {
      const team = teamSize.get(p.id);
      layer.set(
        p.id,
        p.award || COVERS[p.id]?.feature ? 2 : team !== undefined && team >= median ? 1 : 0,
      );
    }
  }
  const layerOf = (p: ArchiveProject): Layer => layer.get(p.id) ?? 0;

  const common = new Map<string, Set<string>>();
  for (const g of groups) {
    const shared = commonTags(g.projects, tags);
    for (const p of g.projects) common.set(p.id, shared);
  }

  const { spots, bands, height } = layoutDepth(
    groups.map((g) => ({ key: g.era, items: g.projects })),
    (p) => ({ layer: layerOf(p), shape: tileFor(p, look).shape }),
  );

  return (
    <section>
      <Container>
        <div
          data-depth
          style={
            {
              aspectRatio: `${SHEET} / ${Math.round(height)}`,
              "--mx": "-999px",
              "--my": "-999px",
            } as CSSProperties
          }
          className="relative @container"
        >
          {bands.map((b) => (
            <span
              key={b.key}
              id={`era-${b.key.replace("\u2013", "-")}`}
              aria-hidden="true"
              style={{ top: pct(b.y / height), scrollMarginTop: "calc(var(--masthead) + 2rem)" }}
              className="pointer-events-none absolute left-0 block h-px w-px"
            />
          ))}

          <div aria-hidden="true" style={EDGE} className="pointer-events-none absolute inset-0 z-0">
            <div className="absolute inset-0 bg-canvas" />
          </div>

          <div
            aria-hidden="true"
            data-ground
            style={{
              ...EDGE,
              backgroundImage: `radial-gradient(var(${GROUND_INK}) ${GROUND_DOT.toFixed(2)}px, transparent 0)`,
              backgroundSize: `${SCREEN}px ${SCREEN}px`,
            }}
            className="pointer-events-none absolute inset-0 z-[1]"
          />
          <FieldScreen edge={EDGE} />
          <PlateHandoff />

          <DepthStage />

          <ul className="contents">
            {spots.map(({ item: p, layer, x, y, w }) => {
              const tile = tileFor(p, look);
              const name = splitTitle(p.title);
              const year = p.year ?? p.era.replace("-", "–");
              const shown = displayTags(
                (tags.get(p.id) ?? []).filter((t) => !common.get(p.id)?.has(t)),
                2,
              );
              return (
                <li key={p.id} className="contents">
                  <Link
                    href={reelHref(p.id)}
                    data-sp={LAYERS[layer].speed}
                    data-plate-link
                    data-vt-id={p.id}
                    style={{ left: pct(x / SHEET), top: pct(y / height), width: pct(w / SHEET), zIndex: layer + 4 }}
                    className="peer group/plate absolute block"
                  >
                    <PlateArt
                      tile={tile}
                      sizes={`${Math.ceil((w / SHEET) * 100)}vw`}
                      className={`w-full opacity-0 transition-opacity duration-300 ease-out group-hover/plate:opacity-100 group-focus-visible/plate:opacity-100 motion-reduce:transition-none`}
                    />
                    <p className="u-knock mt-xs line-clamp-2 text-body-sm leading-[1.35] text-ink-muted transition-colors duration-300 group-hover/plate:text-ink group-focus-visible/plate:text-ink motion-reduce:transition-none">
                      {name.en}
                      <span data-arrow={"\u00a0↗"} className="after:content-[attr(data-arrow)/'']" />
                    </p>
                    <span className="sr-only">{year}</span>
                  </Link>
                  <span
                    aria-hidden="true"
                    style={CHIP_AT}
                    className={`pointer-events-none fixed top-0 left-0 z-30 hidden max-w-[18rem] bg-canvas-inverse px-sm pt-[0.55rem] pb-sm text-ink-inverse peer-hover:block peer-focus-visible:block ${META}`}
                  >
                    <span className="block text-body-sm leading-[1.3] text-ink-inverse">
                      {name.en}
                    </span>
                    <span className="mt-xxs flex flex-wrap gap-x-sm text-ink-inverse-muted">
                      <span className="tabular-nums">{year}</span>
                      {shown.map((t) => (
                        <span key={t.ko}>
                          {t.en}
                        </span>
                      ))}
                    </span>
                    {p.award ? (
                      <span className="mt-xxs flex gap-x-xs text-ink-inverse-muted">
                        <span className="text-accent">•</span>
                        <span>
                          {p.award.en}
                        </span>
                      </span>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </Container>
    </section>
  );
}
