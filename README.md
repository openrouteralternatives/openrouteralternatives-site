# openrouteralternatives.eu

A source-driven comparison directory of OpenRouter alternatives: AI gateways, model
routers and multi-provider AI APIs, compared by model coverage, provider diversity, EU
jurisdiction, data residency, infrastructure, deployment and company characteristics.

Production domain: <https://openrouteralternatives.eu>

## Editorial contract

The site publishes **no overall score** and names no single "best" alternative. Two rules
follow from that and are enforced in code rather than by convention:

1. **Nothing is ranked without a stated, measurable criterion.** Each category in
   [`data/categories.ts`](data/categories.ts) carries its own `inclusionCriterion`,
   `rankingCriterion` and `rankingMetric`. A category whose metric is `none` renders as a
   list; a ranked category only positions gateways that actually hold a value for the
   metric. Where no member holds one, the page says so instead of ordering by something
   else.
2. **Uncertainty is displayed, never smoothed over.** Every value is a
   `Field<T>` ([`types/field.ts`](types/field.ts)) carrying a `DataStatus`. A field with
   no supported value has `value: null` and renders its status — `Needs verification`,
   `Not disclosed`, `Not applicable` — with a tooltip explaining what that means. No
   component substitutes a placeholder number.

Default table sort is alphabetical by gateway name. Sorting keeps rows without a value at
the bottom in **both** directions, so missing data can never be promoted by reversing the
sort.

## Stack

Next.js 16 (App Router, React 19) · TypeScript strict · Tailwind CSS v4 ·
TanStack Table v9 · Radix primitives · Lucide icons. Fully static: no database, no
backend API, no runtime data fetching.

## Layout

```
app/                    routes; every page is statically generated
  compare/              full comparison table
  gateways/[slug]/      profile pages, generated from the dataset
  categories/<slug>/    eight category routes over one shared template
  methodology/ eu-vs-eu-hosted/ changelog/
  sitemap.ts robots.ts not-found.tsx error.tsx loading.tsx
components/
  comparison/           table, columns, filters, expanded row, mobile cards
  gateways/             profile, cards, logo
  categories/           category template, grid, ranking block
  layout/ ui/           header, footer, search, primitives
data/                   the only place facts live
  gateways.ts           canonical dataset
  categories.ts         category definitions and their criteria
  sources.ts            source hierarchy used on the methodology page
  changelog.ts self-hosted.ts site.ts
lib/                    ranking, filtering, formatting, SEO, table config
types/                  shared types
content/                editorial notes that are not rendered data
```

`data/` holds facts, `lib/` holds logic, `components/` holds presentation. No gateway
information is hard-coded in JSX, and the comparison table, profile pages and category
pages all read the same canonical records.

## Working with the dataset

### Adding a gateway

Append a `createGateway({ ... })` entry to [`data/gateways.ts`](data/gateways.ts). Only
the fields you can source need to be written; [`lib/create-gateway.ts`](lib/create-gateway.ts)
fills the rest with `needs-verification`, so an unfilled field can never be mistaken for a
researched one. The profile page, sitemap entry, search index and category membership all
follow automatically.

### Recording a new model measurement

Model counts are dated observations, not attributes. Append to `modelMeasurements`:

```ts
modelMeasurements: [
  { count: 1038, method: "measured", date: "2026-09-08", sources: ["baseline", "models-endpoint"] },
  { count: 1102, method: "measured", date: "2026-09-15", sources: ["models-endpoint"] },
],
```

The table, the homepage ranking and the category pages all read the newest entry; the
profile page shows the history. Add a matching entry to
[`data/changelog.ts`](data/changelog.ts) so the superseded figure stays visible.

### Adding a category

Add a definition to `data/categories.ts` and a four-line route under
`app/categories/<slug>/page.tsx` following the existing pattern. The page body, ranking,
table, cards and JSON-LD come from the shared template.

## Keeping bias out

Every vendor is evaluated with the same published methodology, and the
protections are structural rather than promised: the ranking criterion for
every category is printed on that category's own page, the default table order
is alphabetical, measured and provider-stated counts are never mixed inside a
ranking, and no gateway is excluded from a list it qualifies for.
`npm run audit` enforces the structural parts.

On the current dataset that means Requesty leads the measured catalogue
ranking, OpenRouter leads provider network breadth, Azure AI Foundry leads
modality coverage, nexos.ai leads company scale among EU-incorporated vendors,
TrueFoundry leads social reach, and Cortecs has the strongest EU-only inference
posture.

## Data status in the current revision

Three research passes are recorded:

- **September 8, 2026** — the project's original catalogue baseline.
- **September 15, 2026** — validated company research: registry-confirmed
  entities, jurisdictions, size bands, ownership changes and certifications.
- **September 15, 2026** — catalogues re-counted directly from public
  endpoints, and two acquisitions confirmed against the acquirers' own
  announcements.

### Evidence, not blanks

Quantitative values are `Metric` objects ([types/metric.ts](types/metric.ts)),
not bare numbers. Each carries a `MetricStatus` saying what kind of evidence it
is, and a value with no number still carries its reason:

| Status | Shown as | Means |
| --- | --- | --- |
| `measured` | `360` · Measured | Counted by this project from a public endpoint on the date shown |
| `official` | `700+` · Official | A figure the provider publishes about itself |
| `catalogue` | `286` · Catalogue | From an official catalogue that is not a headline number |
| `secondary` | `500+` · Reported | A reputable third party, where no primary source exists |
| `not_published` | `—` · Not published | The provider publishes no comparable figure |
| `variable` | `Variable` · Configured by you | Availability depends on what the customer configures |
| `not_comparable` | `N/A` · Different metric | A figure exists but counts routes, endpoints or something else |
| `conflicting` | `Multiple` · Multiple figures | Credible sources disagree, and the disagreement is preserved |

Nothing in the interface says "Needs verification". A blank model count is a
fact about the product's architecture, not a gap in the research — the
methodology page has a section saying exactly that.

### Counting rules the code enforces

- **Models, routes, endpoints and providers are four different quantities.**
  Portkey's published 1,600+ counts endpoints, so it is recorded as
  `endpoints` and its model count reads "Different metric". Requesty's 684 are
  endpoints; its 545 deduplicated models are counted separately.
- **Rankings only compare like with like.** `RANKING_RULES` in
  [lib/ranking.ts](lib/ranking.ts) declares which statuses and which scope each
  ranking may consume. The measured-catalogue ranking accepts only
  `measured` values at `llm` scope, so a provider floor, a route count or an
  all-modality catalogue cannot enter it. Provider-stated figures are ranked in
  a separate list on the same page, never merged.
- **History is never overwritten.** Superseded measurements and a provider's
  own figure both stay in `history` and are listed on the profile.

### What was measured on September 15, 2026

One rule applied to every catalogue: distinct model identifiers after removing
exact duplicates, serving-provider prefixes, routing variants and non-model
pseudo-entries.

| Gateway | LLM models | Providers | Other |
| --- | --- | --- | --- |
| Requesty | 545 | 33 | 684 endpoints |
| AI/ML API | 369 | — | 790 all-modality models, 943 endpoint entries |
| Eden AI | 360 | 78 | 428 provider × subfeature combinations, 10 modalities |
| OpenRouter | 356 | 106 | 446 identifiers before variants |
| llmgateway.io | 269 | 52 | 571 routes |
| Novita AI | 117 | — | |
| Cortecs | 107 | 15 | 196 routes |

Measured provider counts came in **higher** than the vendor floors in every
case (OpenRouter 106 vs a stated 60+; Eden AI 78 vs a stated 50+).

Employee bands and social snapshots are recorded for 19 gateways, all captured
on the same date. Exact follower counts carry `verified`; rounded ones carry
`estimated`. Social reach is kept out of the default table columns and out of
every ranking — it lives in a Traction block on profiles and expanded rows.

Unresolved fields are still classified rather than lumped together. Run
`npm run audit` for the split and [content/data-todo.md](content/data-todo.md)
for what would close each one.

## Brand assets

`public/logos/` is empty by design. `GatewayLogo` renders a stable monogram whenever a
record has `logo: null`, so no entry depends on hotlinking a third party's image. Drop a
locally stored, legally usable file into `public/logos/` and set `logo: "/logos/x.svg"` on
the record to use it.

## Commands

```bash
npm run dev        # development server
npm run build      # production build (49 static routes)
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run audit      # dataset integrity + unresolved-field classification
```

## Accessibility and performance notes

Pages are server components; client JavaScript is limited to the table interactions,
search dialog, mobile navigation and theme toggle. Status is never conveyed by colour
alone — every badge carries text, and every icon-only control has an accessible label.
The comparison table uses `aria-sort` on sortable headers, `aria-expanded` on row
toggles, a sticky header and sticky first column, and becomes one card per gateway below
the `md` breakpoint rather than a thirteen-column table.
