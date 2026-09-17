# openrouteralternatives.eu

A source-driven comparison directory of OpenRouter alternatives: AI gateways, model
routers and multi-provider AI APIs, compared by model coverage, provider diversity,
OpenAI API compatibility, EU jurisdiction, data residency, infrastructure, deployment
and company characteristics.

Production domain: <https://openrouteralternatives.eu>
Repository: <https://github.com/openrouteralternatives/openrouteralternatives-site>

## Editorial contract

The site publishes **no overall score** and names no single "best" alternative. Two rules
follow from that and are enforced in code rather than by convention:

1. **Nothing is ranked without a stated, measurable criterion.** Each category in
   [`data/categories.ts`](data/categories.ts) carries its own `inclusionCriterion`,
   `rankingCriterion` and `rankingMetric`. A category whose metric is `none` renders as a
   list; a ranked category only positions gateways that actually hold a value for the
   metric. Where no member holds one, the page says so instead of ordering by something
   else. Score-ranked categories (`rankingMetric: "score"`) declare the recorded
   attributes they weigh in `signals`, print that declaration on the page, and are
   computed by [`lib/ranking.ts`](lib/ranking.ts) from [`lib/signals.ts`](lib/signals.ts)
   — code that never refers to a gateway by name. `npm run audit` fails if a record's
   declared category list drifts from what the filters compute.
2. **Uncertainty is displayed, never smoothed over.** Every value is a
   `Field<T>` ([`types/field.ts`](types/field.ts)) carrying a `DataStatus`. A field with
   no supported value has `value: null` and renders its status — `Not recorded`,
   `Not disclosed`, `Not applicable` — with a tooltip explaining what that means. No
   component substitutes a placeholder number.

Default table sort is alphabetical by gateway name. Sorting keeps rows without a value at
the bottom in **both** directions, so missing data can never be promoted by reversing the
sort.

## Stack

Next.js 16 (App Router, React 19) · TypeScript strict · Tailwind CSS v4 ·
TanStack Table v9 · Radix primitives · Lucide icons. Fully static: no database, no
backend API, no runtime data fetching.

## Site structure

The homepage is the product. It carries, in order: hero and dataset composition, the
comparison table with its legend, the methodology that explains how to read the table
(definitions always visible, longer explanations in disclosure blocks), category
discovery cards with the two measurable rankings, the EU-company-versus-EU-hosted
explainer, use-case cards, a featured cross-section, how to contribute, and the blog
teaser.

Primary navigation has three entries: **Compare** (the homepage), **Gateways** and
**Blog**. Categories are reached through the homepage cards and the footer.

## Layout

```
app/                    routes; every page is statically generated
  page.tsx              the one-page comparison experience
  compare/              full-width variant of the comparison table
  gateways/[slug]/      profile pages, generated from the dataset
  categories/<slug>/    eight category routes over one shared template
  blog/ blog/[slug]/    blog index (empty state until the first article) and articles
  sitemap.ts robots.ts not-found.tsx error.tsx loading.tsx
components/
  comparison/           table, columns, filters, expanded row, mobile cards
  gateways/             profile, cards, logo
  categories/           category template, grid, ranking block
  home/                 hero, trust strip, methodology, EU explainer, contribute, blog teaser
  layout/ ui/           header, footer, search, primitives
data/                   the only place facts live
  gateways.ts           canonical dataset
  categories.ts         category definitions and their criteria
  sources.ts            source hierarchy shown in the methodology section
  blog.ts               published articles (empty until the first one)
  changelog.ts          dated record of dataset changes (data history, not a public page)
  self-hosted.ts site.ts
lib/                    ranking, signals, filtering, formatting, SEO, table config
types/                  shared types
scripts/
  audit-dataset.ts      dataset integrity audit (npm run audit)
  firecrawl/            research tooling for refreshing gateway data (see its README)
research/firecrawl/     output of the Firecrawl scripts; raw captures are git-ignored
public/logos/           locally stored gateway marks with a provenance table
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

Model counts are dated observations, not attributes. Append a `measured(...)` observation
to the metric's history rather than editing an existing figure:

```ts
models: metric(
  measured(1102, "2026-09-22", { scope: "llm", sourceIds: ["models-endpoint"] }),
  [measured(1038, "2026-09-15", { scope: "llm", sourceIds: ["models-endpoint"] })],
),
```

The table, the homepage ranking and the category pages all read the newest entry; the
profile page shows the history. Add a matching entry to
[`data/changelog.ts`](data/changelog.ts) so the superseded figure stays on record.

### OpenAI compatibility

`openaiCompatible` is a `Field<"yes" | "partial" | "no" | "unknown">`. It is recorded only
from the vendor's documentation or from an endpoint this project exercised, with a source
id on the record, and it is shown as a label in its own table column. It is never used to
rank anything. A record whose documentation has not been checked keeps `value: null`,
which renders as "Unknown" with a not-recorded status — a different statement from a
documented `"unknown"`.

### Routes and endpoints

`routes` (model × provider combinations) and `endpoints` (individually addressable API
entries, using the vendor's own definition) are two `Metric` fields like `models` and
`providers`. They share one table column, "Routes / endpoints": `routesOrEndpoints()` in
[`lib/gateway.ts`](lib/gateway.ts) shows whichever carries a figure, labelled, and the
expanded row and profile show the second one where a vendor publishes both. Neither is
ever computed from the other or from modalities.

### Applying a research pass

The September 17, 2026 verified research is the current source of truth for vendor
figures and company attributes. Where it publishes a figure, that figure is the metric's
`current` observation; this project's own endpoint measurements stay in `history` and
still drive the measured rankings. Where it publishes none, the measurement remains
current, and rankings prefer a measured count over a vendor figure of any date. Counts copied
from vendor pages are shown as floors rounded down to the nearest ten (72 → "70+", exact value
kept for sorting); integration counts of customer-configured gateways carry the `documented`
status and are shown but never ranked against hosted catalogues. Sorting is semantic throughout: jurisdiction groups by EU / UK / US / other before
country name, model and route counts sort on their numeric value (a floor such as 700+ on
700), employees on the band's lower bound, and ZDR, ownership and pricing on the orders
declared in [`lib/taxonomy.ts`](lib/taxonomy.ts).

### Adding a category

Add a definition to `data/categories.ts` and a four-line route under
`app/categories/<slug>/page.tsx` following the existing pattern. The page body, ranking,
table, cards and JSON-LD come from the shared template.

### Adding a blog article

Append a `BlogPost` to [`data/blog.ts`](data/blog.ts). The index, the article route, the
sitemap and the homepage teaser all read that list; until it has an entry, `/blog` shows
an intentional empty state and no placeholder cards.

## Refreshing data with Firecrawl

[`scripts/firecrawl/`](scripts/firecrawl/README.md) collects each gateway's public pages
through the Firecrawl API and extracts structured *candidates* with verbatim evidence and
source URLs. The scripts read `FIRECRAWL_API_KEY` from the environment or `.env` (see
`.env.example`), write to `research/firecrawl/`, and never touch `data/gateways.ts`.
Every candidate is verified against its cited page by a person before it is recorded in
the canonical dataset.

```bash
npm run firecrawl:targets   # list the URLs that would be collected, no API call
npm run firecrawl:collect   # Markdown + metadata per page
npm run firecrawl:extract   # schema-guided candidates per gateway
```

## Keeping bias out

Every vendor is evaluated with the same published methodology, and the
protections are structural rather than promised: the ranking criterion for
every category is printed on that category's own page, the default table order
is alphabetical, measured and provider-stated counts are never mixed inside a
ranking, and no gateway is excluded from a list it qualifies for.
`npm run audit` enforces the structural parts.

## Data status in the current revision

Three research passes are recorded in [`data/changelog.ts`](data/changelog.ts):

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

### Counting rules the code enforces

- **Models, routes, endpoints and providers are four different quantities.**
  Portkey's published 1,600+ counts endpoints, so it is recorded as
  `endpoints` and its model count reads "Different metric". Requesty's 684 are
  endpoints; its 545 deduplicated models are counted separately.
- **Rankings only compare like with like.** `RANKING_RULES` in
  [lib/ranking.ts](lib/ranking.ts) declares which statuses and which scope each
  ranking may consume. Provider-stated figures are ranked in a separate list on
  the same page, never merged.
- **History is never overwritten.** Superseded measurements and a provider's
  own figure both stay in `history` and are listed on the profile.

Unresolved fields are classified rather than lumped together. Run
`npm run audit` for the split and [content/data-todo.md](content/data-todo.md)
for what would close each one.

## Brand assets

`public/logos/` holds the marks for 24 of the 29 gateways, each taken from the vendor's
own website and listed with its origin in [`public/logos/README.md`](public/logos/README.md).
`GatewayLogo` renders a stable monogram for the five records with `logo: null`, so no
entry depends on hotlinking a third party's image, and `npm run audit` fails if a record
points at a file that does not exist.

## Commands

```bash
npm run dev                # development server
npm run build              # production build
npm run start              # serve the production build
npm run typecheck          # tsc --noEmit
npm run lint               # eslint
npm run audit              # dataset integrity + unresolved-field classification
npm run firecrawl:targets  # Firecrawl: list collectable URLs (no API call)
npm run firecrawl:collect  # Firecrawl: capture pages to research/firecrawl/raw
npm run firecrawl:extract  # Firecrawl: write candidates to research/firecrawl/candidates
```

## Accessibility and performance notes

Pages are server components; client JavaScript is limited to the table interactions,
search dialog, mobile navigation and theme toggle. Status is never conveyed by colour
alone — every badge carries text, and every icon-only control has an accessible label.
The comparison table uses `aria-sort` on sortable headers, `aria-expanded` on row
toggles, a sticky header and sticky first column, and becomes one card per gateway below
the `md` breakpoint rather than a fifteen-column table. Methodology and EU-explainer
details use native disclosure elements, so they need no JavaScript.
