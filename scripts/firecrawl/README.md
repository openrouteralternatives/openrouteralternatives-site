# Firecrawl research scripts

Tooling for refreshing gateway data from public vendor pages with
[Firecrawl](https://www.firecrawl.dev). These scripts produce **research
material**, not site data: nothing they write is read by the website, and no
script copies their output into `data/gateways.ts`.

```text
Gateway URLs (derived from data/gateways.ts)
     ↓
Firecrawl  scrape → Markdown + metadata          npm run firecrawl:collect
           scrape → JSON against schema.ts       npm run firecrawl:extract
     ↓
research/firecrawl/raw/<date>/<gateway>/…        retrieved pages (git-ignored)
research/firecrawl/candidates/<gateway>.json     structured claims + evidence
     ↓
Human / agent verification against the cited page
     ↓
data/gateways.ts  (edited by hand, with a Field status and source id)
```

## Setup

1. Create a Firecrawl API key and copy the example file:

   ```bash
   cp .env.example .env
   # then set FIRECRAWL_API_KEY=fc-...
   ```

   `.env` is git-ignored. The key is read from the environment or from `.env`;
   it is never written to disk or printed.

2. No extra dependencies. The scripts run with `tsx`, which the project already
   uses for `npm run audit`, and call the Firecrawl REST API with `fetch`.

   Optional: `FIRECRAWL_API_URL` overrides the API base URL (self-hosted
   instances or a different API version). Default `https://api.firecrawl.dev/v2`.

## Commands

| Command | What it does |
| --- | --- |
| `npm run firecrawl:targets` | Prints the URLs that would be collected, without calling Firecrawl. |
| `npm run firecrawl:collect` | Scrapes each target to Markdown and stores it with metadata under `research/firecrawl/raw/<date>/`. |
| `npm run firecrawl:extract` | Runs a schema-guided JSON extraction per page and merges the claims per gateway into `research/firecrawl/candidates/<slug>.json`. |

Flags (pass after `--`):

- `--gateway eden-ai,portkey` limits a run to one or more slugs.
- `--limit 5` stops after the first N targets (collect only).
- `--pause 1500` sets the delay between requests in milliseconds (default 800).

## What is collected

Targets come from the canonical dataset, so a gateway added to
`data/gateways.ts` is picked up automatically. For each gateway:

- the official `website`,
- every source of kind `documentation`, `pricing` or `legal` that has a URL.

Social profiles, registries and the project's own baseline are excluded: they
are not useful as scraped Markdown and several forbid automated access.
Gateways whose website is not confirmed in the dataset are listed as skipped at
the end of a run rather than guessed.

## Output

**Raw captures** (`research/firecrawl/raw/<date>/<gateway>/`) keep the
Markdown Firecrawl returned, prefixed with the source URL and retrieval date,
plus a `.meta.json` with the final URL after redirects, HTTP status, page title
and description. An `index.json` per run lists every capture and failure. This
directory is git-ignored because it is large and reproducible.

**Candidates** (`research/firecrawl/candidates/<gateway>.json`) hold, per
field, every claim any page made, each with:

- `value` as extracted,
- `evidence`, the verbatim quote the model pointed at,
- `sourceUrl`, `sourceKind` and `retrieved`.

Disagreements between pages are kept side by side. `status` is always
`"candidate"`.

## Fields

The extraction schema lives in `schema.ts`. It currently asks for:

OpenAI compatibility (and which endpoints) · vendor-stated model, provider and
endpoint counts, exactly as written · EU processing claims · gateway regions ·
certifications · deployment options · zero data retention · pricing
transparency · legal entity · governing law.

To collect another field, add a property to `GATEWAY_EXTRACTION_SCHEMA` and to
the `ExtractedGateway` type in the same file. `collect.ts` and `extract.ts`
need no change.

## Rules that apply to everything here

- **Scraped values are not data.** A candidate becomes a value in
  `data/gateways.ts` only after someone has opened the cited page and confirmed
  the quote, and only with the appropriate `Field` status (`vendor-stated` for
  a marketing page, `verified` for a legal page or an exercised endpoint) and a
  source id on the record.
- **Counts are still counted, not scraped.** A vendor's "500+ models" is
  recorded as an `official` floor. Measured counts continue to come from
  enumerating public model endpoints, following the counting rule in
  `data/gateways.ts`.
- **Routes, endpoints, models and providers stay separate.** The schema asks for
  each as the vendor words it; do not convert one into another.
- **Never commit a key.** `.env` is ignored; `.env.example` has no value.
