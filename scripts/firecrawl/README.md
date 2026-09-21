# Firecrawl research scripts

Tooling for refreshing gateway data from public vendor pages with
[Firecrawl](https://www.firecrawl.dev). These scripts produce **research
material**, not site data: nothing they write is read by the website, and no
script copies their output into `data/gateways.ts`.

```text
Gateway URLs (derived from data/gateways.ts)      npm run firecrawl:targets
   + pages found on each site map                  npm run firecrawl:discover   (opt-in)
     ↓
Firecrawl  scrape → Markdown + JSON in one call    npm run firecrawl:extract
           scrape → Markdown only                  npm run firecrawl:collect
     ↓
research/firecrawl/raw/<date>/<gateway>/…          retrieved pages (git-ignored)
research/firecrawl/candidates/<gateway>.json       structured claims + evidence
     ↓
Candidate vs dataset, field by field               npm run firecrawl:diff
     ↓
Human verification against the cited page
     ↓
data/gateways.ts  (edited by hand, with a Field status and source id)
```

Model counts follow a separate path, because they are counted rather than
read: `npm run measure:models` enumerates each public model endpoint the
dataset cites and applies the counting rule step by step (see
[`scripts/measure/`](../measure/models.ts)). It does not use Firecrawl.

## Setup

1. Create a Firecrawl API key and copy the example file:

   ```bash
   cp .env.example .env
   # then set FIRECRAWL_API_KEY=fc-...
   ```

   `.env` is git-ignored. The key is read from the environment or from `.env`;
   it is never written to disk or printed.

2. No extra dependencies. The scripts run with `tsx`, which the project already
   uses for `npm run audit`, and call the Firecrawl REST API (v2) with `fetch`.

   Optional: `FIRECRAWL_API_URL` overrides the API base URL (self-hosted
   instances or a different API version). Default `https://api.firecrawl.dev/v2`.

## Commands

| Command | Calls Firecrawl | What it does |
| --- | --- | --- |
| `npm run firecrawl:targets` | no | Prints the URLs that would be collected. |
| `npm run firecrawl:discover` | one `map` per site | Lists pricing, legal, documentation and security pages on each vendor's site that the dataset does not cite yet, into `research/firecrawl/discovered/<slug>.json`. |
| `npm run firecrawl:extract` | one `scrape` per page | Fetches each page once with Markdown **and** JSON formats: writes the raw capture under `research/firecrawl/raw/<date>/` and merges the claims per gateway into `research/firecrawl/candidates/<slug>.json`. |
| `npm run firecrawl:collect` | one `scrape` per page | Markdown and metadata only. Use when no extraction is wanted; running collect and then extract fetches every page twice. |
| `npm run firecrawl:diff` | no | Prints each candidate next to the value the dataset records, with a verdict per candidate. |
| `npm run measure:models` | no (vendor endpoints) | Enumerates public model endpoints and counts them with the dataset rule. |
| `npm test` | no | Unit tests for flag parsing, claim merging, comparison verdicts, page classification and the counting rule. |

Flags (pass after `--`):

- `--gateway eden-ai,portkey` limits a run to one or more slugs (every script).
- `--limit 5` stops after the first N targets (collect only).
- `--pause 1500` sets the delay between requests in milliseconds (default 800).
- `--skip-existing` skips pages already captured today (collect) or gateways whose
  candidates file was generated today (extract), so an interrupted run can resume
  without paying again.
- `--include-discovered` adds the pages found by `firecrawl:discover` to the targets
  (targets, collect, extract). Without it, only URLs the dataset cites are fetched.
- `--max 8` keeps at most N discovered pages per gateway (discover, default 6).
- `--only-differences` hides fields whose candidates all match; `--json` prints the
  comparison as JSON (diff).

## What is collected

Targets come from the canonical dataset, so a gateway added to
`data/gateways.ts` is picked up automatically. For each gateway:

- the official `website`,
- every source of kind `documentation`, `pricing` or `legal` that has a URL,
- with `--include-discovered`, the pages listed in `research/firecrawl/discovered/<slug>.json`.

Social profiles, registries and the project's own baseline are excluded: they
are not useful as scraped Markdown and several forbid automated access.
Gateways whose website is not confirmed in the dataset are listed as skipped at
the end of a run rather than guessed.

`discover` maps each site once (one credit), keeps links on the same
registrable host, drops anything the dataset already cites, and classifies the
rest by path: `/pricing`, `/terms` `/privacy` `/legal` `/dpa`, `/security`
`/trust` `/compliance`, and `docs.` or `/docs`. It takes one page of each kind
first, shallowest path first, then fills up to `--max`. A discovered URL is a
suggestion; it becomes a `Source` on a record only when a person cites it.

## Output

**Raw captures** (`research/firecrawl/raw/<date>/<gateway>/`) keep the
Markdown Firecrawl returned, prefixed with the source URL and retrieval date,
plus a `.meta.json` with the final URL after redirects, HTTP status, page title
and description. An `index.json` per run lists every capture and failure. Both
`collect` and `extract` write here in the same layout. This directory is
git-ignored because it is large and reproducible.

**Candidates** (`research/firecrawl/candidates/<gateway>.json`) hold, per
field, every claim any page made, each with:

- `value` as extracted,
- `evidence`, the verbatim quote the model pointed at,
- `sourceUrl`, `sourceKind` and `retrieved`.

Disagreements between pages are kept side by side. `status` is always
`"candidate"`.

**Diff** prints, per gateway and field, the recorded value with its status and
then each candidate with a mark:

```text
=  matches the dataset      ≠  differs, open the page      +  dataset has no value
?  free text, compare by hand                             ·  no dataset column
```

Enumerations, entity names and lists are compared after normalising case and
punctuation ("SOC 2 Type II" equals "soc2-type-ii", "B.V." equals "BV"); counts
compare the first number in each figure; free text such as an EU residency
sentence is always `?`. A mark is a hint for the reviewer, never a decision.

**Measurements** (`research/measurements/<date>/<slug>.json`) hold the raw
identifiers an endpoint returned, each step of the counting rule with the
identifiers it removed, and the final count, so a figure in the dataset can be
re-derived. The script prints the `measured(...)` line to paste into the
metric's `history`. Endpoints that need a key read `MODELS_API_KEY_<SLUG>`
(for example `MODELS_API_KEY_EDEN_AI`) from the environment or `.env`.

## Fields

The extraction schema lives in `schema.ts`. It currently asks for:

OpenAI compatibility (and which endpoints) · vendor-stated model, provider and
endpoint counts, exactly as written · EU processing claims · gateway regions ·
certifications · deployment options · zero data retention · pricing
transparency · legal entity · governing law.

To collect another field, add a property to `GATEWAY_EXTRACTION_SCHEMA` and to
the `ExtractedGateway` type in the same file, and a row to `MAPPING` in
`compare.ts` naming the dataset field it should be compared with (or `null`).
`collect.ts` and `extract.ts` need no change.

## Layout

| File | Role |
| --- | --- |
| `env.ts` | `.env` loader and API configuration. Never prints the key. |
| `client.ts` | Thin REST client: `scrape` (Markdown, HTML, JSON formats) and `map`. Retries 408/429/5xx. |
| `schema.ts` | Extraction schema, prompt and the `ExtractedGateway` type. |
| `targets.ts` | Derives targets from the dataset; loads discovered pages; CLI for `firecrawl:targets`. |
| `args.ts` | Flag parsing shared by every script. |
| `capture.ts` | Writes a retrieved page to `raw/<date>/`. Shared by collect and extract. |
| `claims.ts` | Candidate types and claim merging. |
| `compare.ts` | Pure candidate-vs-dataset comparison used by `diff.ts`. |
| `fs.ts` | Output roots and small file helpers. |
| `collect.ts` `extract.ts` `discover.ts` `diff.ts` | The four CLIs. |
| `*.test.ts` | Unit tests, run with `npm test`. |

## Rules that apply to everything here

- **Scraped values are not data.** A candidate becomes a value in
  `data/gateways.ts` only after someone has opened the cited page and confirmed
  the quote, and only with the appropriate `Field` status (`vendor-stated` for
  a marketing page, `verified` for a legal page or an exercised endpoint) and a
  source id on the record.
- **Counts are still counted, not scraped.** A vendor's "500+ models" is
  recorded as an `official` floor. Measured counts come from
  `npm run measure:models`, which applies the counting rule in
  `data/gateways.ts` and records every identifier it collapsed.
- **Routes, endpoints, models and providers stay separate.** The schema asks for
  each as the vendor words it; do not convert one into another.
- **Never commit a key.** `.env` is ignored; `.env.example` has no value.
