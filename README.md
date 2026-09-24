# sigmaintelligence.org

The website of **Sigma Intelligence**, the robotics club of Seoul National University,
founded 1984. It is first an archive: 67 builds on record, 43 competition results, and a cohort
run with no missing year.

Every page has a plain-text twin under `/ai` for agents and crawlers.

## Stack

- **Next.js 16** (App Router, Turbopack) · React 19 · TypeScript
- **Tailwind v4** — all design tokens live in `src/app/globals.css` under `@theme`
- **Markdown and TypeScript data** in the repo for all content — no CMS
- **Vercel** for deployment

## Running locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # run this before opening a PR
npm run lint
```

## Where things live

| Path | What |
|---|---|
| `src/components/ui/` | Primitives — container, grid field, the home hero |
| `src/features/<domain>/` | `api/` + `components/` + `data/` + `types.ts` per domain |
| `content/archive/` | One markdown file per build (67) |
| `content/posts/` | Write-ups |
| `public/archive-photos/<id>/` | Photographs, matched to an entry by folder name |

## Adding an archive entry

1. Add the entry to `src/features/archive/data/projects.ts` — `id`, `title`, `year`, `era`,
   and a bilingual `summary`. Add `award` if it won something.
2. Drop photographs in `public/archive-photos/<id>/` as `01.jpg`, `02.jpg`, … The `id` must match
   the folder name exactly.
3. Optionally write `content/archive/<id>.md` for the entry text (club documents only, verbatim).
4. Optionally set its cover and crop in `src/features/archive/data/covers.json`.

Titles hold both languages in one string, either `한국어 / English` or `English (한국어)`. The site
is English: it splits them and shows the English side.

## Copy

User-facing text goes through `<T en="…" ko="…" />`, which prints the English; the club's Korean
wording stays beside it in the source.

Figures on the site come from the club's own records — exhibition catalogues, competition reports,
general-meeting minutes and rosters, which stay private (see `.gitignore`).
